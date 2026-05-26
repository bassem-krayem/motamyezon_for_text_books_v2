import multer from 'multer';
import AppError from './appError.js';

// 1. Tell Multer to keep files in RAM as binary Buffers, NOT write them to your server's local disk
const storage = multer.memoryStorage();

// 2. Create a file filter to reject non-book files before they ever reach your storage space
const fileFilter = (req, file, cb) => {
  // Define the accepted file extensions for your textbooks
  file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

  const allowedExtensions = ['.epub', '.azw3', '.kfx'];

  // Extract the extension of the incoming file and make it lowercase
  const fileExtension = file.originalname
    .substring(file.originalname.lastIndexOf('.'))
    .toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    // Reject invalid extension
    return cb(
      new AppError(
        `Invalid file format (${fileExtension}). Only EPUB, AZW3, and KFX files are allowed.`,
        400,
      ),
      false,
    );
  }

  // Accept the file! Pass null for the error, and true for acceptance
  cb(null, true);
};

// 3. Initialize Multer with our memory storage and validation filters
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 🌟 Limit file size to 50MB max per file to protect your network
  },
});

// 4. Configure Multer to expect exactly 3 specific file fields at the same time
const uploadBookFiles = upload.fields([
  { name: 'epub', maxCount: 1 },
  { name: 'azw3', maxCount: 1 },
  { name: 'kfx', maxCount: 1 },
]);

export default uploadBookFiles;
