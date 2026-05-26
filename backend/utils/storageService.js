import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';
import AppError from './appError.js';

dotenv.config();

class S3Storage {
  constructor() {
    // 🚚 Initialize the delivery vehicle with your cloud credentials
    this.client = new S3Client({
      endpoint: process.env.CLOUD_STORAGE_ENDPOINT, // e.g., 'https://nyc3.digitaloceanspaces.com'
      region: process.env.CLOUD_STORAGE_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.CLOUD_STORAGE_KEY_ID,
        secretAccessKey: process.env.CLOUD_STORAGE_SECRET_KEY,
      },
    });

    this.bucketName = process.env.CLOUD_STORAGE_BUCKET_NAME;
  }

  /**
   * Uploads a raw file buffer from Multer directly to DigitalOcean Spaces
   * @param {Object} file - The individual req.files[fieldName][0] object from Multer
   * @param {string} folder - Destination virtual folder (e.g., 'books', 'authors')
   * @param {string} [customFilename] - Optional display name for the file download metadata (e.g., Book Title)
   * @returns {Promise<string>} - The final public download URL string
   */
  // utils/s3Storage.js

  async uploadFile(file, folder = 'books', customFilename = '', bookId = '') {
    if (!file || !file.buffer) {
      throw new AppError(
        'File upload failed: Missing binary file data buffer.',
        400,
      );
    }

    try {
      const extension = path.extname(file.originalname); // e.g., '.kfx'

      // Clean, standard disk tracking layout: "books/95857992.kfx"
      const fileName = `${folder}/${bookId}${extension}`;

      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      // Use your repaired, beautiful Arabic title for the download slip metadata!
      if (customFilename) {
        const safeDownloadName = encodeURIComponent(`${customFilename}`);
        uploadParams.ContentDisposition = `attachment; filename*=UTF-8''${safeDownloadName}`;
      }

      await this.client.send(new PutObjectCommand(uploadParams));

      const cleanEndpoint = process.env.CLOUD_STORAGE_ENDPOINT.replace(
        'https://',
        '',
      );
      return `https://${this.bucketName}.${cleanEndpoint}/${fileName}`;
    } catch (error) {
      throw new AppError(`Cloud Storage Upload Error: ${error.message}`, 500);
    }
  } /**
   * Removes an asset permanently from your cloud space using its stored public URL
   * @param {string} fileUrl - The full public link saved in the database document
   * @returns {Promise<void>}
   */

  async deleteFile(fileUrl) {
    if (!fileUrl) return;

    try {
      // Extract the key path safely out of the public URL string
      const urlParts = fileUrl.split(`${this.bucketName}.`);
      if (urlParts.length < 2) return;

      const keyPath = urlParts[1].substring(urlParts[1].indexOf('/') + 1);

      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: keyPath,
        }),
      );
    } catch (error) {
      // Logs the background failure but prevents blocking your primary controller execution loop
      console.error(`Cloud Storage Deletion Warning: ${error.message}`);
    }
  }
}

// Instantiate and export a single global singleton instance
const storageService = new S3Storage();
export default storageService;
