import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { protect, restrictTo } from '../controllers/authController.js';
import validate from '../utils/validate.js';
import * as categoryRoutesValidationSchemas from '../utils/validationSchemas/categoryRoutesValidationSchemas.js';

const router = express.Router();

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(
    protect,
    restrictTo('admin'),
    validate(categoryRoutesValidationSchemas.createCategorySchema),
    categoryController.createCategory,
  );

router
  .route('/:id')
  .get(categoryController.getCategory)
  .patch(
    protect,
    restrictTo('admin', 'uploader'),
    validate(categoryRoutesValidationSchemas.updateCategorySchema),
    categoryController.updateCategory,
  )
  .delete(protect, restrictTo('admin'), categoryController.deleteCategory);

export default router;
