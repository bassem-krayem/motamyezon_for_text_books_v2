import { assert } from 'chai';
import { setupTestDB, setupServer } from './setupTests.js';
import Author from '../models/authorModel.js';
import Category from '../models/categoryModel.js';
import Series from '../models/seriesModel.js';
import Book from '../models/bookModel.js';

describe('Author API tests suite', () => {
  setupTestDB();
  const serverSetup = setupServer();
  let requester;

  let author;
  let category;
  let series1;
  let series2;
  let book1;
  let book2;

  before(() => {
    requester = serverSetup.requester;
  });

  beforeEach(async () => {
    await Promise.all([
      Author.deleteMany(),
      Category.deleteMany(),
      Series.deleteMany(),
      Book.deleteMany(),
    ]);

    // Create base author
    author = await Author.create({
      name: 'مصطفى لطفي المنفلوطي',
      bio: 'كاتب وشاعر مصري',
    });

    // Create category
    category = await Category.create({ name: 'قصص قصيرة' });

    // Create series for author
    series1 = await Series.create({
      name: 'سلسلة القصص الأدبية',
      description: 'مجموعة من القصص الهادفة',
      author: author.id,
    });

    series2 = await Series.create({
      name: 'سلسلة النقد الأدبي',
      description: 'تحليلات نقدية لأهم الأعمال',
      author: author.id,
    });

    // Create books for author
    book1 = await Book.create({
      title: 'أرخص ليالي',
      description: 'مجموعة قصصية واقعية',
      author: author.id,
      categories: [category.id],
    });

    book2 = await Book.create({
      title: 'النداهة',
      description: 'قصة خيالية شعبية',
      author: author.id,
      categories: [category.id],
    });
  });

  describe('POST /api/v1/authors', () => {
    it('should create an author successfully with valid data', async () => {
      const res = await requester.post('/api/v1/authors').send({
        name: 'نجيب محفوظ',
        bio: 'كاتب مصري معروف',
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.status, 'success');
      assert.equal(res.body.data.name, 'نجيب محفوظ');
    });

    it('should fail if required fields are missing', async () => {
      const res = await requester.post('/api/v1/authors').send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'is required');
    });
  });

  describe('GET /api/v1/authors', () => {
    it('should retrieve all authors', async () => {
      const res = await requester.get('/api/v1/authors');

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.isArray(res.body.data);
      assert.lengthOf(res.body.data, 1);
      assert.equal(res.body.data[0].name, author.name);
    });
  });

  describe('GET /api/v1/authors/:id', () => {
    it('should retrieve full author profile including books and series', async () => {
      const res = await requester.get(`/api/v1/authors/${author.id}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');

      const { data } = res.body;

      // Author info
      assert.equal(data.name, author.name);
      assert.equal(data.bio, author.bio);

      // Series
      assert.isArray(data.series);
      assert.lengthOf(data.series, 2);
      const seriesNames = data.series.map((s) => s.name);
      assert.include(seriesNames, series1.name);
      assert.include(seriesNames, series2.name);

      // Books
      assert.isArray(data.books);
      assert.lengthOf(data.books, 2);
      const bookTitles = data.books.map((b) => b.title);
      assert.include(bookTitles, book1.title);
      assert.include(bookTitles, book2.title);
    });

    it('should return 404 if author not found', async () => {
      const fakeId = '60c72b2f9b1e8e0f10a5f999';
      const res = await requester.get(`/api/v1/authors/${fakeId}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'No author found with that ID');
    });
  });

  describe('PATCH /api/v1/authors/:id', () => {
    it('should update author info with valid data', async () => {
      const res = await requester.patch(`/api/v1/authors/${author.id}`).send({
        name: 'مصطفى المنفلوطي',
        bio: 'كاتب مشهور',
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.equal(res.body.data.name, 'مصطفى المنفلوطي');
      assert.equal(res.body.data.bio, 'كاتب مشهور');
    });

    it('should return 404 if author not found', async () => {
      const fakeId = '60c72b2f9b1e8e0f10a5f999';
      const res = await requester.patch(`/api/v1/authors/${fakeId}`).send({
        name: 'مجهول',
      });

      assert.equal(res.status, 404);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'No author found with that ID');
    });
  });

  describe('DELETE /api/v1/authors/:id', () => {
    it('should delete author and associated books and series', async () => {
      const res = await requester.delete(`/api/v1/authors/${author.id}`);

      assert.equal(res.status, 204);
    });

    it('should return 404 if author not found', async () => {
      const fakeId = '60c72b2f9b1e8e0f10a5f999';
      const res = await requester.delete(`/api/v1/authors/${fakeId}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'No author found with that ID');
    });
  });
});
