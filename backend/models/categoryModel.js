import mongoose from 'mongoose';
import Book from './bookModel.js';
import addCustomIdPlugin from '../utils/addCustomIdPlugin.js';
import schemaOptions from '../utils/schemaOptions.js';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  schemaOptions,
);

categorySchema.plugin(addCustomIdPlugin);

// Add a virtual field to get the number of books in this category
categorySchema.virtual('bookCount', {
  ref: 'Book',
  localField: 'id',
  foreignField: 'categories',
  count: true,
});

categorySchema.virtual('books', {
  ref: 'Book',
  foreignField: 'categories',
  localField: 'id',
});

categorySchema.pre('findOneAndDelete', async function (next) {
  const docToDelete = await this.model.findOne(this.getQuery());
  if (!docToDelete) return next();

  // Pull this category ID out of all books' categories array
  await Book.updateMany(
    { categories: docToDelete.id },
    { $pull: { categories: docToDelete.id } },
  );

  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
