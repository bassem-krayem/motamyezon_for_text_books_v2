import express from 'express';
import * as bookController from '../controllers/bookController.js';
import uploadBookFiles from '../utils/uploadBooksMiddleware.js';
import { protect, restrictTo } from '../controllers/authController.js';
import validate from '../utils/validate.js';
import * as bookRoutesValidationSchemas from '../utils/validationSchemas/bookRoutesValidationSchemas.js';

const router = express.Router();

router
  .route('/')
  .get(
    validate(bookRoutesValidationSchemas.getAllBooksSchema),
    bookController.getAllBooks,
  )
  .post(
    protect,
    restrictTo('admin', 'uploader'),
    uploadBookFiles, // 1. Parses form-data multi-part payloads
    validate(bookRoutesValidationSchemas.createBookSchema), // 2. Validates texts and file arrays
    bookController.createBook,
  );

router
  .route('/:id')
  .get(bookController.getBook)
  .patch(
    protect,
    restrictTo('admin', 'uploader'),
    validate(bookRoutesValidationSchemas.updateBookSchema),
    bookController.updateBook,
  )
  .delete(protect, restrictTo('admin'), bookController.deleteBook);

export default router;
