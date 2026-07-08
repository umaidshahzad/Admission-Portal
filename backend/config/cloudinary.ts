import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using environmental credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer from Multer directly to Cloudinary or falls back to base64 data URL
 * @param fileBuffer Buffer of the uploaded file
 * @param folder Cloudinary folder to organize uploads
 * @param mimetype Optional mimetype for constructing data URLs on fallback
 * @returns Secure URL of the uploaded asset or local base64 data URL
 */
export function uploadToCloudinary(fileBuffer: Buffer, folder: string, mimetype?: string): Promise<string> {
  const isCloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET &&
    !process.env.CLOUDINARY_CLOUD_NAME.startsWith('your_') &&
    !process.env.CLOUDINARY_API_KEY.startsWith('your_')
  );

  const mime = mimetype || 'image/jpeg';

  if (!isCloudinaryConfigured) {
    console.warn('[CLOUDINARY] Cloudinary credentials are not configured or are placeholders. Falling back to local base64 Data URL for document.');
    const base64Data = fileBuffer.toString('base64');
    return Promise.resolve(`data:${mime};base64,${base64Data}`);
  }

  return new Promise((resolve) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: `university_admissions/${folder}`, 
        resource_type: 'auto' // handles PDFs, images, etc.
      },
      (error, result) => {
        if (error) {
          console.error('[CLOUDINARY] Real Cloudinary upload failed. Falling back to local base64 Data URL. Error:', error);
          const base64Data = fileBuffer.toString('base64');
          resolve(`data:${mime};base64,${base64Data}`);
        } else {
          resolve(result?.secure_url || '');
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
}
