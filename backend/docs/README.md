# Motamyezon API Documentation

Welcome to the comprehensive documentation for the **Motamyezon Books API** - a complete REST API for managing a digital books platform.

## Quick Navigation

### 📚 Documentation Files

| File | Purpose |
|------|---------|
| **[API.md](API.md)** | Complete API reference with all endpoints and examples |
| **[AUTHENTICATION.md](AUTHENTICATION.md)** | JWT authentication, user roles, and security |
| **[FILE_UPLOADS.md](FILE_UPLOADS.md)** | File upload guide for e-books (EPUB, AZW3, KFX) |
| **[openapi.yaml](openapi.yaml)** | OpenAPI 3.0 specification (machine-readable) |

---

## 🚀 Getting Started

### 1. First Time Setup

**Register a new account:**
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

**Response includes your JWT token:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": { "user": { ... } }
}
```

### 2. Make Authenticated Requests

**Use your token in the Authorization header:**
```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Explore the API

Start with the [**API Documentation**](API.md) to explore all available endpoints.

---

## 📖 Documentation Structure

### For API Users / Integrators

1. **Start here**: [API.md](API.md) - Overview and endpoint reference
2. **Authentication**: [AUTHENTICATION.md](AUTHENTICATION.md) - How to authenticate and manage tokens
3. **File uploads**: [FILE_UPLOADS.md](FILE_UPLOADS.md) - How to upload e-books
4. **OpenAPI**: [openapi.yaml](openapi.yaml) - Import into Swagger UI or Postman

### For API Developers

