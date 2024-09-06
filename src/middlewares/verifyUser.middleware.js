import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const verifyUser = asyncHandler(async (req, res, next) => {
  try {
    const cookie = req.cookies;
    const accessToken = cookie.accessToken;

    let isValid = true;
    const decryptedInfo = jwt.verify(
      accessToken,
      process.env.ACCESS_SCERET_KEY
    );
    console.log(accessToken,decryptedInfo);
    
    if (decryptedInfo?.id) {
      req.user = decryptedInfo;
      next();
    } else {
      throw new ApiError(403, "Invaid Token");
    }
  } catch (error) {
    throw new ApiError(403, "Invaid Token");
  }
});
