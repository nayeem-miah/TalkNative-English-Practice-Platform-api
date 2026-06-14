import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import config from "../config";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadToCloudinary = async (file: Express.Multer.File): Promise<any> => {
    // Configuration
    cloudinary.config({
        cloud_name: config.cloudinary.cloud_name,
        api_key: config.cloudinary.api_key,
        api_secret: config.cloudinary.api_secret,
    });

    return new Promise((resolve, reject) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalNameWithoutExt = file.originalname.split('.')[0];
        const publicId = `${originalNameWithoutExt}-${uniqueSuffix}`;

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                public_id: publicId,
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return reject(error);
                }
                resolve(result);
            }
        );

        uploadStream.end(file.buffer);
    });
};

export const fileUpload = {
    upload,
    uploadToCloudinary
};