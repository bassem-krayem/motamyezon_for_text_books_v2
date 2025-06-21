import Series from '../models/seriesModel.js';
import * as factory from './handlerFactory.js';

export const createSeries = factory.createOne(Series);
export const getSeries = factory.getOne(
  Series,
  [
    { path: 'author', select: 'name id' },
    {
      path: 'books',
      select: 'title id -series',
      populate: { path: 'author', select: 'name id' },
    },
  ],
  'series',
);
export const getAllSeries = factory.getAll(Series, {
  path: 'author',
  select: 'name id',
});
export const updateSeries = factory.updateOne(Series, 'series');
export const deleteSeries = factory.deleteOne(Series, 'series');
