import { assert } from 'chai';
import { setupTestDB, setupServer } from './setupTests.js';
import Series from '../models/seriesModel.js';
import Author from '../models/authorModel.js';
import Category from '../models/categoryModel.js';
import Book from '../models/bookModel.js';

describe('Series API tests suite', () => {
  setupTestDB();
  const serverSetup = setupServer();
  let requester;
  let author;
  let updatedAuthor;
  let series;
  let category;
  // eslint-disable-next-line no-unused-vars
  let book1;
  // eslint-disable-next-line no-unused-vars
  let book2;

  before(async () => {
    requester = serverSetup.requester;
  });

  beforeEach(async () => {
    await Promise.all([
      Series.deleteMany(),
      Author.deleteMany(),
      Category.deleteMany(),
      Book.deleteMany(),
    ]);

    // Create base data shared by all tests
    author = await Author.create({
      name: 'أحمد خالد توفيق',
      bio: 'رائد أدب الرعب في العالم العربي',
    });

    updatedAuthor = await Author.create({
      name: 'أحمد مراد',
      bio: 'كاتب مصري معروف بأعماله الأدبية المميزة',
    });

    category = await Category.create({ name: 'روايات' });

    series = await Series.create({
      name: 'فانتازيا',
      description: 'مغامرات داخل عوالم خيالية عبر برنامج عبقري.',
      author: author._id,
    });

    book1 = await Book.create({
      title: 'أسطورة البيت',
      author: author._id,
      series: series._id,
      categories: [category._id],
    });

    book2 = await Book.create({
      title: 'أسطورة الدماء',
      author: author._id,
      series: series._id,
      categories: [category._id],
    });
  });

  describe('POST /api/v1/series', () => {
    it('should create a series successfully with valid data', async () => {
      const res = await requester.post('/api/v1/series').send({
        name: 'رجل المستحيل',
        description: 'سلسلة مغامرات بوليسية حول ضابط مخابرات مصري.',
        author: author._id,
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.status, 'success');
      assert.property(res.body.data, 'name');
      assert.equal(res.body.data.name, 'رجل المستحيل');
    });

    it('should fail if required fields are missing', async () => {
      const res = await requester.post('/api/v1/series').send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'is required');
    });
  });

  describe('GET /api/v1/series', () => {
    it('should retrieve all series with basic author info', async () => {
      const res = await requester.get('/api/v1/series');

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.isArray(res.body.data);
      assert.lengthOf(res.body.data, 1);
      assert.equal(res.body.data[0].name, series.name);
      assert.equal(res.body.data[0].author.name, author.name);
      assert.exists(res.body.data[0].author.id);
    });
  });

  describe('GET /api/v1/series/:id', () => {
    it('should retrieve complete series profile including books and author info', async () => {
      const res = await requester.get(`/api/v1/series/${series.id}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');

      const { data } = res.body;

      // Series info
      assert.equal(data.name, series.name);
      assert.equal(data.description, series.description);

      // Author info
      assert.property(data.author, 'name');
      assert.property(data.author, 'id');

      // Books
      assert.isArray(data.books);
      assert.lengthOf(data.books, 2);

      data.books.forEach((book) => {
        assert.property(book, 'title');
        assert.property(book, 'id');
        assert.property(book, 'author');
        assert.property(book.author, 'name');
        assert.property(book.author, 'id');
      });
    });

    it('should return 404 if series not found', async () => {
      const fakeId = '60c72b2f9b1e8e0f10a5f999';
      const res = await requester.get(`/api/v1/series/${fakeId}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'No series found with that ID');
    });
  });

  describe('PATCH /api/v1/series/:id', () => {
    it('should update name, description, and author successfully', async () => {
      const res = await requester.patch(`/api/v1/series/${series.id}`).send({
        name: 'فانتازيا جديدة',
        description: 'وصف جديد',
        author: updatedAuthor._id,
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.equal(res.body.data.name, 'فانتازيا جديدة');
      assert.equal(res.body.data.description, 'وصف جديد');
      assert.equal(res.body.data.author, updatedAuthor._id);
    });

    it('should return 404 if series not found', async () => {
      const fakeId = '60c72b2f9b1e8e0f10a5f999';

      const res = await requester.patch(`/api/v1/series/${fakeId}`).send({
        name: 'تعديل غير موجود',
      });

      assert.equal(res.status, 404);
      assert.include(res.body.message, 'No series found with that ID');
    });
  });

  describe('DELETE /api/v1/series/:id', () => {
    it('should delete series successfully', async () => {
      const res = await requester.delete(`/api/v1/series/${series.id}`);

      assert.equal(res.status, 204); // or 200 if you're returning a message
    });

    it('should return 404 if series not found', async () => {
      const fakeId = '60c72b2f9b1e8e0f10a5f999';
      const res = await requester.delete(`/api/v1/series/${fakeId}`);

      assert.equal(res.status, 404);
      assert.include(res.body.message, 'No series found with that ID');
    });
  });
});
