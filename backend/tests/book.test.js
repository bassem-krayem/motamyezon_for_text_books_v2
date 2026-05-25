import { assert } from 'chai';
import { setupTestDB, setupServer } from './setupTests.js';
import Book from '../models/bookModel.js';
import Author from '../models/authorModel.js';
import Series from '../models/seriesModel.js';
import Category from '../models/categoryModel.js';

describe('Book API tests suite', () => {
  setupTestDB();
  const serverSetup = setupServer();
  let requester;

  let author;
  let series;
  let category;
  let book1;
  // eslint-disable-next-line no-unused-vars
  let book2;
  let newAuthor;
  let newSeries;
  let newCategory;

  before(() => {
    requester = serverSetup.requester;
  });

  beforeEach(async () => {
    await Promise.all([
      Book.deleteMany(),
      Author.deleteMany(),
      Series.deleteMany(),
      Category.deleteMany(),
    ]);

    // Create dependencies
    author = await Author.create({
      name: 'نوال السعداوي',
      bio: 'كاتبة وطبيبة مصرية',
    });

    series = await Series.create({
      name: 'المرأة والثورة',
      description: 'سلسلة نقد اجتماعي عن المرأة',
      author: author.id,
    });

    category = await Category.create({ name: 'اجتماع' });

    // Create books
    book1 = await Book.create({
      title: 'المرأة والجنس',
      description: 'نقد اجتماعي جريء',
      author: author.id,
      series: series.id,
      categories: [category.id],
    });

    book2 = await Book.create({
      title: 'المرأة والصراع النفسي',
      description: 'رحلة في النفس الأنثوية',
      author: author.id,
      series: series.id,
      categories: [category.id],
    });

    newAuthor = await Author.create({
      name: 'طه حسين',
      bio: 'أديب مصري',
    });

    newSeries = await Series.create({
      name: 'سلسلة جديدة',
      description: 'وصف للسلسلة الجديدة',
      author: newAuthor.id,
    });

    newCategory = await Category.create({ name: 'تاريخ' });
  });

  describe('POST /api/v1/books', () => {
    it('should create a book successfully with valid data', async () => {
      const res = await requester.post('/api/v1/books').send({
        title: 'المرأة والصراع النفسي',
        description: 'رحلة في النفس الأنثوية',
        author: author.id,
        series: series.id,
        categories: [category.id],
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.status, 'success');
      assert.equal(res.body.data.title, 'المرأة والصراع النفسي');
    });

    it('should fail if required fields are missing', async () => {
      const res = await requester.post('/api/v1/books').send({});
      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'is required');
    });
  });

  describe('GET /api/v1/books', () => {
    it('should retrieve all books with populated author, series, and categories', async () => {
      const res = await requester.get('/api/v1/books');

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.isArray(res.body.data);
      assert.lengthOf(res.body.data, 2);

      res.body.data.forEach((book) => {
        assert.property(book, 'title');
        assert.property(book, 'author');
        assert.property(book, 'series');
        assert.isArray(book.categories);
      });
    });
  });

  describe('GET /api/v1/books/:id', () => {
    it('should retrieve full book profile with all references populated', async () => {
      const res = await requester.get(`/api/v1/books/${book1.id}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');

      const book = res.body.data;
      assert.equal(book.title, book1.title);
      assert.equal(book.description, book1.description);
      assert.property(book.author, 'name');
      assert.property(book.series, 'name');
      assert.isArray(book.categories);
      assert.property(book.categories[0], 'name');
    });

    it('should return 404 if book not found', async () => {
      const fakeId = '60c72b2f9b1e8e0f10a5f999';
      const res = await requester.get(`/api/v1/books/${fakeId}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'No book found with that ID');
    });
  });

  describe('PATCH /api/v1/books/:id', () => {
    it('should update title, description, author, series, and categories successfully', async () => {
      const updatedData = {
        title: 'عنوان محدث',
        description: 'وصف محدث للكتاب',
        author: newAuthor.id,
        series: newSeries.id,
        categories: [newCategory.id],
      };

      const res = await requester
        .patch(`/api/v1/books/${book1.id}`)
        .send(updatedData);

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.equal(res.body.data.title, updatedData.title);
      assert.equal(res.body.data.description, updatedData.description);
      assert.equal(res.body.data.author, newAuthor.id);
      assert.equal(res.body.data.series, newSeries.id);
      const updatedCategory = res.body.data.categories[0];
      assert.equal(updatedCategory, newCategory.id);
    });

    it('should return 404 if book not found', async () => {
      const fakeId = '60c72b2f9b1e8e0f10a5f999';
      const res = await requester.patch(`/api/v1/books/${fakeId}`).send({
        title: 'غير موجود',
      });

      assert.equal(res.status, 404);
      assert.include(res.body.message, 'No book found with that ID');
    });
  });

  describe('DELETE /api/v1/books/:id', () => {
    it('should delete the book successfully', async () => {
      const res = await requester.delete(`/api/v1/books/${book1.id}`);

      assert.equal(res.status, 204);
    });

    it('should return 404 if book not found', async () => {
      const fakeId = '60c72b2f9b1e8e0f10a5f999';
      const res = await requester.delete(`/api/v1/books/${fakeId}`);

      assert.equal(res.status, 404);
      assert.include(res.body.message, 'No book found with that ID');
    });
  });
});
