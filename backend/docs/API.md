# Motamyezon Books API Documentation

## Table of Contents
- [Getting Started](#getting-started)
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Authentication & Users](#authentication--users)
  - [Books](#books)
  - [Authors](#authors)
  - [Series](#series)
  - [Categories](#categories)
- [Pagination, Filtering & Sorting](#pagination-filtering--sorting)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Getting Started

### Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.motamyezon.com/api/v1
```

### API Version
Current version: **v1**

### Content Type
All requests and responses use `application/json` except for file uploads which use `multipart/form-data`.

## API Overview

The Motamyezon Books API is a comprehensive REST API for managing a digital books platform. It provides endpoints for:

- **User Management**: Registration, authentication, password management
- **Books**: Create, read, update, delete books with multi-format file uploads
- **Authors**: Manage book authors with virtual population of related books and series
- **Series**: Organize books into collections
- **Categories**: Categorize books with automatic book count tracking

### Key Features
- JWT-based authentication with token expiry (90 days)
- Role-based access control (user, admin, uploader)
- File upload to cloud storage (DigitalOcean Spaces S3)
- MongoDB database with virtual population
- Input validation using Joi schemas
- Comprehensive error handling
- Rate limiting and security middleware

## Authentication

### How to Authenticate

The API uses JWT (JSON Web Tokens) for authentication. Upon successful login or signup, you receive a token that must be sent with subsequent requests.

#### Sending the Token
Include the token in the `Authorization` header as a Bearer token:

```
Authorization: Bearer <your-jwt-token>
```

#### Token Details
- **Format**: JWT (JSON Web Token)
- **Storage**: Sent as httpOnly cookie (secure in production)
- **Expiry**: 90 days
- **Invalidation**: Automatically invalidated when user changes their password

### User Roles
- **user**: Regular user (can only access public endpoints and their own profile)
- **admin**: Administrator (full access to all endpoints)
- **uploader**: Content uploader (can create/update books, authors, series, categories)

---

## Endpoints

### Authentication & Users

#### 1. Sign Up (Register New User)

```http
POST /users/signup
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Ahmed",
  "lastName": "Hassan",
  "email": "ahmed@example.com",
  "password": "SecurePass123",
  "passwordConfirm": "SecurePass123"
}
```

**Success Response (201):**
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
      "active": true,
      "createdAt": "2024-01-15 10:30:00",
      "updatedAt": "2024-01-15 10:30:00"
    }
  }
}
```

**Error Response (400):**
```json
{
  "status": "fail",
  "message": "Email already registered. Please use a different email."
}
```

**cURL Example:**
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

**Validation Rules:**
- firstName: Required, string
- lastName: Required, string
- email: Required, valid email format, unique
- password: Required, minimum 8 characters
- passwordConfirm: Required, must match password

---

#### 2. Login

```http
POST /users/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
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
      "active": true,
      "createdAt": "2024-01-15 10:30:00",
      "updatedAt": "2024-01-15 10:30:00"
    }
  }
}
```

**Error Response (401):**
```json
{
  "status": "fail",
  "message": "Incorrect email or password"
}
```

**Rate Limiting:**
- After 5 failed login attempts in 15 minutes, further attempts are blocked (HTTP 429)

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "SecurePass123"
  }'
```

---

#### 3. Logout

```http
POST /users/logout
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/users/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 4. Forgot Password

```http
POST /users/forgotPassword
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "ahmed@example.com"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Token sent to email!"
}
```

**Details:**
- Sends a password reset token to the user's email
- Token expires in 10 minutes
- Email is sent only if the account exists (no error if email doesn't exist for security)

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/users/forgotPassword \
  -H "Content-Type: application/json" \
  -d '{"email": "ahmed@example.com"}'
```

---

#### 5. Reset Password

```http
PATCH /users/resetPassword/{token}
Content-Type: application/json
```

**Parameters:**
- `token` (path): Password reset token from email

**Request Body:**
```json
{
  "password": "NewSecurePass456",
  "passwordConfirm": "NewSecurePass456"
}
```

**Success Response (200):**
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

**Error Response (400):**
```json
{
  "status": "fail",
  "message": "Token has expired"
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/api/v1/users/resetPassword/abc123def456 \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewSecurePass456",
    "passwordConfirm": "NewSecurePass456"
  }'
```

---

#### 6. Update Own Password

```http
PATCH /users/updateMyPassword
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "passwordCurrent": "SecurePass123",
  "password": "NewSecurePass456",
  "passwordConfirm": "NewSecurePass456"
}
```

**Success Response (200):**
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

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/api/v1/users/updateMyPassword \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "passwordCurrent": "SecurePass123",
    "password": "NewSecurePass456",
    "passwordConfirm": "NewSecurePass456"
  }'
```

---

#### 7. Get Current User Profile

```http
GET /users/me
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "12345678",
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "email": "ahmed@example.com",
    "role": "user",
    "active": true,
    "createdAt": "2024-01-15 10:30:00",
    "updatedAt": "2024-01-15 10:30:00"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 8. Update Own Profile

```http
PATCH /users/updateMe
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Ahmed",
  "lastName": "Hassan Updated",
  "email": "newemail@example.com"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "12345678",
    "firstName": "Ahmed",
    "lastName": "Hassan Updated",
    "email": "newemail@example.com",
    "role": "user",
    "active": true
  }
}
```

**Notes:**
- Only firstName, lastName, and email can be updated
- Email must be unique (cannot use an already registered email)
- Password cannot be updated here (use updateMyPassword endpoint)

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/api/v1/users/updateMe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ahmed",
    "lastName": "Hassan Updated"
  }'
```

---

#### 9. Deactivate Own Account

```http
DELETE /users/deleteMe
Authorization: Bearer <token>
```

**Success Response (204):**
No content returned

**Details:**
- Soft deletes the account (sets active to false)
- User data is preserved in database
- User cannot login after deactivation
- Account can potentially be reactivated by admin

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/users/deleteMe \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 10. Get All Users (Admin Only)

```http
GET /users
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sort` (optional): Sort field (e.g., "email", "-createdAt" for descending)
- `fields` (optional): Comma-separated fields to include

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "12345678",
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "email": "ahmed@example.com",
      "role": "user",
      "active": true,
      "createdAt": "2024-01-15 10:30:00",
      "updatedAt": "2024-01-15 10:30:00"
    },
    {
      "id": "87654321",
      "firstName": "Fatima",
      "lastName": "Ali",
      "email": "fatima@example.com",
      "role": "admin",
      "active": true,
      "createdAt": "2024-01-10 08:15:00",
      "updatedAt": "2024-01-10 08:15:00"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/users?page=1&limit=10&sort=email" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

#### 11. Get User by ID (Admin Only)

```http
GET /users/{id}
Authorization: Bearer <token>
```

**Parameters:**
- `id` (path): User ID

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "12345678",
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "email": "ahmed@example.com",
    "role": "user",
    "active": true,
    "createdAt": "2024-01-15 10:30:00",
    "updatedAt": "2024-01-15 10:30:00"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/v1/users/12345678 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

#### 12. Update User by ID (Admin Only)

```http
PATCH /users/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Parameters:**
- `id` (path): User ID

**Request Body:**
```json
{
  "firstName": "Ahmed",
  "lastName": "Hassan",
  "email": "newemail@example.com",
  "role": "uploader"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "12345678",
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "email": "newemail@example.com",
    "role": "uploader",
    "active": true
  }
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/api/v1/users/12345678 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "uploader"
  }'
```

---

#### 13. Delete User (Admin Only)

```http
DELETE /users/{id}
Authorization: Bearer <token>
```

**Parameters:**
- `id` (path): User ID

**Success Response (204):**
No content returned

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/users/12345678 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Books

#### 1. Get All Books

```http
GET /books
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sort` (optional): Sort field (e.g., "title", "-createdAt")
- `author` (optional): Filter by author ID
- `series` (optional): Filter by series ID
- `categories` (optional): Filter by category ID
- `fields` (optional): Comma-separated fields to include

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "10001234",
      "title": "The Mystery Novel",
      "description": "An engaging mystery that keeps you guessing",
      "author": {
        "id": "98765432",
        "name": "نجيب محفوظ",
        "bio": "Egyptian writer and Nobel laureate"
      },
      "series": {
        "id": "55443322",
        "name": "Mystery Series",
        "description": "A collection of mysteries"
      },
      "categories": [
        {
          "id": "11223344",
          "name": "Mystery",
          "bookCount": 15
        }
      ],
      "fileFormats": {
        "epub": "https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.epub",
        "azw3": "https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.azw3",
        "kfx": "https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.kfx"
      },
      "createdAt": "2024-01-20 14:30:00",
      "updatedAt": "2024-01-20 14:30:00"
    }
  ]
}
```

**cURL Example:**
```bash
# Get first page of books
curl -X GET "http://localhost:3000/api/v1/books?page=1&limit=10"

# Filter by author
curl -X GET "http://localhost:3000/api/v1/books?author=98765432&limit=5"

# Sort by title descending
curl -X GET "http://localhost:3000/api/v1/books?sort=-title"
```

---

#### 2. Create Book with File Upload

```http
POST /books
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Headers:**
- `Authorization: Bearer <token>` (requires admin or uploader role)

**Form Fields:**
- `title` (required): Book title (string)
- `description` (required): Book description (string)
- `author` (required): Author ID (string, must exist)
- `series` (optional): Series ID (string, must exist if provided)
- `categories` (required): JSON array of category IDs (string)
- `epub` (required): EPUB file (binary, max 50MB)
- `azw3` (required): AZW3 file (binary, max 50MB)
- `kfx` (required): KFX file (binary, max 50MB)

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "10001234",
    "title": "The Mystery Novel",
    "description": "An engaging mystery that keeps you guessing",
    "author": "98765432",
    "series": "55443322",
    "categories": ["11223344", "22334455"],
    "fileFormats": {
      "epub": "https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.epub",
      "azw3": "https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.azw3",
      "kfx": "https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.kfx"
    },
    "createdAt": "2024-01-20 14:30:00",
    "updatedAt": "2024-01-20 14:30:00"
  }
}
```

**Error Response (400):**
```json
{
  "status": "fail",
  "message": "All three file formats are required (epub, azw3, kfx)"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=The Mystery Novel" \
  -F "description=An engaging mystery" \
  -F "author=98765432" \
  -F "series=55443322" \
  -F "categories=[\"11223344\",\"22334455\"]" \
  -F "epub=@/path/to/book.epub" \
  -F "azw3=@/path/to/book.azw3" \
  -F "kfx=@/path/to/book.kfx"
```

**Important Notes:**
- All three file formats (epub, azw3, kfx) are **required**
- Each file must not exceed 50MB
- Custom 8-digit numeric ID is automatically generated
- Files are uploaded to DigitalOcean Spaces

See [FILE_UPLOADS.md](FILE_UPLOADS.md) for detailed upload information.

---

#### 3. Get Single Book

```http
GET /books/{id}
```

**Parameters:**
- `id` (path): Book ID

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "10001234",
    "title": "The Mystery Novel",
    "description": "An engaging mystery that keeps you guessing",
    "author": {
      "id": "98765432",
      "name": "نجيب محفوظ",
      "bio": "Egyptian writer"
    },
    "series": {
      "id": "55443322",
      "name": "Mystery Series",
      "description": "A collection of mysteries"
    },
    "categories": [
      {
        "id": "11223344",
        "name": "Mystery",
        "bookCount": 15
      },
      {
        "id": "22334455",
        "name": "Thriller",
        "bookCount": 8
      }
    ],
    "fileFormats": {
      "epub": "https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.epub",
      "azw3": "https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.azw3",
      "kfx": "https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.kfx"
    },
    "createdAt": "2024-01-20 14:30:00",
    "updatedAt": "2024-01-20 14:30:00"
  }
}
```

**Error Response (404):**
```json
{
  "status": "fail",
  "message": "No book found with that ID"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/v1/books/10001234
```

---

#### 4. Update Book

```http
PATCH /books/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Parameters:**
- `id` (path): Book ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "author": "98765432",
  "series": "55443322",
  "categories": ["11223344", "22334455"]
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "10001234",
    "title": "Updated Title",
    "description": "Updated description",
    "author": "98765432",
    "series": "55443322",
    "categories": ["11223344", "22334455"],
    "fileFormats": {
      "epub": "https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.epub",
      "azw3": "https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.azw3",
      "kfx": "https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.kfx"
    }
  }
}
```

**Notes:**
- Only admin and uploader roles can update
- File formats (fileFormats) cannot be updated - delete and recreate the book to change files
- IDs and system fields (createdAt, etc.) cannot be modified

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/api/v1/books/10001234 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description"
  }'
```

