import mongoose from 'mongoose';
import addCustomIdPlugin from '../utils/addCustomIdPlugin.js';
import schemaOptions from '../utils/schemaOptions.js';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    author: {
      type: String,
      ref: 'Author',
      required: [true, 'Author is required'],
    },
    categories: [
      {
        type: String,
        ref: 'Category',
        required: [true, 'Category is required'],
      },
    ],
    series: {
      type: String,
      ref: 'Series',
    },
    fileFormats: {
      epub: {
        type: String,
        trim: true,
      },
      azw3: {
        type: String,
        trim: true,
      },
      kfx: {
        type: String,
        trim: true,
      },
    },
  },
  schemaOptions,
);

bookSchema.plugin(addCustomIdPlugin);

bookSchema.index({ author: 1 });
bookSchema.index({ categories: 1 });
bookSchema.index({ series: 1 });
bookSchema.index({ title: 1 });

const Book = mongoose.model('Book', bookSchema);

export default Book;
