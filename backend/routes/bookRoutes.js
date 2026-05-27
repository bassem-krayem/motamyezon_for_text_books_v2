import express from 'express';
import * as bookController from '../controllers/bookController.js';
import uploadBookFiles from '../utils/uploadBooksMiddleware.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

router
  .route('/')
  .post(protect, uploadBookFiles, bookController.createBook)
  .get(bookController.getAllBooks);

router
  .route('/:id')
  .get(bookController.getBook)
  .patch(bookController.updateBook)
  .delete(bookController.deleteBook);

export default router;
