import mongoose from 'mongoose';
import Book from './bookModel.js';
import addCustomIdPlugin from '../utils/addCustomIdPlugin.js';
import schemaOptions from '../utils/schemaOptions.js';

const seriesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    author: {
      type: String,
      ref: 'Author',
      required: true,
    },
  },
  schemaOptions,
);

seriesSchema.plugin(addCustomIdPlugin);

seriesSchema.virtual('books', {
  ref: 'Book',
  foreignField: 'series',
  localField: 'id',
});

seriesSchema.pre('findOneAndDelete', async function (next) {
  const docToDelete = await this.model.findOne(this.getQuery());
  if (!docToDelete) return next();

  // Cleanly remove the series link from any books tracking it
  await Book.updateMany(
    { series: docToDelete.id },
    { $unset: { series: '' } }, // Using $unset removes the key entirely or sets to undefined
  );

  next();
});

const Series = mongoose.model('Series', seriesSchema);

export default Series;
