import { expect } from 'chai';
import {
  setupTestDB,
  getRequest,
  createTestUserAndGetToken,
  createAdminUserAndGetToken,
  authenticatedRequest,
  cleanupDatabase,
} from './setupTests.js';
import User from '../models/userModel.js';

describe('Authentication & User Tests', () => {
  setupTestDB();

  beforeEach(async () => {
    await cleanupDatabase(User);
  });

  // ==================== SIGNUP ====================
  describe('POST /api/v1/users/signup', () => {
    const validUser = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'testpass123',
      passwordConfirm: 'testpass123',
    };

    it('should signup a user successfully with valid data', async () => {
      const res = await getRequest()
        .post('/api/v1/users/signup')
        .send(validUser);

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body).to.have.property('token');
      expect(res.body.data.user.email).to.equal('jane@example.com');
      expect(res.body.data.user).to.have.property('id');
      // The hashed password must never be returned
      expect(res.body.data.user).to.not.have.property('password');
    });

    it('should default the new user role to "user"', async () => {
      await getRequest().post('/api/v1/users/signup').send(validUser);
      const user = await User.findOne({ email: 'jane@example.com' });
      expect(user.role).to.equal('user');
    });

    it('should fail if email is already registered', async () => {
      await getRequest().post('/api/v1/users/signup').send(validUser);
      const res = await getRequest()
        .post('/api/v1/users/signup')
        .send(validUser);

      expect(res.status).to.equal(400);
      expect(res.body.status).to.equal('fail');
      expect(res.body.message).to.include('already exist');
    });

    it('should fail if email is invalid', async () => {
      const res = await getRequest()
        .post('/api/v1/users/signup')
        .send({ ...validUser, email: 'jane@example' });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('valid email');
    });

    it('should fail if passwords do not match', async () => {
      const res = await getRequest()
        .post('/api/v1/users/signup')
        .send({ ...validUser, passwordConfirm: 'different123' });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('Passwords do not match');
    });

    it('should fail if the password is too short (< 8 chars)', async () => {
      const res = await getRequest()
        .post('/api/v1/users/signup')
        .send({ ...validUser, password: 'short', passwordConfirm: 'short' });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('8 characters');
    });

    it('should fail if passwordConfirm is missing', async () => {
      const noConfirm = { ...validUser };
      delete noConfirm.passwordConfirm;
      const res = await getRequest()
        .post('/api/v1/users/signup')
        .send(noConfirm);

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('passwordConfirm');
    });

    it('should fail if firstName is missing', async () => {
      const noFirstName = { ...validUser };
      delete noFirstName.firstName;
      const res = await getRequest()
        .post('/api/v1/users/signup')
        .send(noFirstName);

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('firstName');
    });

    it('should hash the password before saving', async () => {
      await getRequest().post('/api/v1/users/signup').send(validUser);
      const user = await User.findOne({ email: 'jane@example.com' }).select(
        '+password',
      );
      expect(user.password).to.not.equal('testpass123');
    });
  });

  // ==================== LOGIN ====================
  describe('POST /api/v1/users/login', () => {
    beforeEach(async () => {
      await getRequest().post('/api/v1/users/signup').send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'testpass123',
        passwordConfirm: 'testpass123',
      });
    });

    it('should login with correct credentials', async () => {
      const res = await getRequest()
        .post('/api/v1/users/login')
        .send({ email: 'jane@example.com', password: 'testpass123' });

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body).to.have.property('token');
      expect(res.body.data.user.email).to.equal('jane@example.com');
    });

    it('should fail login with an incorrect password', async () => {
      const res = await getRequest()
        .post('/api/v1/users/login')
        .send({ email: 'jane@example.com', password: 'wrongpass' });

      expect(res.status).to.equal(401);
      expect(res.body.message).to.include('Incorrect');
    });

    it('should fail login for a non-existent email', async () => {
      const res = await getRequest()
        .post('/api/v1/users/login')
        .send({ email: 'nobody@example.com', password: 'testpass123' });

      expect(res.status).to.equal(401);
      expect(res.body.message).to.include('Incorrect');
    });

    it('should fail login with missing fields', async () => {
      const res = await getRequest()
        .post('/api/v1/users/login')
        .send({ password: 'testpass123' });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('email');
    });
  });

  // ==================== GET ME (Protected) ====================
  describe('GET /api/v1/users/me', () => {
    it('should get the current user profile with a valid token', async () => {
      const { token, user } = await createTestUserAndGetToken();
      const res = await authenticatedRequest(token).get('/api/v1/users/me');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.data.email).to.equal(user.email);
    });

    it('should fail without a token', async () => {
      const res = await getRequest().get('/api/v1/users/me');

      expect(res.status).to.equal(401);
      expect(res.body.message).to.include('not logged in');
    });

    it('should fail with an invalid token', async () => {
      const res =
        await authenticatedRequest('invalid-token').get('/api/v1/users/me');

      expect(res.status).to.equal(401);
    });
  });

  // ==================== UPDATE ME ====================
  describe('PATCH /api/v1/users/updateMe', () => {
    it('should update the user profile successfully', async () => {
      const { token } = await createTestUserAndGetToken();
      const res = await authenticatedRequest(token)
        .patch('/api/v1/users/updateMe')
        .send({ firstName: 'Jane', lastName: 'Smith' });

      expect(res.status).to.equal(200);
      expect(res.body.data.user.firstName).to.equal('Jane');
      expect(res.body.data.user.lastName).to.equal('Smith');
    });

    it('should allow updating the email', async () => {
      const { token } = await createTestUserAndGetToken();
      const res = await authenticatedRequest(token)
        .patch('/api/v1/users/updateMe')
        .send({ email: 'updated@example.com' });

      expect(res.status).to.equal(200);
      expect(res.body.data.user.email).to.equal('updated@example.com');
    });

    it('should reject a password change via updateMe', async () => {
      const { token } = await createTestUserAndGetToken();
      const res = await authenticatedRequest(token)
        .patch('/api/v1/users/updateMe')
        .send({ firstName: 'Jane', password: 'NewPassword123' });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('password');
    });

    it('should reject a privilege-escalation attempt (role)', async () => {
      const { token, user } = await createTestUserAndGetToken();
      const res = await authenticatedRequest(token)
        .patch('/api/v1/users/updateMe')
        .send({ role: 'admin' });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('role');

      const fromDb = await User.findOne({ id: user.id });
      expect(fromDb.role).to.equal('user');
    });

    it('should fail without a token', async () => {
      const res = await getRequest()
        .patch('/api/v1/users/updateMe')
        .send({ firstName: 'Jane' });

      expect(res.status).to.equal(401);
    });
  });

  // ==================== UPDATE PASSWORD ====================
  describe('PATCH /api/v1/users/updateMyPassword', () => {
    it('should update the password successfully', async () => {
      const { token } = await createTestUserAndGetToken();
      const res = await authenticatedRequest(token)
        .patch('/api/v1/users/updateMyPassword')
        .send({
          currentPassword: 'TestPass123',
          password: 'NewPassword456',
          passwordConfirm: 'NewPassword456',
        });

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body).to.have.property('token');
    });

    it('should fail with an incorrect current password', async () => {
      const { token } = await createTestUserAndGetToken();
      const res = await authenticatedRequest(token)
        .patch('/api/v1/users/updateMyPassword')
        .send({
          currentPassword: 'WrongPassword',
          password: 'NewPassword456',
          passwordConfirm: 'NewPassword456',
        });

      expect(res.status).to.equal(401);
      expect(res.body.message).to.include('current password');
    });

    it('should fail if the new passwords do not match', async () => {
      const { token } = await createTestUserAndGetToken();
      const res = await authenticatedRequest(token)
        .patch('/api/v1/users/updateMyPassword')
        .send({
          currentPassword: 'TestPass123',
          password: 'NewPassword456',
          passwordConfirm: 'Mismatch456',
        });

      expect(res.status).to.equal(400);
    });

    it('should reject reusing the same password', async () => {
      const { token } = await createTestUserAndGetToken();
      const res = await authenticatedRequest(token)
        .patch('/api/v1/users/updateMyPassword')
        .send({
          currentPassword: 'TestPass123',
          password: 'TestPass123',
          passwordConfirm: 'TestPass123',
        });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('same password');
    });

    it('should fail without a token', async () => {
      const res = await getRequest()
        .patch('/api/v1/users/updateMyPassword')
        .send({
          currentPassword: 'OldPass123',
          password: 'NewPassword456',
          passwordConfirm: 'NewPassword456',
        });

      expect(res.status).to.equal(401);
    });
  });

  // ==================== DELETE ME (deactivate) ====================
  describe('DELETE /api/v1/users/deleteMe', () => {
    it('should deactivate the account successfully', async () => {
      const { token } = await createTestUserAndGetToken();

      const res = await authenticatedRequest(token).delete(
        '/api/v1/users/deleteMe',
      );
      expect(res.status).to.equal(204);

      // The account is now inactive and filtered out by the model's query
      // middleware, so the same token no longer resolves to a user.
      const redeleting = await authenticatedRequest(token).delete(
        '/api/v1/users/deleteMe',
      );
      expect(redeleting.status).to.equal(401);
      expect(redeleting.body.message).to.include('does no longer exist');
    });

    it('should prevent login after account deactivation', async () => {
      const { token, user } = await createTestUserAndGetToken();

      await authenticatedRequest(token).delete('/api/v1/users/deleteMe');

      // Use the ACTUAL generated email of the created user
      const loginRes = await getRequest()
        .post('/api/v1/users/login')
        .send({ email: user.email, password: 'TestPass123' });

      expect(loginRes.status).to.equal(401);
    });

    it('should fail without a token', async () => {
      const res = await getRequest().delete('/api/v1/users/deleteMe');
      expect(res.status).to.equal(401);
    });
  });

  // ==================== ADMIN ENDPOINTS ====================
  describe('GET /api/v1/users (Admin Only)', () => {
    it('should list users for an admin', async () => {
      const { token } = await createAdminUserAndGetToken();
      const res = await authenticatedRequest(token).get('/api/v1/users');

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.instanceof(Array);
    });

    it('should fail to list users without authentication', async () => {
      const res = await getRequest().get('/api/v1/users');
      expect(res.status).to.equal(401);
    });

    it('should forbid a regular user from listing users', async () => {
      const { token } = await createTestUserAndGetToken();
      const res = await authenticatedRequest(token).get('/api/v1/users');

      expect(res.status).to.equal(403);
      expect(res.body.message).to.include('permission');
    });
  });

  describe('GET /api/v1/users/:id (Admin Only)', () => {
    it('should let an admin fetch a user by id', async () => {
      const { token, user } = await createAdminUserAndGetToken();
      const res = await authenticatedRequest(token).get(
        `/api/v1/users/${user.id}`,
      );

      expect(res.status).to.equal(200);
      expect(res.body.data.id).to.equal(user.id);
    });

    it('should fail without authentication', async () => {
      const res = await getRequest().get('/api/v1/users/123');
      expect(res.status).to.equal(401);
    });

    it('should forbid a regular user from fetching a user by id', async () => {
      const { token, user } = await createTestUserAndGetToken();
      const res = await authenticatedRequest(token).get(
        `/api/v1/users/${user.id}`,
      );

      expect(res.status).to.equal(403);
    });
  });
});