---

#### 5. Delete Book

```http
DELETE /books/{id}
Authorization: Bearer <token>
```

**Parameters:**
- `id` (path): Book ID

**Success Response (204):**
No content returned

**Notes:**
- Only admin can delete books
- All three associated files (epub, azw3, kfx) are deleted from cloud storage
- Book record is deleted from database

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/books/10001234 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Authors

#### 1. Get All Authors

```http
GET /authors
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sort` (optional): Sort field (e.g., "name", "-createdAt")

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "98765432",
      "name": "نجيب محفوظ",
      "bio": "Egyptian writer and Nobel laureate",
      "createdAt": "2024-01-10 10:00:00",
      "updatedAt": "2024-01-10 10:00:00"
    },
    {
      "id": "87654321",
      "name": "طه حسين",
      "bio": "Egyptian educator and writer",
      "createdAt": "2024-01-12 15:30:00",
      "updatedAt": "2024-01-12 15:30:00"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/authors?page=1&limit=10&sort=name"
```

---

#### 2. Create Author

```http
POST /authors
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "نجيب محفوظ",
  "bio": "Egyptian writer and Nobel laureate"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "98765432",
    "name": "نجيب محفوظ",
    "bio": "Egyptian writer and Nobel laureate",
    "createdAt": "2024-01-20 10:00:00",
    "updatedAt": "2024-01-20 10:00:00"
  }
}
```

**Notes:**
- Only admin can create authors
- Bio is optional

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/authors \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "نجيب محفوظ",
    "bio": "Egyptian writer"
  }'
```

