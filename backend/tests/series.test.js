import { expect } from 'chai';
import {
  setupTestDB,
  getRequest,
  createTestUserAndGetToken,
  createAdminUserAndGetToken,
  createUploaderUserAndGetToken,
  authenticatedRequest,
  cleanupDatabase,
} from './setupTests.js';
import Series from '../models/seriesModel.js';
import Author from '../models/authorModel.js';
import Book from '../models/bookModel.js';
import Category from '../models/categoryModel.js';

describe('Series API Tests', () => {
  setupTestDB();
  let adminToken;
  let uploaderToken;
  let userToken;
  let author;

  before(async () => {
    ({ token: adminToken } = await createAdminUserAndGetToken());
    ({ token: uploaderToken } = await createUploaderUserAndGetToken());
    ({ token: userToken } = await createTestUserAndGetToken());
  });

  beforeEach(async () => {
    await cleanupDatabase(Series, Author, Book, Category);
    author = await Author.create({
      name: 'أحمد خالد توفيق',
      bio: 'رائد أدب الرعب',
    });
  });

  // ==================== CREATE SERIES (Admin Only) ====================
  describe('POST /api/v1/series', () => {
    it('should create a series successfully (admin)', async () => {
      const res = await authenticatedRequest(adminToken)
        .post('/api/v1/series')
        .send({
          name: 'رجل المستحيل',
          description: 'سلسلة مغامرات بوليسية',
          author: author.id,
        });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.data.name).to.equal('رجل المستحيل');
      expect(res.body.data.author).to.equal(author.id);
    });

    it('should fail if name is missing', async () => {
      const res = await authenticatedRequest(adminToken)
        .post('/api/v1/series')
        .send({ description: 'Some series', author: author.id });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('required');
    });

    it('should fail if author is missing (author is required)', async () => {
      const res = await authenticatedRequest(adminToken)
        .post('/api/v1/series')
        .send({ name: 'Test Series', description: 'Description' });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('required');
    });

    // NOTE: The API does NOT currently verify that the referenced author
    // actually exists (no referential-integrity check), so a series can be
    // created against an unknown author id. This test documents that real
    // behaviour rather than asserting a guarantee the API doesn't provide.
    it('currently accepts a non-existent author id (no referential check)', async () => {
      const res = await authenticatedRequest(adminToken)
        .post('/api/v1/series')
        .send({ name: 'Orphan Series', author: '99999999' });

      expect(res.status).to.equal(201);
      expect(res.body.data.author).to.equal('99999999');
    });

    it('should fail without authentication', async () => {
      const res = await getRequest()
        .post('/api/v1/series')
        .send({ name: 'Test', author: author.id });

      expect(res.status).to.equal(401);
    });

    it('should forbid a regular user from creating a series', async () => {
      const res = await authenticatedRequest(userToken)
        .post('/api/v1/series')
        .send({ name: 'Test', author: author.id });

      expect(res.status).to.equal(403);
    });

    it('should forbid an uploader from creating a series (admin only)', async () => {
      const res = await authenticatedRequest(uploaderToken)
        .post('/api/v1/series')
        .send({ name: 'Test', author: author.id });

      expect(res.status).to.equal(403);
    });
  });

  // ==================== GET SERIES ====================
  describe('GET /api/v1/series', () => {
    beforeEach(async () => {
      await Series.create({
        name: 'فانتازيا',
        description: 'مغامرات خيالية',
        author: author.id,
      });
      await Series.create({
        name: 'غموض',
        description: 'قصص غموض',
        author: author.id,
      });
    });

    it('should retrieve all series', async () => {
      const res = await getRequest().get('/api/v1/series');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.be.instanceof(Array).with.lengthOf(2);
    });

    it('should paginate series', async () => {
      const res = await getRequest()
        .get('/api/v1/series')
        .query({ page: 1, limit: 1 });

      expect(res.status).to.equal(200);
      expect(res.body.data).to.have.lengthOf(1);
    });

    it('should sort series by name', async () => {
      const res = await getRequest()
        .get('/api/v1/series')
        .query({ sort: 'name' });

      expect(res.status).to.equal(200);
      const names = res.body.data.map((s) => s.name);
      expect(names).to.deep.equal([...names].sort());
    });
  });

  // ==================== GET SINGLE SERIES ====================
  describe('GET /api/v1/series/:id', () => {
    let series;

    beforeEach(async () => {
      series = await Series.create({
        name: 'فانتازيا',
        description: 'مغامرات داخل عوالم خيالية',
        author: author.id,
      });

      const category = await Category.create({ name: 'روايات' });

      await Book.create({
        title: 'أسطورة البيت',
        description: 'قصة خيالية',
        author: author.id,
        series: series.id,
        categories: [category.id],
      });
    });

    it('should retrieve series with books and populated author', async () => {
      const res = await getRequest().get(`/api/v1/series/${series.id}`);

      expect(res.status).to.equal(200);
      expect(res.body.data.name).to.equal('فانتازيا');
      expect(res.body.data.author).to.have.property('name', 'أحمد خالد توفيق');
      expect(res.body.data.books).to.be.instanceof(Array).with.lengthOf(1);
    });

    it('should return 404 for non-existent series', async () => {
      const res = await getRequest().get('/api/v1/series/99999999');

      expect(res.status).to.equal(404);
      expect(res.body.message).to.include('No series found');
    });
  });

  // ==================== UPDATE SERIES (Admin/Uploader) ====================
  describe('PATCH /api/v1/series/:id', () => {
    let series;
    let newAuthor;

    beforeEach(async () => {
      series = await Series.create({
        name: 'فانتازيا',
        description: 'مغامرات',
        author: author.id,
      });
      newAuthor = await Author.create({ name: 'أحمد مراد', bio: 'كاتب مصري' });
    });

    it('should update series successfully (admin)', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/series/${series.id}`)
        .send({ name: 'فانتازيا جديدة', description: 'وصف جديد' });

      expect(res.status).to.equal(200);
      expect(res.body.data.name).to.equal('فانتازيا جديدة');
    });

    it('should allow an uploader to update a series', async () => {
      const res = await authenticatedRequest(uploaderToken)
        .patch(`/api/v1/series/${series.id}`)
        .send({ name: 'Uploader Edit' });

      expect(res.status).to.equal(200);
      expect(res.body.data.name).to.equal('Uploader Edit');
    });

    it('should allow changing the author', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/series/${series.id}`)
        .send({ author: newAuthor.id });

      expect(res.status).to.equal(200);
      expect(res.body.data.author).to.equal(newAuthor.id);
    });

    it('should return 404 for non-existent series', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch('/api/v1/series/99999999')
        .send({ name: 'X' });

      expect(res.status).to.equal(404);
    });

    it('should fail without authentication', async () => {
      const res = await getRequest()
        .patch(`/api/v1/series/${series.id}`)
        .send({ name: 'Updated' });

      expect(res.status).to.equal(401);
    });

    it('should forbid a regular user from updating a series', async () => {
      const res = await authenticatedRequest(userToken)
        .patch(`/api/v1/series/${series.id}`)
        .send({ name: 'Updated' });

      expect(res.status).to.equal(403);
    });
  });

  // ==================== DELETE SERIES (Admin Only) ====================
  describe('DELETE /api/v1/series/:id', () => {
    let series;
    let book;

    beforeEach(async () => {
      series = await Series.create({
        name: 'Test Series',
        description: 'Test',
        author: author.id,
      });
      const category = await Category.create({ name: 'روايات' });
      book = await Book.create({
        title: 'Test Book',
        description: 'Test',
        author: author.id,
        series: series.id,
        categories: [category.id],
      });
    });

    it('should delete series successfully (admin)', async () => {
      const res = await authenticatedRequest(adminToken).delete(
        `/api/v1/series/${series.id}`,
      );

      expect(res.status).to.equal(204);

      const deleted = await Series.findOne({ id: series.id });
      expect(deleted).to.be.null;
    });

    it('should unset the series link on related books when deleted', async () => {
      // The Series model's findOneAndDelete hook $unsets `series` on every book
      // that referenced it, so the field becomes absent (undefined).
      await authenticatedRequest(adminToken).delete(
        `/api/v1/series/${series.id}`,
      );

      const updatedBook = await Book.findOne({ id: book.id });
      expect(updatedBook).to.exist;
      expect(updatedBook.series).to.not.exist;
    });

    it('should return 404 for non-existent series', async () => {
      const res = await authenticatedRequest(adminToken).delete(
        '/api/v1/series/99999999',
      );

      expect(res.status).to.equal(404);
    });

    it('should fail without authentication', async () => {
      const res = await getRequest().delete(`/api/v1/series/${series.id}`);

      expect(res.status).to.equal(401);
    });

    it('should forbid a regular user from deleting a series', async () => {
      const res = await authenticatedRequest(userToken).delete(
        `/api/v1/series/${series.id}`,
      );

      expect(res.status).to.equal(403);
    });

    it('should forbid an uploader from deleting a series (admin only)', async () => {
      const res = await authenticatedRequest(uploaderToken).delete(
        `/api/v1/series/${series.id}`,
      );

      expect(res.status).to.equal(403);
    });
  });

  // ==================== MASS ASSIGNMENT PROTECTION ====================
  describe('Mass Assignment Protection', () => {
    let series;

    beforeEach(async () => {
      series = await Series.create({
        name: 'فانتازيا',
        description: 'مغامرات',
        author: author.id,
      });
    });

    it('should reject an injected id field with 400 and keep the id unchanged', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/series/${series.id}`)
        .send({ name: 'Updated', id: '99999999' });

      expect(res.status).to.equal(400);

      const fromDb = await Series.findOne({ id: series.id });
      expect(fromDb.id).to.equal(series.id);
    });

    it('should reject unknown fields with 400', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/series/${series.id}`)
        .send({ name: 'New Name', randomField: 'ignored' });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('not allowed');
    });
  });
});
