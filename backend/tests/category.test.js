import { assert } from 'chai';
import { setupTestDB, setupServer } from './setupTests.js';
import Author from '../models/authorModel.js';
import Category from '../models/categoryModel.js';
import Book from '../models/bookModel.js';

describe('Category API tests suite', () => {
  setupTestDB();
  const serverSetup = setupServer();
  let requester;
  let author;
  // eslint-disable-next-line no-unused-vars
  let category1;
  let category2;
  let book1;

  before(() => {
    requester = serverSetup.requester;
  });

  beforeEach(async () => {
    await Promise.all([
      Author.deleteMany(),
      Category.deleteMany(),
      Book.deleteMany(),
    ]);

    // Create base author
    author = await Author.create({
      name: 'أحمد خالد توفيق',
      bio: 'رائد أدب الرعب',
    });

    // Create categories
    category1 = await Category.create({ name: 'روايات' });
    category2 = await Category.create({ name: 'رعب' }); // will have books

    // Create a book linked to author and category2
    book1 = await Book.create({
      title: 'أسطورة آكل البشر',
      description: 'جزء من سلسلة ما وراء الطبيعة',
      author: author._id,
      categories: [category2._id],
    });
  });

  describe('POST /api/v1/categories', () => {
    it('should create a category successfully with valid data', async () => {
      const res = await requester.post('/api/v1/categories').send({
        name: 'تاريخ',
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.status, 'success');
      assert.property(res.body.data, 'name');
      assert.equal(res.body.data.name, 'تاريخ');
    });

    it('should fail if name is missing', async () => {
      const res = await requester.post('/api/v1/categories').send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'is required');
    });
  });

  describe('GET /api/v1/categories', () => {
    it('should retrieve all categories with correct bookCount', async () => {
      const res = await requester.get('/api/v1/categories');

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.isArray(res.body.data);
      assert.lengthOf(res.body.data, 2);

      // Category with no books should have bookCount 0
      const cat1 = res.body.data.find((c) => c.name === 'روايات');
      assert.exists(cat1);
      assert.property(cat1, 'bookCount');
      assert.equal(cat1.bookCount, 0);

      // Category with 1 book linked
      const cat2 = res.body.data.find((c) => c.name === 'رعب');
      assert.exists(cat2);
      assert.property(cat2, 'bookCount');
      assert.equal(cat2.bookCount, 1);
    });
  });

  describe('GET /api/v1/categories/:id', () => {
    it('should retrieve full category profile including books and bookCount', async () => {
      const res = await requester.get(`/api/v1/categories/${category2.id}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');

      const { data } = res.body;

      // Category info
      assert.equal(data.name, category2.name);

      // Book count
      assert.property(data, 'bookCount');
      assert.equal(data.bookCount, 1);

      // Books info
      assert.isArray(data.books);
      assert.lengthOf(data.books, 1);

      const book = data.books[0];
      assert.equal(book.title, book1.title);
      assert.property(book, 'author');
      assert.property(book.author, 'name');
      assert.property(book.author, 'id');
    });

    it('should return 404 if category not found', async () => {
      const fakeId = '60c72b2f9b1e8e0f10a5f999';
      const res = await requester.get(`/api/v1/categories/${fakeId}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'No category found with that ID');
    });
  });

  describe('PATCH /api/v1/categories/:id', () => {
    it('should update the category successfully with valid data', async () => {
      const res = await requester
        .patch(`/api/v1/categories/${category1.id}`)
        .send({ name: 'روايات حديثة' });

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.property(res.body.data, 'name');
      assert.equal(res.body.data.name, 'روايات حديثة');
    });

    it('should return 404 if category to update is not found', async () => {
      const fakeId = '60c72b2f9b1e8e0f10a5f999';
      const res = await requester
        .patch(`/api/v1/categories/${fakeId}`)
        .send({ name: 'تجريبي' });

      assert.equal(res.status, 404);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'No category found with that ID');
    });
  });

  describe('DELETE /api/v1/categories/:id', () => {
    it('should delete the category successfully', async () => {
      const res = await requester.delete(`/api/v1/categories/${category1.id}`);

      assert.equal(res.status, 204);
      assert.notExists(res.body.data); // DELETE returns no content
    });

    it('should return 404 if category to delete is not found', async () => {
      const fakeId = '60c72b2f9b1e8e0f10a5f999';
      const res = await requester.delete(`/api/v1/categories/${fakeId}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'No category found with that ID');
    });
  });
});