---

#### 3. Get Author with Books and Series

```http
GET /authors/{id}
```

**Parameters:**
- `id` (path): Author ID

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "98765432",
    "name": "نجيب محفوظ",
    "bio": "Egyptian writer and Nobel laureate",
    "books": [
      {
        "id": "10001234",
        "title": "The Cairo Trilogy",
        "description": "..."
      },
      {
        "id": "10001235",
        "title": "Midaq Alley",
        "description": "..."
      }
    ],
    "series": [
      {
        "id": "55443322",
        "name": "Cairo Series",
        "description": "..."
      }
    ],
    "createdAt": "2024-01-10 10:00:00",
    "updatedAt": "2024-01-10 10:00:00"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/v1/authors/98765432
```

---

#### 4. Update Author

```http
PATCH /authors/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Parameters:**
- `id` (path): Author ID

**Request Body:**
```json
{
  "name": "نجيب محفوظ",
  "bio": "Updated biography"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "98765432",
    "name": "نجيب محفوظ",
    "bio": "Updated biography",
    "createdAt": "2024-01-10 10:00:00",
    "updatedAt": "2024-01-20 14:30:00"
  }
}
```

**Notes:**
- Only admin and uploader can update

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/api/v1/authors/98765432 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated biography"
  }'
```

---

#### 5. Delete Author

```http
DELETE /authors/{id}
Authorization: Bearer <token>
```

**Parameters:**
- `id` (path): Author ID

**Success Response (204):**
No content returned

**Notes:**
- Only admin can delete
- Related books and series are not deleted, but their author references are set to null

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/authors/98765432 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Series

#### 1. Get All Series

```http
GET /series
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sort` (optional): Sort field

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "55443322",
      "name": "Mystery Series",
      "description": "A collection of mysteries",
      "author": {
        "id": "98765432",
        "name": "نجيب محفوظ"
      },
      "createdAt": "2024-01-15 10:00:00",
      "updatedAt": "2024-01-15 10:00:00"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/series?page=1&limit=10"
```

