## Motamyezon for Text Books

Arabic digital library backend that lets readers browse, search, and download curated ebooks while trusted contributors grow the catalog. The API is built with Node.js, Express, and MongoDB, ships with security best practices, and is covered by integration tests.

### **Motamayezon for Text Books – API (v2) — _In Progress_**

**Note:** This project is still under active development and currently functions as an MVP API only.
Upcoming planned features include:

- Route protection (authentication & authorization)
- Role-based access control (Uploader, Admin, User)
- Secure file uploads for the real book files (EPUB, AZW3, KFX)
- Integration with cloud storage providers such as AWS S3

* RESTful resources for authors, series, categories, books, and users
* JWT authentication with secure cookies and password hashing
* Production-ready middleware stack (Helmet, rate limiting, sanitization, logging)
* Data relationships modeled with Mongoose and populated responses
* Mocha/Chai test suite with Supertest for endpoint coverage

### Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Environment Variables](#environment-variables)
5. [Setup and Run](#setup-and-run)
6. [Test Suite](#test-suite)
7. [API Highlights](#api-highlights)
8. [Data Utilities](#data-utilities)
9. [Common Scripts](#common-scripts)
10. [Contributing](#contributing)

### Project Structure

```
motamyezon_for_text_books_v2/
├─ README.md
├─ backend/
│  ├─ app.js
│  ├─ server.js
│  ├─ routes/
│  ├─ controllers/
│  ├─ models/
│  ├─ utils/
│  ├─ tests/
│  └─ helperFiles/
└─ frontend/
```

### Tech Stack

- Node.js 20+, Express 4
- MongoDB with Mongoose ODM
- JWT for authentication and secure cookie sessions
- Mocha, Chai, Supertest for integration testing
- ESLint (Airbnb) and Prettier for code quality

### Prerequisites

- Node.js 20 or newer
- npm 10+ (bundled with Node 20)
- MongoDB instance (local or hosted)

### Environment Variables

Create `backend/.env` and provide the following values:

```
PORT=3000
DB=your-mongodb-yeery-here
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=the experation of the token e.g 30d
JWT_COOKIE_EXPIRES_IN=the experation of the cookie e.g 30
NODE_ENV=development
```

Adjust the values for your environment (database host, secrets, expiration windows, and desired port).

### Setup and Run

```
git clone https://github.com/bassem-krayem/motamyezon_for_text_books_v2.git
cd motamyezon_for_text_books_v2/backend
npm install
npm run start:dev
```

The API listens on `http://localhost:3000` by default. Update `PORT` in `.env` if you need a different port.

### Test Suite

Run all integration tests:

```
cd backend
npm test
```

Focused runs are available via `npm run test:author`, `test:series`, `test:category`, `test:book`, and `test:user`.

### API Highlights

- `POST /api/v1/users/signup` and `/login` issue JWT-backed sessions
- `GET /api/v1/books` supports filtering, sorting, and pagination via query parameters
- Resource collections implement the standard CRUD pattern: `POST` (create), `GET` (list), `GET /:id` (retrieve), `PATCH /:id` (update), `DELETE /:id` (remove)
- Nested population provides human-readable author, category, and series metadata in book responses
- Global error handling returns consistent JSON envelopes with meaningful status codes

For a detailed endpoint-by-endpoint guide, see `backend/documentation.md`.

### Data Utilities

`backend/helperFiles/data.js` contains import and cleanup helpers for loading reference authors, series, categories, and books. After configuring your `.env`, you can seed data with commands similar to:

```
node helperFiles/data.js import all
node helperFiles/data.js delete all
```

Review the script before running to ensure the sample data fits your needs.

### Common Scripts

- `npm run start` – run the API with nodemon (defaults to `.env` configuration)
- `npm run start:prod` – start the server with production environment variables
- `npm run lint` / `lintall` – lint staged files or the full codebase
- `npm run debug` – start the service under the Node inspector

### Contributing

1. Fork the repository and create a feature branch.
2. Follow existing linting rules (`npm run lintall`).
3. Add or update tests when changing behavior.
4. Open a pull request describing the change and testing performed.
