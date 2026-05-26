import Book from '../models/bookModel.js';
import * as factory from './handlerFactory.js';

export const createBook = factory.createOne(Book);

export const getBook = factory.getOne(
  Book,
  [
    { path: 'author', select: 'name id', foreignField: 'id' },
    { path: 'categories', select: 'name id', foreignField: 'id' },
    { path: 'series', select: 'name id', foreignField: 'id' },
  ],
  'book',
);

export const getAllBooks = factory.getAll(Book, [
  { path: 'author', select: 'name id', foreignField: 'id' },
]);

export const updateBook = factory.updateOne(Book, 'book');

export const deleteBook = factory.deleteOne(Book, 'book');
