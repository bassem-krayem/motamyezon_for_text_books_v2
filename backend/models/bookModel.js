import mongoose from 'mongoose';
import addCustomIdPlugin from '../utils/addCustomIdPlugin.js';

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
      type: mongoose.Schema.ObjectId,
      ref: 'Author',
      required: [true, 'Author is required'],
    },
    categories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required'],
      },
    ],
    series: {
      type: mongoose.Schema.ObjectId,
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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

bookSchema.plugin(addCustomIdPlugin);

const Book = mongoose.model('Book', bookSchema);

export default Book;
