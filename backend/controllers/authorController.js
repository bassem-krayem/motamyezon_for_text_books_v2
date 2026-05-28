import Author from '../models/authorModel.js';
import * as factory from './handlerFactory.js';

export const createAuthor = factory.createOne(Author, ['name', 'bio']);

export const getAllAuthors = factory.getAll(Author);
export const getAuthor = factory.getOne(
  Author,
  [
    { path: 'books', select: 'title id -author', foreignField: 'author' }, // Looks in Book for 'author'
    { path: 'series', select: 'name id -author', foreignField: 'author' }, // Looks in Series for 'author'
  ],
  'author',
);
export const updateAuthor = factory.updateOne(Author, 'author', [
  'name',
  'bio',
]);
export const deleteAuthor = factory.deleteOne(Author, 'author');