1. Review [openapi.yaml](openapi.yaml) for schema definitions
2. Check error codes and status codes in [API.md](API.md#error-handling)
3. Implement security practices from [AUTHENTICATION.md](AUTHENTICATION.md#security-best-practices)
4. Handle file uploads per [FILE_UPLOADS.md](FILE_UPLOADS.md)

---

## 🔑 API Overview

### Base URLs
- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://api.motamyezon.com/api/v1`

### API Version
- Current: **v1**

### Resource Collections

| Resource | Purpose | Create | Read | Update | Delete |
|----------|---------|--------|------|--------|--------|
| **Users** | User management | ✓ | ✓ | ✓ | ✓ |
| **Books** | Digital books catalog | ✓ | ✓ | ✓ | ✓ |
| **Authors** | Book authors | ✓ | ✓ | ✓ | ✓ |
| **Series** | Book collections | ✓ | ✓ | ✓ | ✓ |
| **Categories** | Book categorization | ✓ | ✓ | ✓ | ✓ |

### Authentication
- **Type**: JWT (JSON Web Token)
- **Header**: `Authorization: Bearer <token>`
- **Expiry**: 90 days
- **Format**: httpOnly cookie (production)

### Authorization (User Roles)

| Role | Permissions |
|------|-------------|
| **user** | Read public data, manage own profile |
| **uploader** | Create/update books, authors, series, categories |
| **admin** | Full system access |

See [AUTHENTICATION.md](AUTHENTICATION.md#user-roles--permissions) for detailed permissions.

---

## ⚡ Quick Examples

### Example 1: Get All Books

```bash
curl -X GET "http://localhost:3000/api/v1/books?page=1&limit=10"
```

### Example 2: Create a Book

```bash
curl -X POST http://localhost:3000/api/v1/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=My Book" \
  -F "description=A great book" \
  -F "author=98765432" \
  -F "categories=[\"11223344\"]" \
  -F "epub=@/path/to/book.epub" \
  -F "azw3=@/path/to/book.azw3" \
  -F "kfx=@/path/to/book.kfx"
```

### Example 3: Update Profile

```bash
curl -X PATCH http://localhost:3000/api/v1/users/updateMe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ahmed Updated",
    "lastName": "Hassan"
  }'
```

### Example 4: Filter Books by Author

```bash
curl -X GET "http://localhost:3000/api/v1/books?author=98765432&limit=5"
```

### Example 5: Sort and Paginate

```bash
curl -X GET "http://localhost:3000/api/v1/authors?sort=name&page=2&limit=20"
```

See [API.md](API.md) for more examples and detailed documentation.

---

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt hashing with salt
- **Rate Limiting**: 100 requests/hour per IP
- **Input Validation**: Joi schema validation
- **Security Headers**: Helmet.js middleware
- **CORS**: Properly configured cross-origin handling
- **NoSQL Injection Prevention**: express-mongo-sanitize
- **XSS Protection**: xss-clean middleware
- **Parameter Pollution Prevention**: hpp middleware
- **Password Reset**: Secure token-based password reset

See [AUTHENTICATION.md](AUTHENTICATION.md#security-best-practices) for best practices.

---

## 📊 Data Models

### User
- **Fields**: firstName, lastName, email, password, role, active
- **Roles**: user, admin, uploader
- **Methods**: Password change, profile update, soft delete

### Book
- **Fields**: title, description, author, categories, series, fileFormats
- **Features**: Multi-format uploads, cloud storage, virtual population
- **Operations**: Full CRUD with file management

### Author
- **Fields**: name, bio
- **Relations**: Virtual population of books and series
- **Cascade**: Soft delete (preserves related books/series)

### Series
- **Fields**: name, description, author
- **Features**: Virtual book population
- **Relations**: Belongs to author

### Category
- **Fields**: name
- **Features**: Virtual book count, book population
- **Operations**: Full CRUD with array management

---

## 🛠️ Technical Stack

| Component | Technology |
|-----------|-----------|
| Framework | Express.js |
| Database | MongoDB |
| Authentication | JWT + bcrypt |
| Validation | Joi |
| File Upload | Multer |
| Cloud Storage | DigitalOcean Spaces S3 |
| Email | Nodemailer |
| Security | helmet, cors, sanitize, xss-clean |
| Logging | Morgan |

---

## 📝 Common Tasks

### How do I...

**...register an account?**
- See: [API.md - Sign Up](API.md#1-sign-up-register-new-user)

**...login?**
- See: [API.md - Login](API.md#2-login)

**...reset my password?**
- See: [API.md - Forgot Password](API.md#4-forgot-password) and [Reset Password](API.md#5-reset-password)

**...upload a book?**
- See: [FILE_UPLOADS.md - Upload Process](FILE_UPLOADS.md#upload-process)

**...change my password?**
- See: [AUTHENTICATION.md - Changing Password](AUTHENTICATION.md#changing-password-authenticated-users)

**...use the API as an uploader?**
- See: [AUTHENTICATION.md - Uploader Role](AUTHENTICATION.md#2-uploader)

**...implement file upload in my app?**
- See: [FILE_UPLOADS.md - Examples](FILE_UPLOADS.md#examples)

**...understand token expiry?**
- See: [AUTHENTICATION.md - Token Expiry](AUTHENTICATION.md#token-expiry)

**...manage user permissions?**
- See: [AUTHENTICATION.md - User Roles & Permissions](AUTHENTICATION.md#user-roles--permissions)

---

## 🐛 Error Handling

The API returns standard HTTP status codes:

| Code | Meaning | Reference |
|------|---------|-----------|
| 200 | OK | [API.md](API.md#http-status-codes) |
| 201 | Created | [API.md](API.md#http-status-codes) |
| 204 | No Content | [API.md](API.md#http-status-codes) |
| 400 | Bad Request | [API.md](API.md#error-handling) |
| 401 | Unauthorized | [AUTHENTICATION.md](AUTHENTICATION.md#troubleshooting) |
| 403 | Forbidden | [AUTHENTICATION.md](AUTHENTICATION.md#troubleshooting) |
| 404 | Not Found | [API.md](API.md#error-handling) |
| 429 | Rate Limited | [API.md](API.md#rate-limiting) |

---

## 🔗 OpenAPI / Swagger

### Using with Swagger UI

Import `openapi.yaml` into [Swagger Editor](https://editor.swagger.io/):

1. Go to https://editor.swagger.io/
2. Click "File" → "Import URL"
3. Enter: `http://localhost:3000/api/v1/docs/openapi.yaml`
4. Or copy-paste contents of `openapi.yaml`

### Using with Postman

1. Open Postman
2. Click "Import"
3. Select "Paste Raw Text"
4. Paste contents of `openapi.yaml`
5. Collections will be generated from the spec

### Using with VS Code

1. Install "OpenAPI (Swagger) Editor" extension
2. Open `openapi.yaml`
3. Right-click and select "Show OpenAPI preview"

---

## 📞 Support

For issues or questions:

1. **Check the FAQ** - Review relevant documentation section
2. **Review examples** - See [FILE_UPLOADS.md - Examples](FILE_UPLOADS.md#examples)
3. **Check error codes** - See [Error Handling](#-error-handling)
4. **Review test files** - Tests in `/tests/` directory show expected behavior

---

## 📚 Related Files

- **Test Files**: `/tests/` - Mocha test suite with examples
- **Routes**: `/routes/` - API endpoint definitions
- **Controllers**: `/controllers/` - Business logic
- **Models**: `/models/` - MongoDB schemas
- **Validation**: `/utils/validationSchemas/` - Joi validation schemas
- **Middleware**: `/utils/` - Custom middleware functions

---

## ✅ Next Steps

1. **New Users**: Start with [API.md](API.md)
2. **Building Integrations**: Read [FILE_UPLOADS.md](FILE_UPLOADS.md)
3. **Security**: Review [AUTHENTICATION.md](AUTHENTICATION.md)
4. **Advanced**: Import [openapi.yaml](openapi.yaml) into Swagger UI

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**API Base URL**: http://localhost:3000/api/v1
