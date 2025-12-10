const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} folder - Folder path in Cloudinary (default: 'ecom')
 * @returns {Promise<string>} - Secure URL of uploaded image
 */
const uploadToCloudinary = async (fileBuffer, fileName, folder = 'ecom') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        format: 'webp', // Convert to WebP
        transformation: [
          {
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
        max_file_size: 5 * 1024 * 1024, // 5MB limit
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          // Return only secure_url
          resolve(result.secure_url);
        }
      }
    );

    // Convert buffer to stream
    const stream = Readable.from(fileBuffer);
    stream.pipe(uploadStream);
  });
};

/**
 * Upload file from base64 string
 * @param {string} base64String - Base64 encoded image
 * @param {string} folder - Folder path in Cloudinary (default: 'ecom')
 * @returns {Promise<string>} - Secure URL of uploaded image
 */
const uploadFromBase64 = async (base64String, folder = 'ecom') => {
  try {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    
    const result = await cloudinary.uploader.upload(
      `data:image/webp;base64,${base64Data}`,
      {
        folder: folder,
        resource_type: 'image',
        format: 'webp',
        transformation: [
          {
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
        max_file_size: 5 * 1024 * 1024, // 5MB limit
      }
    );

    return result.secure_url;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Upload file from buffer (used by multer)
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} folder - Folder path in Cloudinary (default: 'ecom')
 * @returns {Promise<string>} - Secure URL of uploaded image
 */
const uploadFromBuffer = async (buffer, fileName, folder = 'ecom') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        format: 'webp',
        transformation: [
          {
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
        max_file_size: 5 * 1024 * 1024, // 5MB limit
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // Convert buffer to stream
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} imageUrl - Full URL or public_id of image
 * @returns {Promise<void>}
 */
const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from URL
    const urlParts = imageUrl.split('/');
    const folderAndFile = urlParts.slice(-2).join('/');
    const publicId = folderAndFile.replace(/\.[^/.]+$/, ''); // Remove extension

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw error for delete failures
  }
};

module.exports = {
  uploadToCloudinary,
  uploadFromBase64,
  uploadFromBuffer,
  deleteFromCloudinary,
};

