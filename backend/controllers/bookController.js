import Book from '../models/bookModel.js';
import * as factory from './handlerFactory.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import storage from '../utils/storageService.js';

export const createBook = catchAsync(async (req, res, next) => {
  // STEP 2: Create book document (generates custom 8-digit ID)
  let book;
  try {
    // Create book in MongoDB → triggers plugin to generate custom 8-digit ID
    book = await Book.create(req.body);
  } catch (error) {
    return next(new AppError(`Failed to create book: ${error.message}`, 500));
  }

  // ===== STEP 3: Upload files to DigitalOcean Spaces =====
  const uploadedUrls = [];

  try {
    // Upload EPUB file
    const epubUrl = await storage.uploadFile(
      req.files.epub[0],
      'books',
      req.files.epub[0].originalname,
      book.id,
    );
    uploadedUrls.push(epubUrl);
    book.fileFormats.epub = epubUrl;

    // Upload AZW3 file
    const azw3Url = await storage.uploadFile(
      req.files.azw3[0],
      'books',
      req.files.azw3[0].originalname,
      book.id,
    );
    uploadedUrls.push(azw3Url);
    book.fileFormats.azw3 = azw3Url;

    // Upload KFX file
    const kfxUrl = await storage.uploadFile(
      req.files.kfx[0],
      'books',
      req.files.kfx[0].originalname,
      book.id,
    );
    uploadedUrls.push(kfxUrl);
    book.fileFormats.kfx = kfxUrl;

    // ===== STEP 4: Save book with file URLs =====
    await book.save();

    // ===== STEP 5: Return success response =====
    res.status(201).json({
      status: 'success',
      data: book,
    });
  } catch (error) {
    // ===== ERROR HANDLING: Rollback on failure =====
    console.error(`❌ Upload failed: ${error.message}`);

    // Delete already-uploaded files from DigitalOcean
    await Promise.all(uploadedUrls.map((url) => storage.deleteFile(url)));

    // Delete the book document from MongoDB
    if (book.id) {
      await Book.deleteOne({ id: book.id });
      console.log(`🗑️  Deleted incomplete book document: ${book.id}`);
    }

    // Return error to client
    return next(new AppError(`File upload failed: ${error.message}`, 500));
  }
});

export const deleteBook = catchAsync(async (req, res, next) => {
  const book = await Book.findOne({ id: req.params.id });

  if (!book) {
    return next(new AppError('No book found with that ID', 404));
  }

  // Delete associated files from DigitalOcean Spaces
  const fileUrls = Object.values(book.fileFormats).filter(Boolean);

  // Security/Reliability: Use Promise.allSettled() instead of Promise.all()
  // This ensures all file deletions complete even if some fail
  // Prevents orphaned files if one deletion fails
  const deleteResults = await Promise.allSettled(
    fileUrls.map((url) => storage.deleteFile(url)),
  );

  // Log any failures for monitoring (but don't fail the operation)
  deleteResults.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(
        `⚠️ Failed to delete file ${fileUrls[index]}: ${result.reason}`,
      );
    }
  });

  // Delete the book document from MongoDB
  await Book.deleteOne({ id: req.params.id });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getBook = factory.getOne(
  Book,
  [
    { path: 'author', select: 'name id', foreignField: 'id' },
    { path: 'categories', select: 'name id', foreignField: 'id' },
    { path: 'series', select: 'name id', foreignField: 'id' },
  ],
  'book',
);

export const getAllBooks = factory.getAll(Book, [
  { path: 'author', select: 'name id', foreignField: 'id' },
]);

export const updateBook = factory.updateOne(Book, 'book');