---

#### 2. Create Series

```http
POST /series
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Mystery Series",
  "description": "A collection of mysteries",
  "author": "98765432"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "55443322",
    "name": "Mystery Series",
    "description": "A collection of mysteries",
    "author": "98765432",
    "createdAt": "2024-01-20 10:00:00",
    "updatedAt": "2024-01-20 10:00:00"
  }
}
```

**Notes:**
- Only admin can create
- Author ID must exist

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/series \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mystery Series",
    "description": "A collection of mysteries",
    "author": "98765432"
  }'
```

---

#### 3. Get Series with Books

```http
GET /series/{id}
```

**Parameters:**
- `id` (path): Series ID

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "55443322",
    "name": "Mystery Series",
    "description": "A collection of mysteries",
    "author": {
      "id": "98765432",
      "name": "نجيب محفوظ"
    },
    "books": [
      {
        "id": "10001234",
        "title": "Mystery Book 1",
        "description": "..."
      },
      {
        "id": "10001235",
        "title": "Mystery Book 2",
        "description": "..."
      }
    ],
    "createdAt": "2024-01-15 10:00:00",
    "updatedAt": "2024-01-15 10:00:00"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/v1/series/55443322
```

---

#### 4. Update Series

```http
PATCH /series/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Parameters:**
- `id` (path): Series ID

**Request Body:**
```json
{
  "name": "Updated Series Name",
  "description": "Updated description",
  "author": "87654321"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "55443322",
    "name": "Updated Series Name",
    "description": "Updated description",
    "author": "87654321"
  }
}
```

**Notes:**
- Only admin and uploader can update

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/api/v1/series/55443322 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Series Name"
  }'
```

---

#### 5. Delete Series

```http
DELETE /series/{id}
Authorization: Bearer <token>
```

**Parameters:**
- `id` (path): Series ID

**Success Response (204):**
No content returned

**Notes:**
- Only admin can delete
- Related books are not deleted, but their series reference is cleared

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/series/55443322 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Categories

#### 1. Get All Categories

