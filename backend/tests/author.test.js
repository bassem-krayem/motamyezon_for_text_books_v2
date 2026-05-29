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
import Author from '../models/authorModel.js';
import Category from '../models/categoryModel.js';
import Series from '../models/seriesModel.js';
import Book from '../models/bookModel.js';

describe('Author API Tests', () => {
  setupTestDB();
  let adminToken;
  let uploaderToken;
  let userToken;

  // Authors are created/deleted by admins and updated by admins/uploaders, so
  // we prepare a token for every role to exercise the access rules. These
  // users are created once: cleanupDatabase() only clears content models, so
  // the auth users (and their tokens) stay valid for the whole suite.
  before(async () => {
    ({ token: adminToken } = await createAdminUserAndGetToken());
    ({ token: uploaderToken } = await createUploaderUserAndGetToken());
    ({ token: userToken } = await createTestUserAndGetToken());
  });

  beforeEach(async () => {
    await cleanupDatabase(Author, Category, Series, Book);
  });

  // ==================== CREATE AUTHOR TESTS ====================
  describe('POST /api/v1/authors (Admin Only)', () => {
    it('should create an author successfully (admin)', async () => {
      const res = await authenticatedRequest(adminToken)
        .post('/api/v1/authors')
        .send({
          name: 'نجيب محفوظ',
          bio: 'كاتب مصري معروف',
        });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.data.name).to.equal('نجيب محفوظ');
      expect(res.body.data).to.have.property('id');
    });

    it('should allow creating author without bio', async () => {
      const res = await authenticatedRequest(adminToken)
        .post('/api/v1/authors')
        .send({ name: 'نجيب محفوظ' });

      expect(res.status).to.equal(201);
      expect(res.body.data.name).to.equal('نجيب محفوظ');
    });

    it('should fail if name is missing', async () => {
      const res = await authenticatedRequest(adminToken)
        .post('/api/v1/authors')
        .send({ bio: 'Author bio without name' });

      expect(res.status).to.equal(400);
      expect(res.body.status).to.equal('fail');
      expect(res.body.message).to.include('required');
    });

    it('should fail if name is an empty string', async () => {
      const res = await authenticatedRequest(adminToken)
        .post('/api/v1/authors')
        .send({ name: '   ' });

      expect(res.status).to.equal(400);
      expect(res.body.status).to.equal('fail');
    });

    it('should reject unknown fields on create', async () => {
      const res = await authenticatedRequest(adminToken)
        .post('/api/v1/authors')
        .send({ name: 'Author', hacker: true });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('not allowed');
    });

    it('should fail without authentication', async () => {
      const res = await getRequest()
        .post('/api/v1/authors')
        .send({ name: 'Test Author', bio: 'Test bio' });

      expect(res.status).to.equal(401);
    });

    it('should forbid a regular user from creating an author', async () => {
      const res = await authenticatedRequest(userToken)
        .post('/api/v1/authors')
        .send({ name: 'Test Author' });

      expect(res.status).to.equal(403);
      expect(res.body.message).to.include('permission');
    });

    it('should forbid an uploader from creating an author (admin only)', async () => {
      const res = await authenticatedRequest(uploaderToken)
        .post('/api/v1/authors')
        .send({ name: 'Test Author' });

      expect(res.status).to.equal(403);
    });
  });

  // ==================== GET AUTHORS TESTS ====================
  describe('GET /api/v1/authors', () => {
    beforeEach(async () => {
      await Author.create({
        name: 'مصطفى لطفي المنفلوطي',
        bio: 'كاتب وشاعر مصري',
      });
      await Author.create({ name: 'طه حسين', bio: 'أديب مصري' });
    });

    it('should retrieve all authors (public, no auth required)', async () => {
      const res = await getRequest().get('/api/v1/authors');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.be.instanceof(Array);
      expect(res.body.data).to.have.lengthOf(2);
      expect(res.body.results).to.equal(2);
    });

    it('should return authors with correct structure', async () => {
      const res = await getRequest().get('/api/v1/authors');

      expect(res.status).to.equal(200);
      res.body.data.forEach((author) => {
        expect(author).to.have.property('id');
        expect(author).to.have.property('name');
        // The custom toJSON transform must never leak the internal _id / __v
        expect(author).to.not.have.property('_id');
        expect(author).to.not.have.property('__v');
      });
    });

    it('should paginate authors correctly', async () => {
      const res = await getRequest()
        .get('/api/v1/authors')
        .query({ page: 1, limit: 1 });

      expect(res.status).to.equal(200);
      expect(res.body.data).to.have.lengthOf(1);
    });

    it('should return the second page', async () => {
      const res = await getRequest()
        .get('/api/v1/authors')
        .query({ page: 2, limit: 1 });

      expect(res.status).to.equal(200);
      expect(res.body.data).to.have.lengthOf(1);
    });

    it('should sort authors by name', async () => {
      const res = await getRequest()
        .get('/api/v1/authors')
        .query({ sort: 'name' });

      expect(res.status).to.equal(200);
      const names = res.body.data.map((a) => a.name);
      expect(names).to.deep.equal([...names].sort());
    });
  });

  // ==================== GET SINGLE AUTHOR TESTS ====================
  describe('GET /api/v1/authors/:id', () => {
    let author;
    let category;

    beforeEach(async () => {
      author = await Author.create({
        name: 'مصطفى لطفي المنفلوطي',
        bio: 'كاتب وشاعر مصري',
      });

      category = await Category.create({ name: 'قصص قصيرة' });

      await Series.create({
        name: 'سلسلة القصص الأدبية',
        description: 'مجموعة من القصص الهادفة',
        author: author.id,
      });
      await Series.create({
        name: 'سلسلة النقد الأدبي',
        description: 'تحليلات نقدية',
        author: author.id,
      });

      await Book.create({
        title: 'أرخص ليالي',
        description: 'مجموعة قصصية',
        author: author.id,
        categories: [category.id],
      });
      await Book.create({
        title: 'النداهة',
        description: 'قصة خيالية',
        author: author.id,
        categories: [category.id],
      });
    });

    it('should retrieve author with all books and series', async () => {
      const res = await getRequest().get(`/api/v1/authors/${author.id}`);

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');

      const { data } = res.body;
      expect(data.name).to.equal('مصطفى لطفي المنفلوطي');
      expect(data.bio).to.equal('كاتب وشاعر مصري');
      expect(data.series).to.be.instanceof(Array).with.lengthOf(2);
      expect(data.books).to.be.instanceof(Array).with.lengthOf(2);
    });

    it('should include series with correct data', async () => {
      const res = await getRequest().get(`/api/v1/authors/${author.id}`);

      const seriesNames = res.body.data.series.map((s) => s.name);
      expect(seriesNames).to.include.members([
        'سلسلة القصص الأدبية',
        'سلسلة النقد الأدبي',
      ]);
    });

    it('should include books with correct data', async () => {
      const res = await getRequest().get(`/api/v1/authors/${author.id}`);

      const bookTitles = res.body.data.books.map((b) => b.title);
      expect(bookTitles).to.include.members(['أرخص ليالي', 'النداهة']);
    });

    it('should return 404 for non-existent author', async () => {
      const res = await getRequest().get('/api/v1/authors/99999999');

      expect(res.status).to.equal(404);
      expect(res.body.status).to.equal('fail');
      expect(res.body.message).to.include('No author found');
    });
  });

  // ==================== UPDATE AUTHOR TESTS ====================
  describe('PATCH /api/v1/authors/:id (Admin/Uploader Only)', () => {
    let author;

    beforeEach(async () => {
      author = await Author.create({
        name: 'مصطفى لطفي المنفلوطي',
        bio: 'كاتب وشاعر مصري',
      });
    });

    it('should update author successfully (admin)', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/authors/${author.id}`)
        .send({ name: 'مصطفى المنفلوطي', bio: 'كاتب مشهور' });

      expect(res.status).to.equal(200);
      expect(res.body.data.name).to.equal('مصطفى المنفلوطي');
      expect(res.body.data.bio).to.equal('كاتب مشهور');
    });

    it('should allow an uploader to update an author', async () => {
      const res = await authenticatedRequest(uploaderToken)
        .patch(`/api/v1/authors/${author.id}`)
        .send({ name: 'Uploader Edit' });

      expect(res.status).to.equal(200);
      expect(res.body.data.name).to.equal('Uploader Edit');
    });

    it('should allow partial update (only name)', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/authors/${author.id}`)
        .send({ name: 'Updated Name' });

      expect(res.status).to.equal(200);
      expect(res.body.data.name).to.equal('Updated Name');
      // bio should be untouched
      expect(res.body.data.bio).to.equal('كاتب وشاعر مصري');
    });

    it('should return 404 for non-existent author', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch('/api/v1/authors/99999999')
        .send({ name: 'Updated Name' });

      expect(res.status).to.equal(404);
      expect(res.body.message).to.include('No author found');
    });

    it('should fail without authentication', async () => {
      const res = await getRequest()
        .patch(`/api/v1/authors/${author.id}`)
        .send({ name: 'Updated Name' });

      expect(res.status).to.equal(401);
    });

    it('should forbid a regular user from updating an author', async () => {
      const res = await authenticatedRequest(userToken)
        .patch(`/api/v1/authors/${author.id}`)
        .send({ name: 'Updated Name' });

      expect(res.status).to.equal(403);
    });
  });

  // ==================== DELETE AUTHOR TESTS ====================
  describe('DELETE /api/v1/authors/:id (Admin Only)', () => {
    let author;
    let book;

    beforeEach(async () => {
      author = await Author.create({ name: 'Test Author', bio: 'Test bio' });
      book = await Book.create({
        title: 'Test Book',
        description: 'Test description',
        author: author.id,
      });
    });

    it('should delete author successfully (admin)', async () => {
      const res = await authenticatedRequest(adminToken).delete(
        `/api/v1/authors/${author.id}`,
      );

      expect(res.status).to.equal(204);

      // Verify it is gone (query by the custom string `id`, not `_id`)
      const stillThere = await Author.findOne({ id: author.id });
      expect(stillThere).to.be.null;
    });

    it('should keep existing books intact when their author is deleted', async () => {
      // The Author model intentionally does NOT cascade-delete or null the
      // author on books (author is a required field), so the book survives
      // with its original author reference.
      await authenticatedRequest(adminToken).delete(
        `/api/v1/authors/${author.id}`,
      );

      const bookAfterDelete = await Book.findOne({ id: book.id });
      expect(bookAfterDelete).to.exist;
      expect(bookAfterDelete.author).to.equal(author.id);
    });

    it('should return 404 for non-existent author', async () => {
      const res = await authenticatedRequest(adminToken).delete(
        '/api/v1/authors/99999999',
      );

      expect(res.status).to.equal(404);
    });

    it('should fail without authentication', async () => {
      const res = await getRequest().delete(`/api/v1/authors/${author.id}`);

      expect(res.status).to.equal(401);
    });

    it('should forbid a regular user from deleting an author', async () => {
      const res = await authenticatedRequest(userToken).delete(
        `/api/v1/authors/${author.id}`,
      );

      expect(res.status).to.equal(403);
    });

    it('should forbid an uploader from deleting an author (admin only)', async () => {
      const res = await authenticatedRequest(uploaderToken).delete(
        `/api/v1/authors/${author.id}`,
      );

      expect(res.status).to.equal(403);
    });
  });

  // ==================== MASS ASSIGNMENT PROTECTION ====================
  // The Joi schemas use `.unknown(false)`, so any field outside the allowed
  // set is REJECTED with 400 (not silently stripped). These tests lock in
  // that contract.
  describe('PATCH /api/v1/authors/:id - Mass Assignment Protection', () => {
    let author;

    beforeEach(async () => {
      author = await Author.create({ name: 'Test Author', bio: 'Test bio' });
    });

    it('should reject an injected __v field with 400', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/authors/${author.id}`)
        .send({ name: 'Updated Name', __v: 999 });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('not allowed');
    });

    it('should reject an injected id field and leave the id unchanged', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/authors/${author.id}`)
        .send({ name: 'Updated Name', id: '99999999' });

      expect(res.status).to.equal(400);

      const fromDb = await Author.findOne({ id: author.id });
      expect(fromDb).to.exist;
      expect(fromDb.id).to.equal(author.id);
    });

    it('should reject unknown fields like randomField with 400', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/authors/${author.id}`)
        .send({ name: 'New Name', randomField: 'should be rejected' });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('not allowed');
    });

    it('should accept an update that only contains allowed fields', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/authors/${author.id}`)
        .send({ name: 'New Name', bio: 'New Bio' });

      expect(res.status).to.equal(200);
      expect(res.body.data.name).to.equal('New Name');
      expect(res.body.data.bio).to.equal('New Bio');
    });
  });
});
