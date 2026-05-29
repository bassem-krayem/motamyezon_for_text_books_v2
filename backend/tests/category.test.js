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
import Category from '../models/categoryModel.js';
import Book from '../models/bookModel.js';
import Author from '../models/authorModel.js';

describe('Category API Tests', () => {
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
    await cleanupDatabase(Category, Book, Author);
    author = await Author.create({
      name: 'أحمد خالد توفيق',
      bio: 'رائد أدب الرعب',
    });
  });

  // ==================== CREATE CATEGORY (Admin Only) ====================
  describe('POST /api/v1/categories', () => {
    it('should create a category successfully (admin)', async () => {
      const res = await authenticatedRequest(adminToken)
        .post('/api/v1/categories')
        .send({ name: 'تاريخ' });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.data.name).to.equal('تاريخ');
      expect(res.body.data).to.have.property('id');
    });

    it('should fail if name is missing', async () => {
      const res = await authenticatedRequest(adminToken)
        .post('/api/v1/categories')
        .send({});

      expect(res.status).to.equal(400);
      expect(res.body.status).to.equal('fail');
      expect(res.body.message).to.include('required');
    });

    it('should reject unknown fields on create', async () => {
      const res = await authenticatedRequest(adminToken)
        .post('/api/v1/categories')
        .send({ name: 'تاريخ', injected: 'x' });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('not allowed');
    });

    it('should fail without authentication', async () => {
      const res = await getRequest()
        .post('/api/v1/categories')
        .send({ name: 'Test' });

      expect(res.status).to.equal(401);
    });

    it('should forbid a regular user from creating a category', async () => {
      const res = await authenticatedRequest(userToken)
        .post('/api/v1/categories')
        .send({ name: 'Test' });

      expect(res.status).to.equal(403);
    });

    it('should forbid an uploader from creating a category (admin only)', async () => {
      const res = await authenticatedRequest(uploaderToken)
        .post('/api/v1/categories')
        .send({ name: 'Test' });

      expect(res.status).to.equal(403);
    });
  });

  // ==================== GET CATEGORIES ====================
  describe('GET /api/v1/categories', () => {
    beforeEach(async () => {
      await Category.create({ name: 'روايات' });
      await Category.create({ name: 'رعب' });
    });

    it('should retrieve all categories with bookCount', async () => {
      const res = await getRequest().get('/api/v1/categories');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.be.instanceof(Array).with.lengthOf(2);
      res.body.data.forEach((cat) => {
        expect(cat).to.have.property('bookCount');
        expect(cat).to.have.property('id');
        expect(cat).to.not.have.property('_id');
      });
    });

    it('should paginate categories', async () => {
      const res = await getRequest()
        .get('/api/v1/categories')
        .query({ page: 1, limit: 1 });

      expect(res.status).to.equal(200);
      expect(res.body.data).to.have.lengthOf(1);
    });

    it('should sort categories by name', async () => {
      const res = await getRequest()
        .get('/api/v1/categories')
        .query({ sort: 'name' });

      expect(res.status).to.equal(200);
      const names = res.body.data.map((c) => c.name);
      expect(names).to.deep.equal([...names].sort());
    });
  });

  // ==================== GET SINGLE CATEGORY ====================
  describe('GET /api/v1/categories/:id', () => {
    let category;

    beforeEach(async () => {
      category = await Category.create({ name: 'رعب' });
      await Book.create({
        title: 'أسطورة آكل البشر',
        description: 'جزء من سلسلة',
        author: author.id,
        categories: [category.id],
      });
    });

    it('should retrieve category with books and bookCount', async () => {
      const res = await getRequest().get(`/api/v1/categories/${category.id}`);

      expect(res.status).to.equal(200);
      expect(res.body.data.name).to.equal('رعب');
      expect(res.body.data.bookCount).to.equal(1);
      expect(res.body.data.books).to.be.instanceof(Array).with.lengthOf(1);
      expect(res.body.data.books[0].title).to.equal('أسطورة آكل البشر');
    });

    it('should return 404 for non-existent category', async () => {
      const res = await getRequest().get('/api/v1/categories/99999999');

      expect(res.status).to.equal(404);
      expect(res.body.message).to.include('No category found');
    });
  });

  // ==================== UPDATE CATEGORY (Admin/Uploader) ====================
  describe('PATCH /api/v1/categories/:id', () => {
    let category;

    beforeEach(async () => {
      category = await Category.create({ name: 'روايات' });
    });

    it('should update category successfully (admin)', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/categories/${category.id}`)
        .send({ name: 'روايات حديثة' });

      expect(res.status).to.equal(200);
      expect(res.body.data.name).to.equal('روايات حديثة');
    });

    it('should allow an uploader to update a category', async () => {
      const res = await authenticatedRequest(uploaderToken)
        .patch(`/api/v1/categories/${category.id}`)
        .send({ name: 'Uploader Edit' });

      expect(res.status).to.equal(200);
      expect(res.body.data.name).to.equal('Uploader Edit');
    });

    it('should require a name on update (name is mandatory)', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/categories/${category.id}`)
        .send({});

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('required');
    });

    it('should return 404 for non-existent category', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch('/api/v1/categories/99999999')
        .send({ name: 'X' });

      expect(res.status).to.equal(404);
    });

    it('should fail without authentication', async () => {
      const res = await getRequest()
        .patch(`/api/v1/categories/${category.id}`)
        .send({ name: 'Updated' });

      expect(res.status).to.equal(401);
    });

    it('should forbid a regular user from updating a category', async () => {
      const res = await authenticatedRequest(userToken)
        .patch(`/api/v1/categories/${category.id}`)
        .send({ name: 'Updated' });

      expect(res.status).to.equal(403);
    });
  });

  // ==================== DELETE CATEGORY (Admin Only) ====================
  describe('DELETE /api/v1/categories/:id', () => {
    let category;

    beforeEach(async () => {
      category = await Category.create({ name: 'تاريخ' });
    });

    it('should delete category successfully (admin)', async () => {
      const res = await authenticatedRequest(adminToken).delete(
        `/api/v1/categories/${category.id}`,
      );

      expect(res.status).to.equal(204);

      const deleted = await Category.findOne({ id: category.id });
      expect(deleted).to.be.null;
    });

    it('should pull the category id out of related books on delete', async () => {
      // The Category model's findOneAndDelete hook $pulls the category id from
      // every book's `categories` array.
      const book = await Book.create({
        title: 'كتاب مرتبط',
        author: author.id,
        categories: [category.id],
      });

      await authenticatedRequest(adminToken).delete(
        `/api/v1/categories/${category.id}`,
      );

      const bookAfter = await Book.findOne({ id: book.id });
      expect(bookAfter).to.exist;
      expect(bookAfter.categories).to.not.include(category.id);
    });

    it('should return 404 for non-existent category', async () => {
      const res = await authenticatedRequest(adminToken).delete(
        '/api/v1/categories/99999999',
      );

      expect(res.status).to.equal(404);
    });

    it('should fail without authentication', async () => {
      const res = await getRequest().delete(
        `/api/v1/categories/${category.id}`,
      );

      expect(res.status).to.equal(401);
    });

    it('should forbid a regular user from deleting a category', async () => {
      const res = await authenticatedRequest(userToken).delete(
        `/api/v1/categories/${category.id}`,
      );

      expect(res.status).to.equal(403);
    });

    it('should forbid an uploader from deleting a category (admin only)', async () => {
      const res = await authenticatedRequest(uploaderToken).delete(
        `/api/v1/categories/${category.id}`,
      );

      expect(res.status).to.equal(403);
    });
  });

  // ==================== MASS ASSIGNMENT PROTECTION ====================
  describe('Mass Assignment Protection', () => {
    let category;

    beforeEach(async () => {
      category = await Category.create({ name: 'روايات' });
    });

    it('should reject an injected id field with 400 and keep the id unchanged', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/categories/${category.id}`)
        .send({ name: 'Updated', id: '99999999' });

      expect(res.status).to.equal(400);

      const fromDb = await Category.findOne({ id: category.id });
      expect(fromDb.id).to.equal(category.id);
    });

    it('should reject unknown fields with 400', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/categories/${category.id}`)
        .send({ name: 'New Name', randomField: 'ignored' });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('not allowed');
    });
  });
});