```http
GET /categories
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sort` (optional): Sort field (e.g., "name", "bookCount")

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "11223344",
      "name": "Mystery",
      "bookCount": 15,
      "createdAt": "2024-01-10 10:00:00",
      "updatedAt": "2024-01-10 10:00:00"
    },
    {
      "id": "22334455",
      "name": "Thriller",
      "bookCount": 8,
      "createdAt": "2024-01-12 15:30:00",
      "updatedAt": "2024-01-12 15:30:00"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/categories?sort=bookCount"
```

---

#### 2. Create Category

```http
POST /categories
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Mystery"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "11223344",
    "name": "Mystery",
    "bookCount": 0,
    "createdAt": "2024-01-20 10:00:00",
    "updatedAt": "2024-01-20 10:00:00"
  }
}
```

**Notes:**
- Only admin can create

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Mystery"}'
```

---

#### 3. Get Category with Books and Count

```http
GET /categories/{id}
```

**Parameters:**
- `id` (path): Category ID

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "11223344",
    "name": "Mystery",
    "bookCount": 15,
    "books": [
      {
        "id": "10001234",
        "title": "Mystery Book 1",
        "description": "...",
        "author": {
          "id": "98765432",
          "name": "نجيب محفوظ"
        }
      },
      {
        "id": "10001235",
        "title": "Mystery Book 2",
        "description": "..."
      }
    ],
    "createdAt": "2024-01-10 10:00:00",
    "updatedAt": "2024-01-10 10:00:00"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/v1/categories/11223344
```

---

#### 4. Update Category

```http
PATCH /categories/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Parameters:**
- `id` (path): Category ID

**Request Body:**
```json
{
  "name": "Mystery & Thriller"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "11223344",
    "name": "Mystery & Thriller",
    "bookCount": 15
  }
}
```

**Notes:**
- Only admin and uploader can update

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/api/v1/categories/11223344 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Mystery & Thriller"}'
```

---

#### 5. Delete Category

```http
DELETE /categories/{id}
Authorization: Bearer <token>
```

**Parameters:**
- `id` (path): Category ID

**Success Response (204):**
No content returned

**Notes:**
- Only admin can delete
- Related books are not deleted, but the category reference is removed from their categories array

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/categories/11223344 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Pagination, Filtering & Sorting

### Pagination

Use `page` and `limit` query parameters:

```http
GET /books?page=2&limit=20
```

**Parameters:**
- `page`: Page number (starts at 1, default: 1)
- `limit`: Items per page (default: 10, maximum: 100)

**Response includes:**
- All matching items
- To calculate pages: `totalItems / limit`

---

### Filtering

Filter resources by field values:

```http
GET /books?author=98765432&categories=11223344
GET /authors?name=نجيب
```

**Available filters vary by endpoint:**
- Books: author, series, categories
- Authors: name (partial match)
- Series: author
- Categories: name (partial match)

---

### Sorting

Use `sort` query parameter. Prefix with `-` for descending order:

```http
GET /books?sort=title              # Ascending
GET /books?sort=-createdAt         # Descending by creation date
GET /authors?sort=name             # Ascending by name
```

---

## Error Handling

### Error Response Format

All errors return a JSON object with:
- `status`: Either "fail" or "error"
- `message`: Human-readable error message

**Example Error Response:**
```json
{
  "status": "fail",
  "message": "Invalid email or password"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limited |
| 500 | Server Error | Unexpected error |

### Common Error Scenarios

#### Invalid Credentials (401)
```json
{
  "status": "fail",
  "message": "Incorrect email or password"
}
```

#### Insufficient Permissions (403)
```json
{
  "status": "fail",
  "message": "You do not have permission to perform this action"
}
```

#### Resource Not Found (404)
```json
{
  "status": "fail",
  "message": "No book found with that ID"
}
```

#### Invalid Input (400)
```json
{
  "status": "fail",
  "message": "Please provide a valid email address"
}
```

#### Rate Limited (429)
```json
{
  "status": "fail",
  "message": "Too many failed login attempts. Please try again later."
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General Limit**: 100 requests per hour per IP address
- **Login Limit**: 5 failed attempts per 15 minutes per IP address

When rate limited, you receive HTTP 429 status code.

**Headers in rate-limited response:**
- `Retry-After`: Seconds to wait before retrying

---

## Next Steps

For detailed information on authentication and file uploads, see:
- [AUTHENTICATION.md](AUTHENTICATION.md)
- [FILE_UPLOADS.md](FILE_UPLOADS.md)

For the OpenAPI specification, see [openapi.yaml](openapi.yaml) (can be imported into Swagger UI).
