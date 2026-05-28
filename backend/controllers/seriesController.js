import Series from '../models/seriesModel.js';
import * as factory from './handlerFactory.js';

export const createSeries = factory.createOne(Series);

export const getSeries = factory.getOne(
  Series,
  [
    { path: 'author', select: 'name id', foreignField: 'id' }, // Links Series.author to Author.id
    {
      path: 'books',
      select: 'title id author', // Removed "-series" exclusion
      foreignField: 'series', // 🌟 FIXED: Looks in Book schema for the 'series' field
      populate: {
        path: 'author',
        select: 'name id',
        foreignField: 'id', // 🌟 FIXED: Links Book.author string to Author.id
      },
    },
  ],
  'series',
);

export const getAllSeries = factory.getAll(Series, {
  path: 'author',
  select: 'name id',
  foreignField: 'id',
});

export const updateSeries = factory.updateOne(Series, 'series');
export const deleteSeries = factory.deleteOne(Series, 'series');
