import express from 'express';
import * as authorController from '../controllers/authorController.js';

const router = express.Router();

router
  .route('/')
  .post(authorController.createAuthor)
  .get(authorController.getAllAuthors);

router
  .route('/:id')
  .get(authorController.getAuthor)
  .patch(authorController.updateAuthor)
  .delete(authorController.deleteAuthor);

export default router;
