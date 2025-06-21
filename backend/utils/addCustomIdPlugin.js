export default function addCustomIdPlugin(schema, options = {}) {
  const fieldName = options.fieldName || 'id';
  const idLength = options.length || 8;

  // Add the field to the schema
  const schemaField = {};
  schemaField[fieldName] = {
    type: String,
    unique: true,
    required: true,
  };
  schema.add(schemaField);

  // Utility to generate a random numeric string
  function generateRandomId(length = 8) {
    const digits = '0123456789';
    const nonZeroDigits = '123456789';
    let id = nonZeroDigits[Math.floor(Math.random() * nonZeroDigits.length)]; // first digit ≠ 0

    for (let i = 1; i < length; i++) {
      id += digits[Math.floor(Math.random() * digits.length)];
    }
    return id;
  }

  // Pre-save hook to generate and ensure uniqueness
  schema.pre('validate', async function (next) {
    const model = this.constructor;

    if (!this[fieldName]) {
      let newId;
      let exists = true;

      while (exists) {
        newId = generateRandomId(idLength);
        // eslint-disable-next-line no-await-in-loop
        const existingDoc = await model.findOne({ [fieldName]: newId });
        if (!existingDoc) {
          exists = false;
        }
      }

      this[fieldName] = newId;
    }

    next();
  });
}
