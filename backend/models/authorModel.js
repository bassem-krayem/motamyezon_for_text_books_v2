import mongoose from 'mongoose';
import addCustomIdPlugin from '../utils/addCustomIdPlugin.js';

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bio: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

authorSchema.plugin(addCustomIdPlugin);

authorSchema.virtual('series', {
  ref: 'Series',
  foreignField: 'author', // field in series model
  localField: '_id',
});

authorSchema.virtual('books', {
  ref: 'Book',
  foreignField: 'author',
  localField: '_id',
});

const Author = mongoose.model('Author', authorSchema);

export default Author;
