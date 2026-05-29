# Motamyezon Books API Backend

A comprehensive REST API backend for managing a digital books platform built with Express.js, MongoDB, and JWT authentication.

---

## 📑 Table of Contents

- [What is this?](#-what-is-this)
- [Quick Start](#-quick-start-5-minutes)
- [Understanding the API](#-understanding-the-api)
- [Features](#-features)
- [API Resources](#-api-resources)
- [Swagger UI Documentation](#-swagger-ui-documentation)
- [Environment Variables](#-environment-variables---detailed-guide)
- [Getting External Credentials](#getting-external-credentials)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Verify Your Setup](#-verify-your-setup-works)
- [Development](#-development)
- [Dependencies](#-dependencies)
- [Troubleshooting](#-troubleshooting)
- [Complete API Documentation](#-complete-api-documentation)
- [Next Steps](#-next-steps-after-setup)
- [Contributing](#-contributing)
- [Author & Links](#-author--links)

---

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

| Document | Purpose |
|----------|---------|
| **[docs/README.md](docs/README.md)** | 👈 **Start here** - Overview and quick navigation |
| **[docs/API.md](docs/API.md)** | Complete endpoint reference with examples |
| **[docs/AUTHENTICATION.md](docs/AUTHENTICATION.md)** | JWT auth, user roles, security |
| **[docs/FILE_UPLOADS.md](docs/FILE_UPLOADS.md)** | E-book upload guide |
| **[docs/openapi.yaml](docs/openapi.yaml)** | OpenAPI 3.0 specification |

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- **Node.js 14+** - [Download](https://nodejs.org/) and install
- **MongoDB Atlas account** - [Create free account](https://www.mongodb.com/cloud/atlas) (cloud database, no local installation needed)
- **npm or yarn** - Comes with Node.js automatically
- **Git** - For cloning the repository

### Step 1: Clone & Install Dependencies (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd backend

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
# Database (from MongoDB Atlas - step above)
DATABASE_URL=mongodb+srv://myuser:mypassword@cluster0.xyz.mongodb.net/motamyezon

# JWT Secret (any random string, used to secure tokens)
JWT_SECRET=your_super_secret_key_12345
JWT_EXPIRE=90d

# Email (for password reset - use Mailtrap or Gmail)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=465
EMAIL_USER=your_mailtrap_email@gmail.com
EMAIL_PASS=your_mailtrap_password
EMAIL_FROM=noreply@motamyezon.com

# Storage (DigitalOcean Spaces - for storing book files)
DIGITALOCEAN_ACCESS_KEY=your_digitalocean_access_key
DIGITALOCEAN_SECRET_KEY=your_digitalocean_secret_key
DIGITALOCEAN_SPACE_NAME=motamayezon
DIGITALOCEAN_SPACE_REGION=lon1

# Server
NODE_ENV=development
PORT=3000
```

**Don't have these credentials yet?** See "Getting External Credentials" section below →

### Step 4: Start the Server (30 seconds)

```bash
# Start the development server
npm run start:dev

# You should see:
# Server is running on port 3000...
# DB connection successful
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

✅ **You're done!** The API is working correctly.

## 📚 Understanding the API

### What You Can Do (Quick Overview)

This API provides endpoints (URLs) for:

| Action | Endpoint Example | Purpose |
|--------|------------------|---------|
| Register | `POST /users/signup` | Create new user account |
| Login | `POST /users/login` | Get authentication token |
| Get Books | `GET /books` | Browse all books |
| Create Book | `POST /books` | Upload new book with files |
| Upload Files | `POST /books` | Upload EPUB, AZW3, KFX files |
| Manage Authors | `GET/POST/PATCH /authors` | Manage book authors |
| Manage Categories | `GET/POST /categories` | Organize books by category |
| Manage Series | `GET/POST /series` | Create book collections/series |

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
npm test tests/auth.test.js

# Run tests with coverage
npm run test:coverage
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

## 📝 Environment Variables - Detailed Guide

### What are environment variables?
Environment variables are settings that change depending on where the code is running (development, testing, production). They contain sensitive info like passwords that should **never** be in your code.

### How to set them up:

1. Create a file named `.env` in the `backend` folder
2. Copy the values below
3. Replace the placeholders with your actual credentials
4. **⚠️ NEVER commit `.env` to Git** (it contains passwords!)

### Complete `.env` Template

```env
# ============================================
# DATABASE - MongoDB (Cloud database)
# ============================================
# Get from MongoDB Atlas (see "Getting External Credentials" below)
# Format: mongodb+srv://username:password@cluster.mongodb.net/database_name
DATABASE_URL=mongodb+srv://myuser:mypassword@cluster0.xyz.mongodb.net/motamyezon

# ============================================
# JWT - Authentication Tokens
# ============================================
# JWT_SECRET: Any random string (used to sign login tokens)
# Can be anything - just make it long and random
# Example: "your_super_secret_key_abc123_xyz789_!@#$%"
JWT_SECRET=your_super_secret_random_string_here

# How long tokens stay valid before user must login again
# Format: number + unit (d=days, h=hours)
JWT_EXPIRE=90d

# ============================================
# EMAIL - For password reset emails
# ============================================
# Method 1: Use Mailtrap (Free, no SMTP configuration needed)
#   1. Sign up at https://mailtrap.io
#   2. Create new inbox
#   3. Copy SMTP settings from "Integrations" tab
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=465
EMAIL_USER=your_mailtrap_username@gmail.com
EMAIL_PASS=your_mailtrap_password
EMAIL_FROM=noreply@motamyezon.com

# Method 2: Use Gmail (if you enable "Less secure apps" or use app password)
#   1. Enable 2-factor auth on Gmail
#   2. Create "App Password" in Gmail settings
#   3. Use the app password below
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=465
# EMAIL_USER=your.email@gmail.com
# EMAIL_PASS=your_gmail_app_password
# EMAIL_FROM=your.email@gmail.com

# ============================================
# STORAGE - DigitalOcean Spaces (File uploads)
# ============================================
# Get from DigitalOcean Spaces (see "Getting External Credentials" below)
# This is S3-compatible cloud storage for book files
DIGITALOCEAN_ACCESS_KEY=your_digitalocean_access_key
DIGITALOCEAN_SECRET_KEY=your_digitalocean_secret_key
DIGITALOCEAN_SPACE_NAME=motamayezon
DIGITALOCEAN_SPACE_REGION=lon1

# ============================================
# SERVER - Application settings
# ============================================
# development = detailed error messages (for debugging)
# production = hide error details (for security)
NODE_ENV=development

# Which port the server listens on
# Default: 3000
# If port 3000 is busy, change to: 3001, 3002, etc.
PORT=3000
```

### Getting External Credentials

#### MongoDB Atlas (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster (free tier)
4. Click "Connect" → "Drivers" → copy connection string
5. Replace `<password>` with your password
6. Replace `<username>` with your username

#### Mailtrap (Email - Free)
1. Go to [Mailtrap.io](https://mailtrap.io)
2. Create free account
3. Create new inbox
4. Go to "Integrations" tab
5. Copy SMTP settings (Host, Port, User, Pass)
6. Use these in `.env`

#### DigitalOcean Spaces (File Storage)
1. Go to [DigitalOcean](https://www.digitalocean.com) (free account with $5 credit)
2. Create account
3. Go to "Spaces" → Create new space
4. Name it: `motamayezon`
5. Choose region: `lon1` (London)
6. Go to "API" → create access key
7. Copy Access Key and Secret Key
8. Use these in `.env`

### Variable Descriptions

| Variable | Purpose | Example | Required? |
|----------|---------|---------|-----------|
| `DATABASE_URL` | MongoDB connection string | `mongodb+srv://...` | ✅ Yes |
| `JWT_SECRET` | Secret to sign auth tokens | Any random string | ✅ Yes |
| `JWT_EXPIRE` | Token expiry time | `90d` | ✅ Yes |
| `EMAIL_HOST` | SMTP server for emails | `smtp.mailtrap.io` | ✅ Yes |
| `EMAIL_PORT` | SMTP port | `465` | ✅ Yes |
| `EMAIL_USER` | SMTP username | Your email | ✅ Yes |
| `EMAIL_PASS` | SMTP password | Your password | ✅ Yes |
| `EMAIL_FROM` | From address for emails | `noreply@example.com` | ✅ Yes |
| `DIGITALOCEAN_ACCESS_KEY` | DO Spaces access key | Long random string | ✅ Yes |
| `DIGITALOCEAN_SECRET_KEY` | DO Spaces secret | Long random string | ✅ Yes |
| `DIGITALOCEAN_SPACE_NAME` | DO Spaces bucket name | `motamayezon` | ✅ Yes |
| `DIGITALOCEAN_SPACE_REGION` | DO Spaces region | `lon1` | ✅ Yes |
| `NODE_ENV` | Environment mode | `development` or `production` | ✅ Yes |
| `PORT` | Server port | `3000` | ✅ Yes |

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

## ✅ Verify Your Setup Works

After starting the server, test these endpoints to make sure everything is configured correctly:

### 1. Server is Running
```bash
# Should return 404 (endpoint doesn't exist, but server is running)
curl http://localhost:3000/

# Expected: HTML error page or "Cannot GET /"
```

### 2. Database Connection
```bash
# Register a user (tests database connection)
curl -X POST http://localhost:3000/api/v1/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "TestPass123",
    "passwordConfirm": "TestPass123"
  }'

# Expected: User created with token
```

### 3. Login Works
```bash
# Login with the user you just created
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Expected: Login successful with token
# Copy the token (everything after "token": ")
```

### 4. Authentication Works
```bash
# Get your profile (requires the token)
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Replace YOUR_TOKEN_HERE with actual token from step 3
# Expected: Your user profile
```

### 5. Database Operations
```bash
# Create a book category
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mystery"
  }'

# Expected: Category created
```

✅ **If all 5 tests pass, your API is fully configured and working!**

---

## 🐛 Troubleshooting

### Problem: Server Won't Start

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:27017`

**Cause:** MongoDB connection failed

**Solutions:**
1. Check `DATABASE_URL` in `.env` is correct
2. Verify you're using MongoDB Atlas (cloud, not local)
3. Make sure password doesn't have special characters that need URL encoding
4. In MongoDB Atlas: Network Access → Add your IP address
5. Test connection URL in MongoDB Atlas "Connect" dialog

---

### Problem: "Cannot GET /api/v1/users/me"

**Error:** `404 Not Found`

**Cause:** Missing or invalid JWT token

**Solution:**
```bash
# Make sure you're sending token correctly
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN"

# Common mistakes:
# - Missing "Bearer " prefix
# - Token cut off (incomplete)
# - Using wrong token
```

---

### Problem: Port 3000 Already in Use

**Error:** `Error: listen EADDRINUSE :::3000`

**Cause:** Another application is using port 3000

**Solutions:**

**Option 1: Use different port**
```bash
# In .env, change:
PORT=3001

# Or:
PORT=3002 npm run dev
```

**Option 2: Kill the process using port 3000**
```bash
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

### Problem: "All three file formats are required"

**Error:** When trying to upload a book

**Cause:** Missing EPUB, AZW3, or KFX file

**Solution:**
```bash
# Make sure you include ALL three files:
curl -X POST http://localhost:3000/api/v1/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=My Book" \
  -F "description=Description" \
  -F "author=AUTHOR_ID" \
  -F "categories=[\"CATEGORY_ID\"]" \
  -F "epub=@/path/to/book.epub" \
  -F "azw3=@/path/to/book.azw3" \
  -F "kfx=@/path/to/book.kfx"
```

---

### Problem: "Author with ID X does not exist"

**Error:** When creating a book

**Cause:** Author ID is invalid

**Solution:**
1. Create an author first:
```bash
curl -X POST http://localhost:3000/api/v1/authors \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "bio": "Author"}'
```
2. Use the ID from the response when creating the book

---

### Problem: Email/Password Reset Not Working

**Error:** Emails not being sent

**Cause:** Mailtrap credentials are wrong

**Solution:**
1. Check `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` in `.env`
2. Go to Mailtrap.io → Your inbox → Integration settings
3. Copy SMTP credentials again
4. Password resets might land in Mailtrap inbox (not real email)
5. Check Mailtrap inbox at https://mailtrap.io/dashboard

---

### Problem: Files Not Uploading to Cloud Storage

**Error:** File upload fails with permission error

**Cause:** DigitalOcean credentials are wrong

**Solution:**
1. Check credentials in `.env`:
   - `DIGITALOCEAN_ACCESS_KEY`
   - `DIGITALOCEAN_SECRET_KEY`
2. Regenerate keys in DigitalOcean:
   - API → Tokens → Generate new key
3. Make sure Spaces bucket exists:
   - Spaces → motamayezon
4. Check region matches: `lon1` (London)

---

### Problem: Tests Failing

**Error:** When running `npm test`

**Solution:**
1. Make sure MongoDB is accessible
2. Use a test database (or separate `.env.test`)
3. Check all environment variables are set
4. Run: `npm test -- --reporter json` for detailed output

---

### Still Having Issues?

1. **Check the logs:** Look at error message in terminal
2. **Review documentation:** See [docs/](docs/) folder
3. **Check test files:** [tests/](tests/) show working examples
4. **Verify setup:** Follow "Verify Your Setup Works" section above

See [docs/FILE_UPLOADS.md](docs/FILE_UPLOADS.md#troubleshooting) for detailed file upload troubleshooting.

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

| Question | Answer |
|----------|--------|
| **How do I test the API?** | Use Swagger UI at `http://localhost:3000/api-docs` |
| **How do I login?** | See [docs/API.md - Login](docs/API.md#2-login) or use Swagger UI |
| **How do I upload a book?** | See [docs/FILE_UPLOADS.md](docs/FILE_UPLOADS.md) or use Swagger UI |
| **What is a JWT token?** | See [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) |
| **How do I filter/sort/paginate?** | See [docs/API.md - Pagination](docs/API.md#pagination-filtering--sorting) |
| **How do I use Postman?** | Import [docs/openapi.yaml](docs/openapi.yaml) into Postman |
| **What endpoints exist?** | See Swagger UI or [docs/API.md](docs/API.md) |

---

## 🎯 Next Steps After Setup

### Step 1: Open Swagger UI (2 min) ⭐ START HERE
**Easiest way to explore and test the API:**

1. Make sure server is running: `npm run start:dev`
2. Open in browser: `http://localhost:3000/api-docs`
3. You'll see all endpoints organized by resource
4. Click any endpoint to see details and examples

### Step 2: Create Test Data with Swagger UI (5 min)
Using Swagger UI, test these endpoints in order:

1. **Sign up a user**
   - Click "POST /users/signup"
   - Click "Try it out"
   - Fill in: firstName, lastName, email, password, passwordConfirm
   - Click "Execute"
   - **Copy the token from response**

2. **Authorize for protected endpoints**
   - Click "Authorize" button (top right of Swagger)
   - Paste: `Bearer YOUR_TOKEN_HERE`
   - Click "Authorize"

3. **Create an author**
   - Click "POST /authors"
   - Click "Try it out"
   - Fill in: name and bio
   - Click "Execute"
   - **Copy the author ID from response**

4. **Create a category**
   - Click "POST /categories"
   - Click "Try it out"
   - Fill in: name (e.g., "Romance")
   - Click "Execute"

### Step 3: Test All Major Endpoints (10 min)
In Swagger UI, try these endpoints:

- **GET /books** - List all books
- **GET /authors** - List all authors
- **GET /users/me** - Get your profile
- **PATCH /users/updateMe** - Update your profile
- **GET /books?sort=title** - Sort books by title
- **PATCH /categories/{id}** - Update a category

### Step 4: Read Detailed Documentation (10 min)
For deeper understanding:
- [docs/README.md](docs/README.md) - Overview and navigation
- [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) - How authentication works
- [docs/FILE_UPLOADS.md](docs/FILE_UPLOADS.md) - How to upload book files

### Step 5: Use Postman for API Integration (Optional - 5 min)
If you want to use Postman instead of Swagger UI:

1. Open Postman
2. Click "Import"
3. Choose "Paste Raw Text"
4. Copy contents of `docs/openapi.yaml`
5. Paste and import
6. All requests auto-generated!

---

**Pro Tips:**
- 💡 Use Swagger UI while developing - it's the fastest way to test
- 💡 Test endpoints in the order: signup → create authors → create categories → create books
- 💡 Always copy the token and use "Authorize" for protected endpoints
- 💡 Watch the response JSON to understand data structure

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation when needed
4. Ensure all tests pass before submitting

## 📄 License

MIT License

## 👤 Author

Bassem Krayem - bassem.krayem09@gmail.com

## 🔗 Links

- **Frontend**: [../frontend](../frontend)
- **Documentation**: [./docs](./docs)
- **Tests**: [./tests](./tests)

---

**API Base URL**: http://localhost:3000/api/v1  
**Current Version**: 1.0.0  
**Last Updated**: January 2024