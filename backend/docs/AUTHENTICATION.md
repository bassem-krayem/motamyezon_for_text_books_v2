# Authentication & Authorization Guide

## Table of Contents
- [Getting Started](#getting-started)
- [JWT Authentication](#jwt-authentication)
- [User Roles & Permissions](#user-roles--permissions)
- [Token Management](#token-management)
- [Password Management](#password-management)
- [Security Best Practices](#security-best-practices)

## Getting Started

The Motamyezon API uses **JWT (JSON Web Token)** authentication combined with **role-based access control (RBAC)** for authorization.

### Quick Start

1. **Register** via `/users/signup` endpoint
2. **Receive** a JWT token in the response
3. **Include** token in `Authorization` header for authenticated requests:
   ```
   Authorization: Bearer <your-jwt-token>
   ```
4. **Use** the token to access protected endpoints

---

## JWT Authentication

### What is JWT?

JWT (JSON Web Token) is a secure way to transmit user information between client and server. It's encoded but not encrypted, meaning it's safe to transmit but the contents are visible.

### Token Format

A JWT consists of three parts separated by dots:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE2MDUyMjMwMDB9.signature
```

- **Header**: Token type and hashing algorithm
- **Payload**: User information and claims
- **Signature**: Verification signature (server-side secret)

### Using Tokens

#### In cURL:
```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### In JavaScript (fetch):
```javascript
const response = await fetch('http://localhost:3000/api/v1/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

#### In JavaScript (axios):
```javascript
axios.get('http://localhost:3000/api/v1/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Token Details

| Property | Value | Notes |
|----------|-------|-------|
| Algorithm | HS256 | HMAC SHA-256 |
| Expiry | 90 days | Token becomes invalid after 90 days |
| Storage | httpOnly cookie | Secure in production (HTTPS only) |
| Renewal | On login | Get new token by logging in again |
| Invalidation | Immediate | When user changes password or logs out |

### Token Expiry

Tokens expire after **90 days**. When a token expires:

1. API returns HTTP 401 response
2. Client must re-authenticate (login again)
3. Receive new token from login endpoint

**Error Response (401):**
```json
{
  "status": "fail",
  "message": "Token has expired. Please login again."
}
```

### Token Invalidation

Tokens are automatically invalidated when:

1. **User changes password** - All existing tokens become invalid
   - Forces re-login for security
   - Prevents unauthorized access if password is compromised

2. **User logs out** - Current session token is invalidated
   - Cookie is cleared (if using cookies)
   - Token should be discarded by client

3. **User account is deleted/deactivated** - All tokens become invalid

4. **Token expires** - After 90 days

---

## User Roles & Permissions

The API implements three user roles with different permission levels:

### 1. User (Default)

**Permissions:**
- View own profile (`GET /users/me`)
- Update own profile (`PATCH /users/updateMe`)
- Change own password (`PATCH /users/updateMyPassword`)
- Delete own account (`DELETE /users/deleteMe`)
- Read all public data (books, authors, series, categories)

**Restrictions:**
- Cannot view other users
- Cannot manage books, authors, series, categories
- Cannot see admin-only endpoints

**Created by:** User registration (`POST /users/signup`)

---

### 2. Uploader

**Permissions:**
- All permissions of "user" role, plus:
- Create books (`POST /books`)
- Update books (`PATCH /books/:id`)
- Create authors (`POST /authors`)
- Update authors (`PATCH /authors/:id`)
- Create series (`POST /series`)
- Update series (`PATCH /series/:id`)
- Create categories (`POST /categories`)
- Update categories (`PATCH /categories/:id`)

**Restrictions:**
- Cannot delete books/authors/series/categories
- Cannot view/manage users
- Cannot change user roles

**Assigned by:** Admin user (via `PATCH /users/:id` endpoint)

---

### 3. Admin

**Permissions:**
- All permissions of all roles, plus:
- Full user management (view, create, update, delete)
- Delete books (`DELETE /books/:id`)
- Delete authors (`DELETE /authors/:id`)
- Delete series (`DELETE /series/:id`)
- Delete categories (`DELETE /categories/:id`)
- Change user roles
- Access all admin endpoints

**Restrictions:**
- None (full system access)

**Assigned by:** Initial system setup or existing admin

---

### Permission Matrix

| Endpoint | User | Uploader | Admin |
|----------|------|----------|-------|
| GET books | ✓ | ✓ | ✓ |
| POST books | ✗ | ✓ | ✓ |
| PATCH books | ✗ | ✓ | ✓ |
| DELETE books | ✗ | ✗ | ✓ |
| GET authors | ✓ | ✓ | ✓ |
| POST authors | ✗ | ✓ | ✓ |
| PATCH authors | ✗ | ✓ | ✓ |
| DELETE authors | ✗ | ✗ | ✓ |
| GET users | ✗ | ✗ | ✓ |
| POST users | ✗ | ✗ | ✓ |
| PATCH users | ✗ | ✗ | ✓ |
| DELETE users | ✗ | ✗ | ✓ |

---

## Token Management

### Obtaining a Token

#### Option 1: Sign Up (Register)

```bash
curl -X POST http://localhost:3000/api/v1/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "email": "ahmed@example.com",
    "password": "SecurePass123",
    "passwordConfirm": "SecurePass123"
  }'
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "12345678",
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "email": "ahmed@example.com",
      "role": "user",
      "active": true
    }
  }
}
```

#### Option 2: Log In

```bash
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "SecurePass123"
  }'
```

**Response:** Same as signup

### Storing the Token

#### In Browser (Frontend)

**Option 1: localStorage (Convenient but less secure)**
```javascript
// After login, store token
localStorage.setItem('token', response.data.token);

// Use in future requests
const token = localStorage.getItem('token');
fetch('/api/v1/users/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Clear on logout
localStorage.removeItem('token');
```

**Option 2: sessionStorage (Clears on browser close)**
```javascript
sessionStorage.setItem('token', response.data.token);
```

**Option 3: Memory only (Most secure, lost on page reload)**
```javascript
let token = response.data.token;
// Token lost if page reloads
```

#### In Node.js / Backend

```javascript
// Store in environment variable
process.env.API_TOKEN = response.data.token;

// Or in configuration
const config = {
  apiToken: response.data.token
};
```

### Refreshing Token

Since tokens expire after 90 days, users need to re-authenticate:

```bash
# Token expired - get 401
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer EXPIRED_TOKEN"

# Response: 401 Unauthorized

# Re-login to get new token
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "SecurePass123"
  }'
```

### Revoking Token (Logout)

```bash
curl -X POST http://localhost:3000/api/v1/users/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

After logout, the token should not be used for further requests.

---

## Password Management

### Setting Initial Password

Done during user signup:

```bash
curl -X POST http://localhost:3000/api/v1/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "email": "ahmed@example.com",
    "password": "SecurePass123",
    "passwordConfirm": "SecurePass123"
  }'
```

### Changing Password (Authenticated Users)

Requires knowledge of current password:

```bash
curl -X PATCH http://localhost:3000/api/v1/users/updateMyPassword \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "passwordCurrent": "OldPassword123",
    "password": "NewPassword456",
    "passwordConfirm": "NewPassword456"
  }'
```

**Response:**
```json
{
  "status": "success",
  "token": "NEW_TOKEN_HERE",
  "data": {
    "user": { ... }
  }
}
```

**Important:** 
- New password must be different from old password
- User receives a new token (old tokens become invalid)

### Resetting Forgotten Password

#### Step 1: Request Reset Token

```bash
curl -X POST http://localhost:3000/api/v1/users/forgotPassword \
  -H "Content-Type: application/json" \
  -d '{"email": "ahmed@example.com"}'
```

**Response:**
```json
{
  "status": "success",
  "message": "Token sent to email!"
}
```

**Process:**
- Email is checked (no error if email doesn't exist, for security)
- If email exists, reset token is generated
- Token and reset URL are sent to email
- Token expires in 10 minutes

#### Step 2: Use Token to Reset Password

The email contains a reset link like:
```
https://yourdomain.com/reset-password?token=abc123def456
```

User enters new password and submits:

```bash
curl -X PATCH http://localhost:3000/api/v1/users/resetPassword/abc123def456 \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewPassword456",
    "passwordConfirm": "NewPassword456"
  }'
```

**Response:**
```json
{
  "status": "success",
  "token": "NEW_TOKEN_HERE",
  "data": {
    "user": { ... }
  }
}
```

**Important:**
- Token is valid for 10 minutes only
- After use, token is invalidated
- User automatically logs in (receives new token)

---

## Security Best Practices

### For Users

1. **Use Strong Passwords**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Avoid common words or personal information

2. **Never Share Tokens**
   - Tokens are equivalent to your password
   - Don't paste tokens in public places
   - Don't commit tokens to version control

3. **Store Tokens Securely**
   - If using browser: Use httpOnly cookies (secure by default)
   - If in localStorage: Be aware of XSS vulnerabilities
   - Never store in plain text files

4. **Log Out When Done**
   - Always logout from shared/public computers
   - Logout invalidates your current session

5. **Change Passwords Regularly**
   - Change password if you suspect compromise
   - Password change invalidates all existing tokens

6. **Use HTTPS**
   - Always use HTTPS in production
   - Never send tokens over HTTP
   - Tokens are only secure over encrypted connections

### For Developers

1. **Token Validation**
   - Always validate tokens server-side
   - Don't trust tokens at face value (JWT can be decoded by anyone)
   - Server verifies signature to ensure authenticity

2. **Environment Variables**
   - Store API credentials in `.env` files
   - Never commit `.env` to version control
   - Use different credentials for dev/staging/production

3. **Error Handling**
   - Don't expose detailed error messages in production
   - Log errors securely for debugging
   - Never log tokens or passwords

4. **API Security**
   - Always use HTTPS in production
   - Implement rate limiting (already done: 100 req/hour)
   - Validate all input data
   - Use CORS appropriately

5. **Token Rotation**
   - Tokens expire after 90 days (automatic)
   - Consider shorter expiry for sensitive operations
   - Implement refresh token mechanism if needed

6. **Role-Based Access Control**
   - Check user role on every protected endpoint
   - Use `restrictTo()` middleware for role enforcement
   - Log authorization failures

---

## Troubleshooting

### "Token has expired" Error

**Problem:** Request returns 401 with "Token has expired"

**Solution:**
1. Login again to get a new token
2. Update your client to use the new token

```bash
# Get new token
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "SecurePass123"
  }'
```

### "Invalid token" Error

**Problem:** Request returns 401 with "Invalid token"

**Possible Causes:**
1. Token was manually edited or corrupted
2. Token is from a different server/deployment
3. Server secret changed

**Solution:**
1. Get a new token by logging in
2. Ensure you're using the correct API endpoint
3. Check that token hasn't been modified

### "You do not have permission" Error

**Problem:** Request returns 403 "You do not have permission"

**Cause:** Your user role doesn't have access to this endpoint

**Solution:**
1. Check your user role (use `GET /users/me`)
2. Request admin to upgrade your role if needed
3. Use only endpoints available to your role

---

## Example: Complete Authentication Flow

### JavaScript Example

```javascript
// 1. Sign up
const signupResponse = await fetch('http://localhost:3000/api/v1/users/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'ahmed@example.com',
    password: 'SecurePass123',
    passwordConfirm: 'SecurePass123'
  })
});

const { token } = await signupResponse.json();

// 2. Store token
localStorage.setItem('token', token);

// 3. Use token in subsequent requests
const meResponse = await fetch('http://localhost:3000/api/v1/users/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

const userData = await meResponse.json();
console.log(userData.data); // User profile

// 4. Logout
await fetch('http://localhost:3000/api/v1/users/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// 5. Clear token
localStorage.removeItem('token');
```

---

See [API.md](API.md) for detailed endpoint documentation.
