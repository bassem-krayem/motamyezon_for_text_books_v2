import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import validator from 'validator';
import addCustomIdPlugin from '../utils/addCustomIdPlugin.js';

// Define schema options with custom toJSON transformation such as removing __v and formatting timestamps
const schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      // 1. Remove MongoDB internal versions and hidden IDs
      delete ret.__v;
      delete ret.passwordChangedAt;

      // Configuration for clean 24-hour time with seconds included
      const dateTimeOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit', // 🌟 Includes seconds explicitly
        hour12: false, // 🌟 Keeps 24-hour format (e.g., 15:30:45)
      };

      // 2. Format timestamps beautifully if they exist
      if (ret.createdAt) {
        ret.createdAt = new Intl.DateTimeFormat(
          'en-US',
          dateTimeOptions,
        ).format(new Date(ret.createdAt));
      }
      if (ret.updatedAt) {
        ret.updatedAt = new Intl.DateTimeFormat(
          'en-US',
          dateTimeOptions,
        ).format(new Date(ret.updatedAt));
      }

      return ret;
    },
  },
  toObject: { virtuals: true },
};

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please enter your first name'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Please enter your last name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: 'Please provide a valid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    role: {
      type: String,
      enum: ['user', 'admin', 'uploader'],
      default: 'user',
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  schemaOptions,
);

// Add custom ID plugin to generate 'id' field from '_id'
userSchema.plugin(addCustomIdPlugin);

// Encrypt password before saving to database
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// Check if password is correct
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Update passwordChangedAt property for the user
// if it detects that the password was modified and the document is not new
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Check if user changed password after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Query middleware to filter out inactive users
userSchema.pre(/^find/, function (next) {
  // 'this' points to the current query
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
