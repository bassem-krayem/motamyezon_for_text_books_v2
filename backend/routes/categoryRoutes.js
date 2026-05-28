import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(protect, restrictTo(['admin']), categoryController.createCategory);

router
  .route('/:id')
  .get(categoryController.getCategory)
  .patch(
    protect,
    restrictTo(['admin', 'uploader']),
    categoryController.updateCategory,
  )
  .delete(protect, restrictTo(['admin']), categoryController.deleteCategory);

export default router;
