import express from 'express';
import * as bookController from '../controllers/bookController.js';
import uploadBookFiles from '../utils/uploadBooksMiddleware.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

router
  .route('/')
  .post(
    protect,
    restrictTo(['admin', 'uploader']),
    uploadBookFiles,
    bookController.createBook,
  )
  .get(bookController.getAllBooks);

router
  .route('/:id')
  .get(bookController.getBook)
  .patch(protect, restrictTo(['admin', 'uploader']), bookController.updateBook)
  .delete(protect, restrictTo(['admin']), bookController.deleteBook);

export default router;
