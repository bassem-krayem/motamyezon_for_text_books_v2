import express from 'express';
import * as authorController from '../controllers/authorController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

router
  .route('/')
  .post(protect, restrictTo(['admin']), authorController.createAuthor)
  .get(authorController.getAllAuthors);

router
  .route('/:id')
  .get(authorController.getAuthor)
  .patch(
    protect,
    restrictTo(['admin', 'uploader']),
    authorController.updateAuthor,
  )
  .delete(protect, restrictTo('admin'), authorController.deleteAuthor);

export default router;
