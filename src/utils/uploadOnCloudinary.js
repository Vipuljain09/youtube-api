import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.COULDINARY_DB_NAME,
  api_key: process.env.COULDINARY_API_KEY,
  api_secret: process.env.COULDINARY_SECRET_KEY, // Click 'View Credentials' below to copy your API secret
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    console.log(localFilePath);

    if (!localFilePath) return null;

    const response = await cloudinary.uploader
      .upload(localFilePath)
      .catch((error) => {
        console.log(error);
      });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export const uploadVideoOnCloudinary = async (localFilePath) => {
  try {
    console.log(localFilePath);

    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "video",
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};
