import Category from '../models/categoryModel.js';
import * as factory from './handlerFactory.js';

export const createCategory = factory.createOne(Category);

export const getCategory = factory.getOne(
  Category,
  [
    {
      path: 'books',
      select: 'title id author -categories',
      foreignField: 'categories', // Looks in Book array for 'categories'
      populate: {
        path: 'author',
        select: 'name id',
        foreignField: 'id', // 🌟 FIXED: Links Book.author string to Author.id
      },
    },
    { path: 'bookCount' }, // count virtuals don't need manual select overrides
  ],
  'category',
);

export const getAllCategories = factory.getAll(Category, {
  path: 'bookCount',
});

export const updateCategory = factory.updateOne(Category, 'category');

export const deleteCategory = factory.deleteOne(Category, 'category');
