const schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      // 1. Remove MongoDB internal versions and hidden IDs
      delete ret._id;
      delete ret.__v;

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

export default schemaOptions;
