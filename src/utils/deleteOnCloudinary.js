import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.COULDINARY_DB_NAME,
  api_key: process.env.COULDINARY_API_KEY,
  api_secret: process.env.COULDINARY_SECRET_KEY, // Click 'View Credentials' below to copy your API secret
});

export const deleteOnCloudinary = async (publicIdList, isVideo = false) => {
  try {
    if (!publicIdList) return null;

    const response = await cloudinary.api.delete_resources(publicIdList, {
      resource_type: isVideo===true ? "video" : "image",
    });
    return response;
  } catch (error) {
    console.log(error);

    return null;
  }
};
