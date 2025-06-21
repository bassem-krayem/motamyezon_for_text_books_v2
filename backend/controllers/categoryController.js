import Category from '../models/categoryModel.js';
import * as factory from './handlerFactory.js';

export const createCategory = factory.createOne(Category);
export const getCategory = factory.getOne(
  Category,
  [
    {
      path: 'books',
      select: 'title id -categories author',
      populate: { path: 'author', select: 'name id' },
    },
    { path: 'bookCount', select: 'count' },
  ],
  'category',
);
export const getAllCategories = factory.getAll(Category, {
  path: 'bookCount',
  select: 'count',
});
export const updateCategory = factory.updateOne(Category, 'category');
export const deleteCategory = factory.deleteOne(Category, 'category');
