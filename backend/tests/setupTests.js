import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import request from 'supertest';
import app from '../app.js';
import storage from '../utils/storageService.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Setup test database connection.
 *
 * This is designed so that running every suite in a single `npm test` process
 * works as well as running an individual file:
 *  - `before` reuses an already-open connection instead of reconnecting once
 *    per suite (reconnecting per suite is what caused MongoNotConnectedError
 *    when all files ran in one process).
 *  - `after` drops the data this suite created but keeps the shared connection
 *    open for the remaining suites. The process is torn down by mocha's
 *    `--exit`, so we never close the connection mid-run.
 */
export function setupTestDB() {
  // Use a normal function (not an arrow) so we can raise this hook's timeout:
  // the initial Atlas handshake can occasionally take longer than mocha's
  // default 20s, which would otherwise fail the hook and skip the whole suite.
  before(async function connectTestDB() {
    this.timeout(60000);
    // readyState: 0 = disconnected, 1 = connected, 2 = connecting
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.DB || process.env.DATABASE_URL, {
        dbName: 'testDB',
      });
      console.log('✅ Test DB connected:', mongoose.connection.db.databaseName);
    }
  });

  after(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.dropDatabase();
      console.log('🗑️ Test DB dropped (connection kept open for next suite)');
    }
  });
}

/**
 * Get Supertest request agent
 * - Use this to make HTTP requests in tests
 * - Returns request object configured with app
 */
export function getRequest() {
  return request(app);
}

/**
 * Helper to create a test user and get token
 * Useful for testing protected routes
 */
export async function createTestUserAndGetToken(testData = {}) {
  const defaultUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `testuser-${Date.now()}@example.com`,
    password: 'TestPass123',
    passwordConfirm: 'TestPass123',
  };

  const defaultUser2 = {
    ...defaultUser,
    // Add a random suffix so rapid sequential calls never collide on the
    // unique email index (Date.now() alone can repeat within the same ms).
    email: `testuser-${Date.now()}-${Math.round(Math.random() * 1e9)}@example.com`,
  };

  const userData = { ...defaultUser2, ...testData };

  const res = await request(app).post('/api/v1/users/signup').send(userData);

  if (res.status !== 201) {
    throw new Error(`Failed to create test user: ${res.body.message}`);
  }

  return {
    user: res.body.data?.user || res.body.data,
    token: res.body.token,
    response: res,
  };
}

/**
 * Helper to create admin user and get token
 */
export async function createAdminUserAndGetToken(testData = {}) {
  const user = await createTestUserAndGetToken(testData);

  // Manually set role to admin in database (if needed in future)
  await mongoose.connection.db
    .collection('users')
    .updateOne(
      { _id: new mongoose.Types.ObjectId(user.user._id) },
      { $set: { role: 'admin' } },
    );
  return user; // Returns the same user object with admin role now set
}

/**
 * Helper to create uploader user and get token
 */
export async function createUploaderUserAndGetToken(testData = {}) {
  const user = await createTestUserAndGetToken(testData);

  // Manually set role to uploader in database (if needed in future)
  await mongoose.connection.db
    .collection('users')
    .updateOne(
      { _id: new mongoose.Types.ObjectId(user.user._id) },
      { $set: { role: 'uploader' } },
    );
  return user; // Returns the same user object with uploader role now set
}

/**
 * Helper to make authenticated request
 * Automatically adds Authorization header with token
 */
export function authenticatedRequest(token) {
  return {
    get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url) =>
      request(app).post(url).set('Authorization', `Bearer ${token}`),
    patch: (url) =>
      request(app).patch(url).set('Authorization', `Bearer ${token}`),
    delete: (url) =>
      request(app).delete(url).set('Authorization', `Bearer ${token}`),
  };
}

/**
 * Clean up database between tests
 * Pass model(s) to delete
 */
export async function cleanupDatabase(...models) {
  await Promise.all(models.map((model) => model.deleteMany()));
}

/**
 * Stub the cloud storage singleton so book upload/delete tests NEVER hit the
 * real object storage (DigitalOcean Spaces / S3).
 *
 * The controllers import the same `storageService` singleton and call its
 * methods at call-time, so reassigning the methods on the instance is enough
 * to intercept every upload/delete without any external dependency.
 *
 * Returns:
 *  - calls.uploads: recorded upload metadata (one entry per uploaded file)
 *  - calls.deletes: recorded deleted file URLs
 *  - restore(): puts the real methods back (call this in an `after` hook)
 */
export function stubStorageService() {
  const calls = { uploads: [], deletes: [] };
  const original = {
    uploadFile: storage.uploadFile,
    deleteFile: storage.deleteFile,
  };

  storage.uploadFile = async (
    file,
    folder = 'books',
    customFilename = '',
    bookId = '',
  ) => {
    if (!file || !file.buffer) {
      // Mirror the real service's guard so validation behaviour stays realistic
      throw new Error('File upload failed: Missing binary file data buffer.');
    }
    const ext = file.originalname
      ? file.originalname.slice(file.originalname.lastIndexOf('.'))
      : '';
    calls.uploads.push({
      folder,
      customFilename,
      bookId,
      originalname: file.originalname,
    });
    // Return a deterministic fake URL shaped like the real one
    return `https://mock-storage.local/${folder}/${bookId}${ext}`;
  };

  storage.deleteFile = async (fileUrl) => {
    calls.deletes.push(fileUrl);
  };

  const restore = () => {
    storage.uploadFile = original.uploadFile;
    storage.deleteFile = original.deleteFile;
  };

  return { calls, restore };
}
