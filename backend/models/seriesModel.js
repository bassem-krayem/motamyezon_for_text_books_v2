import mongoose from 'mongoose';
import addCustomIdPlugin from '../utils/addCustomIdPlugin.js';

const seriesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'Author',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

seriesSchema.plugin(addCustomIdPlugin);

seriesSchema.virtual('books', {
  ref: 'Book',
  foreignField: 'series',
  localField: '_id',
});

const Series = mongoose.model('Series', seriesSchema);

export default Series;
