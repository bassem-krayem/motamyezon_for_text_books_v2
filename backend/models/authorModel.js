import mongoose from 'mongoose';
import addCustomIdPlugin from '../utils/addCustomIdPlugin.js';
import schemaOptions from '../utils/schemaOptions.js';

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bio: String,
  },
  schemaOptions,
);

authorSchema.plugin(addCustomIdPlugin);

authorSchema.index({ name: 1 });

authorSchema.virtual('series', {
  ref: 'Series',
  foreignField: 'author', // field in series model
  localField: 'id',
});

authorSchema.virtual('books', {
  ref: 'Book',
  foreignField: 'author',
  localField: 'id',
});

authorSchema.pre('findOneAndDelete', async function (next) {
  // Get the document that is about to be deleted to obtain its native MongoDB id
  const docToDelete = await this.model.findOne(this.getQuery());
  if (!docToDelete) return next();

  // Since author is REQUIRED on Book and Series, we don't nullify it here.
  // Instead, the book survives safely with its files intact.
  // When populated later, it automatically resolves to null gracefully.

  next();
});

const Author = mongoose.model('Author', authorSchema);

export default Author;
