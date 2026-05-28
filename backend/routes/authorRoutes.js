import express from 'express';
import * as authorController from '../controllers/authorController.js';
import { protect, restrictTo } from '../controllers/authController.js';
import validate from '../utils/validate.js';
import * as authorRoutesValidationSchemas from '../utils/validationSchemas/authorRoutesValidationSchemas.js';

const router = express.Router();

router
  .route('/')
  .get(authorController.getAllAuthors)
  .post(
    protect,
    restrictTo('admin'),
    validate(authorRoutesValidationSchemas.createAuthorSchema),
    authorController.createAuthor,
  );

router
  .route('/:id')
  .get(authorController.getAuthor)
  .patch(
    protect,
    restrictTo('admin', 'uploader'),
    validate(authorRoutesValidationSchemas.updateAuthorSchema),
    authorController.updateAuthor,
  )
  .delete(protect, restrictTo('admin'), authorController.deleteAuthor);

export default router;
