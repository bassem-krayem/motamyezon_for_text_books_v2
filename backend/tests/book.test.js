import { expect, assert } from 'chai';
import {
  setupTestDB,
  getRequest,
  createTestUserAndGetToken,
  createAdminUserAndGetToken,
  createUploaderUserAndGetToken,
  authenticatedRequest,
  cleanupDatabase,
  stubStorageService,
} from './setupTests.js';
import Book from '../models/bookModel.js';
import Author from '../models/authorModel.js';
import Series from '../models/seriesModel.js';
import Category from '../models/categoryModel.js';

// In-memory fake book files so the upload tests NEVER touch real object
// storage. The filename extensions matter (multer's fileFilter only accepts
// .epub/.azw3/.kfx); the buffer contents are irrelevant.
const FAKE_EPUB = Buffer.from('fake-epub-binary');
const FAKE_AZW3 = Buffer.from('fake-azw3-binary');
const FAKE_KFX = Buffer.from('fake-kfx-binary');

// Helper: attach all three valid book files to a supertest request
const attachAllFormats = (req) =>
  req
    .attach('epub', FAKE_EPUB, 'book.epub')
    .attach('azw3', FAKE_AZW3, 'book.azw3')
    .attach('kfx', FAKE_KFX, 'book.kfx');

describe('Book API Tests', () => {
  setupTestDB();
  let adminToken;
  let uploaderToken;
  let userToken;
  let author;
  let series;
  let category;
  let storageStub;

  before(async () => {
    ({ token: adminToken } = await createAdminUserAndGetToken());
    ({ token: uploaderToken } = await createUploaderUserAndGetToken());
    ({ token: userToken } = await createTestUserAndGetToken());
    // Intercept the cloud storage singleton for the whole suite.
    storageStub = stubStorageService();
  });

  after(() => {
    // Always put the real storage methods back.
    storageStub.restore();
  });

  beforeEach(async () => {
    await cleanupDatabase(Book, Author, Series, Category);
    // Reset recorded storage calls between tests
    storageStub.calls.uploads.length = 0;
    storageStub.calls.deletes.length = 0;

    author = await Author.create({
      name: 'نوال السعداوي',
      bio: 'كاتبة وطبيبة مصرية',
    });
    series = await Series.create({
      name: 'المرأة والثورة',
      description: 'سلسلة نقد اجتماعي',
      author: author.id,
    });
    category = await Category.create({ name: 'اجتماع' });
  });

  // ==================== CREATE BOOK (Admin/Uploader + file upload) ====================
  describe('POST /api/v1/books (With File Upload)', () => {
    it('should create a book with all three file formats (storage stubbed)', async () => {
      const res = await attachAllFormats(
        authenticatedRequest(adminToken).post('/api/v1/books'),
      )
        .field('title', 'الاختفاء الغامض')
        .field('description', 'رواية غموض وإثارة')
        .field('author', author.id)
        .field('series', series.id)
        .field('categories', JSON.stringify([category.id]));

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.data.title).to.equal('الاختفاء الغامض');

      // The three formats should be filled with the (mock) storage URLs
      expect(res.body.data.fileFormats.epub).to.include('mock-storage.local');
      expect(res.body.data.fileFormats.azw3).to.include('mock-storage.local');
      expect(res.body.data.fileFormats.kfx).to.include('mock-storage.local');

      // The stub must have been called exactly three times — proving we never
      // hit the real object storage.
      expect(storageStub.calls.uploads).to.have.lengthOf(3);
      expect(storageStub.calls.uploads.map((u) => u.folder)).to.deep.equal([
        'books',
        'books',
        'books',
      ]);

      // And it was actually persisted
      const inDb = await Book.findOne({ id: res.body.data.id });
      assert.exists(inDb);
    });

    it('should allow an uploader to create a book', async () => {
      const res = await attachAllFormats(
        authenticatedRequest(uploaderToken).post('/api/v1/books'),
      )
        .field('title', 'كتاب الرافع')
        .field('author', author.id)
        .field('categories', JSON.stringify([category.id]));

      expect(res.status).to.equal(201);
      expect(storageStub.calls.uploads).to.have.lengthOf(3);
    });

    it('should fail when no files are attached', async () => {
      const res = await authenticatedRequest(adminToken)
        .post('/api/v1/books')
        .send({
          title: 'الاختفاء الغامض',
          author: author.id,
          categories: [category.id],
        });

      expect(res.status).to.equal(400);
      expect(res.body.status).to.equal('fail');
      // No upload should have been attempted
      expect(storageStub.calls.uploads).to.have.lengthOf(0);
    });

    it('should fail if the title is missing (with files attached)', async () => {
      const res = await attachAllFormats(
        authenticatedRequest(adminToken).post('/api/v1/books'),
      )
        .field('author', author.id)
        .field('categories', JSON.stringify([category.id]));

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('title');
      expect(storageStub.calls.uploads).to.have.lengthOf(0);
    });

    it('should fail if the author is missing (with files attached)', async () => {
      const res = await attachAllFormats(
        authenticatedRequest(adminToken).post('/api/v1/books'),
      )
        .field('title', 'بدون مؤلف')
        .field('categories', JSON.stringify([category.id]));

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('Author');
      expect(storageStub.calls.uploads).to.have.lengthOf(0);
    });

    it('should reject an invalid file extension', async () => {
      const res = await authenticatedRequest(adminToken)
        .post('/api/v1/books')
        .attach('epub', Buffer.from('not a book'), 'malware.txt')
        .field('title', 'كتاب')
        .field('author', author.id)
        .field('categories', JSON.stringify([category.id]));

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('Invalid file format');
    });

    it('should fail without authentication', async () => {
      const res = await getRequest()
        .post('/api/v1/books')
        .send({ title: 'x', author: author.id, categories: [category.id] });

      expect(res.status).to.equal(401);
    });

    it('should forbid a regular user from creating a book', async () => {
      const res = await authenticatedRequest(userToken)
        .post('/api/v1/books')
        .send({ title: 'x', author: author.id, categories: [category.id] });

      expect(res.status).to.equal(403);
    });
  });

  // ==================== GET BOOKS ====================
  describe('GET /api/v1/books', () => {
    beforeEach(async () => {
      await Book.create({
        title: 'المرأة والجنس',
        description: 'نقد اجتماعي',
        author: author.id,
        series: series.id,
        categories: [category.id],
      });
      await Book.create({
        title: 'المرأة والصراع النفسي',
        description: 'رحلة في النفس',
        author: author.id,
        series: series.id,
        categories: [category.id],
      });
    });

    it('should retrieve all books (public)', async () => {
      const res = await getRequest().get('/api/v1/books');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.be.instanceof(Array).with.lengthOf(2);
    });

    it('should sort books by title', async () => {
      const res = await getRequest()
        .get('/api/v1/books')
        .query({ sort: 'title' });

      expect(res.status).to.equal(200);
      const titles = res.body.data.map((b) => b.title);
      expect(titles).to.deep.equal([...titles].sort());
    });

    it('should paginate books', async () => {
      const res = await getRequest()
        .get('/api/v1/books')
        .query({ page: 1, limit: 1 });

      expect(res.status).to.equal(200);
      expect(res.body.data).to.have.lengthOf(1);
    });

    it('should reject an out-of-range limit (max 50)', async () => {
      const res = await getRequest().get('/api/v1/books').query({ limit: 999 });

      expect(res.status).to.equal(400);
    });

    // NOTE: arbitrary filter params (author/series/categories) are stripped by
    // the getAllBooks validation schema, so they are accepted but do not
    // actually filter. These remain smoke tests confirming a 200 response.
    it('should accept (and ignore) a filter param without erroring', async () => {
      const res = await getRequest()
        .get('/api/v1/books')
        .query({ author: author.id });

      expect(res.status).to.equal(200);
    });
  });

  // ==================== GET SINGLE BOOK ====================
  describe('GET /api/v1/books/:id', () => {
    let book;

    beforeEach(async () => {
      book = await Book.create({
        title: 'المرأة والجنس',
        description: 'نقد اجتماعي جريء',
        author: author.id,
        series: series.id,
        categories: [category.id],
      });
    });

    it('should retrieve a book with populated references', async () => {
      const res = await getRequest().get(`/api/v1/books/${book.id}`);

      expect(res.status).to.equal(200);
      expect(res.body.data.title).to.equal('المرأة والجنس');
      expect(res.body.data.author).to.have.property('name', 'نوال السعداوي');
    });

    it('should return 404 for a non-existent book', async () => {
      const res = await getRequest().get('/api/v1/books/99999999');

      expect(res.status).to.equal(404);
      expect(res.body.message).to.include('No book found');
    });
  });

  // ==================== UPDATE BOOK (Admin/Uploader) ====================
  describe('PATCH /api/v1/books/:id', () => {
    let book;

    beforeEach(async () => {
      book = await Book.create({
        title: 'Original Title',
        description: 'Original description',
        author: author.id,
        series: series.id,
        categories: [category.id],
      });
    });

    it('should update book metadata (admin)', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/books/${book.id}`)
        .send({ title: 'Updated Title', description: 'Updated description' });

      expect(res.status).to.equal(200);
      expect(res.body.data.title).to.equal('Updated Title');
    });

    it('should allow an uploader to update a book', async () => {
      const res = await authenticatedRequest(uploaderToken)
        .patch(`/api/v1/books/${book.id}`)
        .send({ title: 'Uploader Title' });

      expect(res.status).to.equal(200);
      expect(res.body.data.title).to.equal('Uploader Title');
    });

    it('should return 404 for a non-existent book', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch('/api/v1/books/99999999')
        .send({ title: 'Updated' });

      expect(res.status).to.equal(404);
    });

    it('should fail without authentication', async () => {
      const res = await getRequest()
        .patch(`/api/v1/books/${book.id}`)
        .send({ title: 'Updated' });

      expect(res.status).to.equal(401);
    });

    it('should forbid a regular user from updating a book', async () => {
      const res = await authenticatedRequest(userToken)
        .patch(`/api/v1/books/${book.id}`)
        .send({ title: 'Updated' });

      expect(res.status).to.equal(403);
    });
  });

  // ==================== DELETE BOOK (Admin Only) ====================
  describe('DELETE /api/v1/books/:id', () => {
    let book;

    beforeEach(async () => {
      book = await Book.create({
        title: 'Book to Delete',
        description: 'Will be deleted',
        author: author.id,
        categories: [category.id],
      });
    });

    it('should delete a book successfully (admin)', async () => {
      const res = await authenticatedRequest(adminToken).delete(
        `/api/v1/books/${book.id}`,
      );

      expect(res.status).to.equal(204);

      const deletedBook = await Book.findOne({ id: book.id });
      expect(deletedBook).to.be.null;
    });

    it('should delete the associated stored files (storage stubbed)', async () => {
      const bookWithFiles = await Book.create({
        title: 'Book With Files',
        author: author.id,
        categories: [category.id],
        fileFormats: {
          epub: 'https://mock-storage.local/books/1.epub',
          azw3: 'https://mock-storage.local/books/1.azw3',
          kfx: 'https://mock-storage.local/books/1.kfx',
        },
      });

      const res = await authenticatedRequest(adminToken).delete(
        `/api/v1/books/${bookWithFiles.id}`,
      );

      expect(res.status).to.equal(204);
      // Each stored file URL should have been handed to the (stubbed) deleter
      expect(storageStub.calls.deletes).to.have.lengthOf(3);
    });

    it('should return 404 for a non-existent book', async () => {
      const res = await authenticatedRequest(adminToken).delete(
        '/api/v1/books/99999999',
      );

      expect(res.status).to.equal(404);
    });

    it('should fail without authentication', async () => {
      const res = await getRequest().delete(`/api/v1/books/${book.id}`);

      expect(res.status).to.equal(401);
    });

    it('should forbid a regular user from deleting a book', async () => {
      const res = await authenticatedRequest(userToken).delete(
        `/api/v1/books/${book.id}`,
      );

      expect(res.status).to.equal(403);
    });

    it('should forbid an uploader from deleting a book (admin only)', async () => {
      const res = await authenticatedRequest(uploaderToken).delete(
        `/api/v1/books/${book.id}`,
      );

      expect(res.status).to.equal(403);
    });
  });

  // ==================== MASS ASSIGNMENT PROTECTION ====================
  describe('PATCH /api/v1/books/:id - Mass Assignment Protection', () => {
    let book;

    beforeEach(async () => {
      book = await Book.create({
        title: 'Test Book',
        description: 'Test description',
        author: author.id,
        categories: [category.id],
      });
    });

    it('should reject an injected id field with 400 and keep the id unchanged', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/books/${book.id}`)
        .send({ title: 'Updated', id: '99999999' });

      expect(res.status).to.equal(400);

      const fromDb = await Book.findOne({ id: book.id });
      expect(fromDb.id).to.equal(book.id);
    });

    it('should reject unknown fields with 400', async () => {
      const res = await authenticatedRequest(adminToken)
        .patch(`/api/v1/books/${book.id}`)
        .send({ title: 'New Title', randomField: 'should be rejected' });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('not allowed');
    });
  });
});
