import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dn7y3tuxa',
    api_key: '343875886397291',
    api_secret: 'hZV8JSu1YXv4C-LQiPrAUz0B-MY',
});

// Upload image to Cloudinary
export const uploadToCloudinary = async (base64Image: string): Promise<string> => {
    try {
        const result = await cloudinary.uploader.upload(base64Image);
        return result.secure_url;
    } catch (error: any) {
        console.error('Error uploading to Cloudinary:', error.message);
        throw new Error('Failed to upload image to Cloudinary');
    }
};
