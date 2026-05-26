import express from 'express';
import * as bookController from '../controllers/bookController.js';
import uploadBookFiles from '../utils/uploadBooksMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(uploadBookFiles, bookController.createBook)
  .get(bookController.getAllBooks);

router
  .route('/:id')
  .get(bookController.getBook)
  .patch(bookController.updateBook)
  .delete(bookController.deleteBook);

export default router;
