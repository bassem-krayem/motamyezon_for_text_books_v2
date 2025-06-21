✨ Motamyezon for Text Books API Documentation

RESTful API to manage books, authors, series, categories, and users.

✅ Built with MongoDB, Express, and JWT for authentication.

---

📚 /books

Create a Book

POST /api/v1/books

Body:

{
"title": "بين القصرين",
"description": "رواية من ثلاثية نجيب محفوظ عن الحياة الاجتماعية في مصر",
"author": "<author _id>",
"series": "<series _id>",
"categories": ["<category _id>"]
}

Returns:

201 Created

Book document with both \_id and id

\_id is MongoDB internal, used for DB linking. id is custom (8 digits) and used in URLs for security.

Get All Books

GET /api/v1/books

Returns a list of all books with populated author, series, and categories.

Get Book by ID

GET /api/v1/books/:id

Returns full book details. If not found: 404

Update Book

PATCH /api/v1/books/:id

Fields:

{
"title": "زقاق المدق",
"description": "رواية تحكي عن حياة سكان الحي الشعبي",
"author": "<new author _id>",
"series": "<new series _id>",
"categories": ["<new category _id>"]
}

Returns 200 OK or 404 if not found.

Delete Book

DELETE /api/v1/books/:id

Returns 204 No Content or 404

---

👨‍🏫 /authors

Create Author

POST /api/v1/authors

{
"name": "نجيب محفوظ",
"bio": "كاتب مصري حائز على جائزة نوبل في الأدب"
}

Returns 201 Created

Get All Authors

GET /api/v1/authors

Returns array of authors

Get Author by ID

GET /api/v1/authors/:id

Returns full profile including books and series.

Update Author

PATCH /api/v1/authors/:id

{
"name": "New Name",
"bio": "Updated bio"
}

Returns 200 OK or 404

---

🏛️ /series

Create Series

POST /api/v1/series

{
"name": "ثلاثية القاهرة",
"description": "مجموعة روايات تحكي تاريخ القاهرة الاجتماعية",
"author": "<author _id>"
}

Returns 201 Created

Get All Series

GET /api/v1/series

Returns list of series with author info.

Get Series by ID

GET /api/v1/series/:id

Returns full series profile including books and author.

Update Series

PATCH /api/v1/series/:id

{
"name": "updated",
"description": "updated desc",
"author": "<new author _id>"
}

Returns 200 OK or 404

Delete Series

DELETE /api/v1/series/:id

Returns 204 or 404

---

📄 /categories

Create Category

POST /api/v1/categories

{
"name": "روايات"
}

Returns 201 Created

Get All Categories

GET /api/v1/categories

Returns array with book count per category.

Get Category by ID

GET /api/v1/categories/:id

Returns:

- category name
- books
- bookCount

Update Category

PATCH /api/v1/categories/:id

{
"name": "روايات حديثة"
}

Delete Category

DELETE /api/v1/categories/:id

---

👤 /users Authentication

Signup

POST /api/v1/users/signup

{
"firstName": "Jane",
"lastName": "Doe",
"email": "jane@example.com",
"password": "testpass123",
"passwordConfirm": "testpass123"
}

Returns 201 Created, JWT token and user data.

Login

POST /api/v1/users/login

{
"email": "jane@example.com",
"password": "testpass123"
}

Returns 200 OK, JWT token and user.

---

Notes

- All :id values in routes refer to the custom generated id, **not** Mongo’s \_id
- Use \_id only for linking documents internally
- Protected routes (update/delete) will later require authentication via JWT
