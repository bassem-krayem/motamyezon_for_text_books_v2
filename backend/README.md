# Motamyezon Books API Backend

A comprehensive REST API backend for managing a digital books platform built with Express.js, MongoDB, and JWT authentication.

## ❓ What is this?

This is a **REST API** (web service) that allows you to:

- **Manage users** - Registration, login, profiles, passwords
- **Store books** - Create, read, update, delete digital books (EPUB, AZW3, KFX formats)
- **Organize content** - Authors, series, and categories for books
- **Upload files** - Store book files in the cloud (DigitalOcean)
- **Authenticate users** - Secure login with JWT tokens

Think of it as the "backend" that powers a digital book library platform. A frontend app (website/mobile) would connect to this API to let users browse and download books.

## 📖 Documentation

Complete API documentation is available in the `/docs` directory:

| Document                                             | Purpose                                           |
| ---------------------------------------------------- | ------------------------------------------------- |
| **[docs/README.md](docs/README.md)**                 | 👈 **Start here** - Overview and quick navigation |
| **[docs/API.md](docs/API.md)**                       | Complete endpoint reference with examples         |
| **[docs/AUTHENTICATION.md](docs/AUTHENTICATION.md)** | JWT auth, user roles, security                    |
| **[docs/FILE_UPLOADS.md](docs/FILE_UPLOADS.md)**     | E-book upload guide                               |
| **[docs/openapi.yaml](docs/openapi.yaml)**           | OpenAPI 3.0 specification                         |

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- **Node.js 14+** - [Download](https://nodejs.org/) and install
- **MongoDB Atlas account** - [Create free account](https://www.mongodb.com/cloud/atlas) (cloud database, no local installation needed)
- **npm or yarn** - Comes with Node.js automatically
- **Git** - For cloning the repository

### Step 1: Clone & Install Dependencies (2 minutes)

```bash
# Clone the repository
git clone https://github.com/bassem-krayem/motamyezon_for_text_books_v2
cd motamyezon_for_text_books_v2/backend

# Install all required packages
npm install
```

**What this does**: Downloads all the code libraries needed to run the API.

### Step 2: Set Up MongoDB Database (1 minute)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a **free account** (or login if you have one)
3. Click "Create a Database" → Choose "Free" tier
4. Choose any region (e.g., Virginia) → Create cluster
5. Wait for cluster to be created (takes ~5 min)
6. Click "Connect" → Choose "Connect your application"
7. Copy the connection string (looks like: `mongodb+srv://user:password@cluster.mongodb.net/`)
8. Replace `<password>` with your MongoDB password
9. Add `/motamyezon` at the end (database name)

**Final URL should look like:**

```
mongodb+srv://myuser:mypassword@cluster0.xyz.mongodb.net/motamyezon
```

### Step 3: Create Environment File (2 minutes)

Create a `.env` file in the `backend` folder with these values:

```env
NODE_ENV=development
PORT=3000
DB=your-db-string-here
JWT_SECRET=your-long-super-secret-key-here
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
# mail trap info below
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=your-port-here
EMAIL_USERNAME=your-user-name-here
EMAIL_PASSWORD=your-email-password-here
EMAIL_FROM=notifications.motamayezon.org
# DigitalOcean Spaces Configuration
# replace with yours
CLOUD_STORAGE_ENDPOINT=https://lon1.digitaloceanspaces.com
CLOUD_STORAGE_REGION=lon1
CLOUD_STORAGE_KEY_ID=your-key-id-here
CLOUD_STORAGE_SECRET_KEY=your-secret-key-id-here
CLOUD_STORAGE_BUCKET_NAME=motamayezon
```

**Don't have these credentials yet?** See "Getting External Credentials" section below →

### Step 4: Start the Server (30 seconds)

```bash
# Start the development server
npm run start:dev

# You should see:
bassem @ ubuntu:~/motamyezon_for_text_books_v2/backend $ npm run start:dev
> motamyezon_for_text_books_v2@1.0.0 start:dev
> NODE_ENV=development npx nodemon server.js
[nodemon] 3.1.14
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node server.js`
App running on port 3000...
DB successfully connected to:  motamyezon

# or in production mode
npm run start:prod
# you will see this
bassem @ ubuntu:~/motamyezon_for_text_books_v2/backend $ npm run start:prod
> motamyezon_for_text_books_v2@1.0.0 start:prod
> NODE_ENV=production node server.js
App running on port 3000...
DB successfully connected to:  motamyezon
```

**Success!** Your API is now running at `http://localhost:3000`

**📚 View API Documentation with Swagger UI:**

```
http://localhost:3000/api-docs
```

This opens an interactive API documentation where you can test endpoints directly in your browser!

### Step 5: Test It Works (30 seconds)

Open a terminal and run this command:

```bash
# Register a new user
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

**Expected response:**

```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMWExZDMyOGM0Y2NlM2E3YjEwODc0YSIsImlhdCI6MTc4MDA5NjMwNiwiZXhwIjoxNzg3ODcyMzA2fQ.B9SqBhUJkPS2Z3Lhk9Kz0FIsgi5ovXFYZmL4p9d5bDQ",
  "data": {
    "user": {
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "email": "ahmed@example.com",
      "role": "user",
      "active": true,
      "_id": "6a1a1d328c4cce3a7b10874a",
      "id": "65047877",
      "createdAt": "May 30, 2026, 00:11:46",
      "updatedAt": "May 30, 2026, 00:11:46"
    }
  }
}
```

✅ **You're done!** The API is working correctly.

## 📚 Understanding the API

### What You Can Do (Quick Overview)

This API provides endpoints (URLs) for:

| Action            | Endpoint Example                 | Purpose                        |
| ----------------- | -------------------------------- | ------------------------------ |
| Register          | `POST /api/v1/users/signup`      | Create new user account        |
| Login             | `POST /api/v1/users/login`       | Get authentication token       |
| Get Books         | `GET /api/v1/books`              | Browse all books               |
| Create Book       | `POST /api/v1/books`             | Upload new book with files     |
| Upload Files      | `POST /api/v1/books`             | Upload EPUB, AZW3, KFX files   |
| Manage Authors    | `GET/POST/PATCH /api/v1/authors` | Manage book authors            |
| Manage Categories | `GET/POST /api/v1/categories`    | Organize books by category     |
| Manage Series     | `GET/POST /api/v1/series`        | Create book collections/series |

### How It Works (Overview)

```
Client (Website/App)
        ↓
        (HTTP Request)
        ↓
  API (This Backend)
        ↓
   (Validate request)
        ↓
   (Check permissions)
        ↓
   (Query Database)
        ↓
   (Return Response)
        ↓
    (HTTP Response)
        ↓
    Client
```

### Common Workflows

**Workflow 1: User Registration & Login**

```
1. User signs up → POST /users/signup
2. API returns token
3. User stores token
4. User includes token in future requests
```

**Workflow 2: Create & Upload Book**

```
1. Login → POST /users/login → Get token
2. Create author → POST /authors
3. Upload book with files → POST /books
4. API uploads files to DigitalOcean
5. API stores book data in MongoDB
6. Returns book data with file URLs
```

**Workflow 3: Browse Books**

```
1. Get all books → GET /books
2. Filter by author → GET /books?author=123
3. Sort by title → GET /books?sort=title
4. Get single book → GET /books/10001234
5. Download files from URLs
```

---

## 🎯 Swagger UI Documentation

Your API comes with **interactive API documentation** built-in using Swagger UI!

### Access Swagger UI

**While server is running:**

```
http://localhost:3000/api-docs
```

### What You Can Do in Swagger UI

✅ **Browse all endpoints** - See every API endpoint organized by resource  
✅ **View request/response examples** - Understand what data to send and expect  
✅ **Test endpoints live** - Click "Try it out" and make real requests  
✅ **Authenticate with tokens** - Click "Authorize" to add JWT token  
✅ **See error responses** - Understand what happens when things go wrong  
✅ **View data schemas** - See the structure of request/response data

### Quick Swagger UI Test

1. Start server: `npm run start:dev`
2. Open: `http://localhost:3000/api-docs`
3. Click on **"POST /users/signup"**
4. Click **"Try it out"**
5. Fill in the request body (it shows you what's needed)
6. Click **"Execute"**
7. See the response instantly!

### Use Token for Protected Endpoints

1. Sign up or login to get a token (see Swagger UI /users/signup)
2. Copy the token from response
3. Click **"Authorize"** button (top right of Swagger UI)
4. Paste: `Bearer YOUR_TOKEN_HERE`
5. Now test protected endpoints like `/users/me`

**This is the easiest way to test your API!** 🚀

---

## ✨ Features

- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - user, admin, uploader roles
- **Multi-Format File Uploads** - EPUB, AZW3, KFX formats
- **Cloud Storage** - DigitalOcean Spaces S3 integration
- **MongoDB Integration** - Document-based database with virtual population
- **Input Validation** - Joi schema validation
- **Error Handling** - Comprehensive error responses
- **Rate Limiting** - 100 requests/hour per IP
- **Security** - helmet, CORS, sanitization, XSS protection
- **Email Support** - Nodemailer for password resets

## 📚 API Resources

- **Users** - Registration, authentication, profile management
- **Books** - Digital books with multi-format uploads
- **Authors** - Book author management
- **Series** - Book series/collections
- **Categories** - Book categorization

## 🏗️ Project Structure

```
backend/
├── controllers/       # Route handlers
├── models/           # MongoDB schemas
├── routes/           # API endpoints
├── middleware/       # Custom middleware
├── utils/            # Utility functions
├── tests/            # Mocha test suite
├── docs/             # API documentation
├── .env              # Environment variables
├── app.js            # Express app configuration
├── server.js         # Server entry point
└── package.json      # Dependencies
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm run test:user
npm run test:author
# you can take a look in package.json in the section test to see the avalable scripts to test each single resource
# note: if you run the npm test it will take some longer time  cause it's making real requests to the db it may take from 4 to 7 minuts it cover a lot of test cases this is why
```

Test suite includes:

- Authentication (signup, login, logout, password reset)
- Book CRUD operations with file uploads
- Author management
- Series management
- Category management
- Permission and role-based access
- Input validation and error handling
- Pagination, filtering, and sorting
- Mass assignment protection

## 🔒 Security

The API implements multiple security layers:

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Tokens**: Signed tokens with 90-day expiry
- **Password Reset**: Secure token-based reset with 10-minute expiry
- **Rate Limiting**: 100 requests/hour and 5 login attempts/15 minutes
- **Input Validation**: Joi schema validation
- **NoSQL Injection Prevention**: express-mongo-sanitize
- **XSS Protection**: xss-clean middleware
- **CORS**: Properly configured cross-origin handling
- **Security Headers**: Helmet.js middleware
- **Parameter Pollution Prevention**: hpp middleware

See [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md#security-best-practices) for detailed security best practices.

## 🛠️ Development

### Available Scripts

```bash
# Start development server with auto-reload (RECOMMENDED)
npm run start:dev

# Start development server (also works)
npm run start

# Start production server
npm run start:prod

# Run all tests
npm test

# Run specific test file
npm run test:user        # Run user/auth tests
npm run test:author      # Run author tests
npm run test:book        # Run book tests
npm run test:series      # Run series tests
npm run test:category    # Run category tests

# Lint code (check for errors)
npm run lintall

# View available scripts
npm run
```

**Recommended for development:**

```bash
npm run start:dev
```

This starts the server with auto-reload (restarts when you change files).

### Code Style

- ESLint configuration included
- Prettier for code formatting
- Follow existing code patterns

## 📦 Dependencies

### Core

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **joi** - Input validation

### File Upload

- **multer** - File upload handling
- **@aws-sdk/client-s3** - S3/DigitalOcean storage

### Email

- **nodemailer** - Email sending

### Security

- **helmet** - Security headers
- **cors** - CORS handling
- **express-mongo-sanitize** - NoSQL injection prevention
- **xss-clean** - XSS protection
- **hpp** - Parameter pollution prevention
- **express-rate-limit** - Rate limiting

### Development & Testing

- **mocha** - Test framework
- **chai** - Assertions
- **chai-http** - HTTP assertions
- **morgan** - HTTP logging

## 📖 Complete API Documentation

### 🎯 Three Ways to View Documentation

#### 1. **Swagger UI (Recommended - Interactive)** ⭐

```
http://localhost:3000/api-docs
```

- **Best for:** Testing endpoints live, seeing examples
- **Access:** While server is running
- **Features:** Try-it-out button, authentication, instant responses

#### 2. **Markdown Documentation (Detailed)**

See **[docs/README.md](docs/README.md)** for comprehensive guides

**Quick Links by Task:**

- [docs/README.md](docs/README.md) - Overview and quick navigation
- [docs/API.md](docs/API.md) - Complete endpoint reference with curl examples
- [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) - Login, tokens, user roles
- [docs/FILE_UPLOADS.md](docs/FILE_UPLOADS.md) - How to upload book files

#### 3. **Postman (For integration testing)**

1. Open Postman
2. Click "Import" → "Paste Raw Text"
3. Copy contents of [docs/openapi.yaml](docs/openapi.yaml)
4. Paste and import
5. All requests auto-generated!

---

### Common Questions - Quick Answers

| Question                           | Answer                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------- |
| **How do I test the API?**         | Use Swagger UI at `http://localhost:3000/api-docs`                        |
| **How do I login?**                | See [docs/API.md - Login](docs/API.md#2-login) or use Swagger UI          |
| **How do I upload a book?**        | See [docs/FILE_UPLOADS.md](docs/FILE_UPLOADS.md) or use Swagger UI        |
| **What is a JWT token?**           | See [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md)                      |
| **How do I filter/sort/paginate?** | See [docs/API.md - Pagination](docs/API.md#pagination-filtering--sorting) |
| **How do I use Postman?**          | Import [docs/openapi.yaml](docs/openapi.yaml) into Postman                |
| **What endpoints exist?**          | See Swagger UI or [docs/API.md](docs/API.md)                              |

---

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation when needed
4. Ensure all tests pass before submitting

## 👤 Author

Bassem Krayem - bassem.krayem09@gmail.com
