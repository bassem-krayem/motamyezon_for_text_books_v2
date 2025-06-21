import { assert } from 'chai';
import { setupTestDB, setupServer } from './setupTests.js';
import User from '../models/userModel.js';

describe('Authentication tests suite', () => {
  setupTestDB();
  const serverSetup = setupServer();
  let requester;

  before(() => {
    // eslint-disable-next-line prefer-destructuring
    requester = serverSetup.requester;
  });

  beforeEach(async () => {
    await User.deleteMany();
  });

  describe('POST /api/v1/users/signup', () => {
    // all test cases to /signup  here
    it('should signup a user successfully with valid data', async () => {
      const res = await requester.post('/api/v1/users/signup').send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'testpass123',
        passwordConfirm: 'testpass123',
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.status, 'success');
      assert.property(res.body, 'token');
      assert.equal(res.body.data.user.email, 'jane@example.com');
    });

    it('should fail if email is already registered', async () => {
      // First signup a user
      await requester.post('/api/v1/users/signup').send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'testpass123',
        passwordConfirm: 'testpass123',
      });
      // Then try to signup again with the same email
      const res = await requester.post('/api/v1/users/signup').send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'testpass123',
        passwordConfirm: 'testpass123',
      });

      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'fail');
      assert.include(
        res.body.message,
        'The email "jane@example.com" is already exist. Please choose another one.',
      );
    });

    it('should fail if email is invalid', async () => {
      const res = await requester.post('/api/v1/users/signup').send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example', // Invalid email
        password: 'testpass123',
        passwordConfirm: 'testpass123',
      });

      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'Please provide a valid email address');
    });

    it('should fail if passwords do not match', async () => {
      const res = await requester.post('/api/v1/users/signup').send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'pass1234',
        passwordConfirm: 'pass5678',
      });

      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'Passwords are not the same!');
    });

    it('should fail if missing fields', async () => {
      const res = await requester.post('/api/v1/users/signup').send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'testpass123',
      });

      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'Please confirm your password');
    });
  });

  describe('POST /api/v1/users/login', () => {
    // all test cases to /login here
    beforeEach(async () => {
      // Create a user before each login test
      await requester.post('/api/v1/users/signup').send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'testpass123',
        passwordConfirm: 'testpass123',
      });
    });

    it('should login with correct credentials', async () => {
      const res = await requester.post('/api/v1/users/login').send({
        email: 'jane@example.com',
        password: 'testpass123',
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.property(res.body, 'token');
      assert.equal(res.body.data.user.email, 'jane@example.com');
    });

    it('should fail login with incorrect password', async () => {
      const res = await requester.post('/api/v1/users/login').send({
        email: 'jane@example.com',
        password: 'wrongpass',
      });

      assert.equal(res.status, 401);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'Incorrect email or password');
    });

    it('should fail login with missing fields', async () => {
      const res = await requester.post('/api/v1/users/login').send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'fail');
      assert.include(res.body.message, 'Please provide email and password!');
    });
  });
});
