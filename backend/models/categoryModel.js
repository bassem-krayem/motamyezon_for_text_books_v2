import mongoose from 'mongoose';
import addCustomIdPlugin from '../utils/addCustomIdPlugin.js';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

categorySchema.plugin(addCustomIdPlugin);

// Add a virtual field to get the number of books in this category
categorySchema.virtual('bookCount', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'categories',
  count: true,
});

categorySchema.virtual('books', {
  ref: 'Book',
  foreignField: 'categories',
  localField: '_id',
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
