import { User } from "../models/User.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteOnCloudinary } from "../utils/deleteOnCloudinary.js";
import { extractPublicId } from "../utils/helper.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";

const getAccessAndRefreshToken = async (id) => {
  try {
    const user = User.findById(user);

    if (!user || user.length === 0) {
      throw new ApiError(404, "User does'not exist.");
    }

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    const accessToken = await user.generatedAccessToken();
    const refreshToken = await user.generatedRefreshAccessToken();

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(401, "Somthing went wrong during token generating!!");
  }
};
/*
Register the new User:
1->retrive the user info from body
2->validation of data
3->create the hash pasword that we have to store in db
4->use multer to store the data in localStroage and put the files in couldainary and get url
5-> submit the data in db and send the successful message.
*/
export const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, fullName, password } = req.body;

  const avatarLocalPath = req?.files?.avatar[0]?.path;
  const coverImageLocalPath = req?.files?.coverImage[0]?.path;

  if (
    userName === undefined ||
    email === undefined ||
    password === undefined ||
    fullName === undefined
  ) {
    throw new ApiError(401, "Field's are missing (UserName,Email,Password)!");
  }

  const checkUser = await User.find({
    $or: [{ userName, email }],
  });

  if (checkUser?.length > 0) {
    throw new ApiError(403, "User alreay exist with the given UserName/email.");
  }


  if (avatarLocalPath === undefined || avatarLocalPath === "") {
    throw new ApiError(401, "Avatar File is missing");
  }

  // Upload on cloudinary.
  const avatarCloudinaryReponse = await uploadOnCloudinary(avatarLocalPath);
  const coverImageCloudinaryResponse =
    await uploadOnCloudinary(coverImageLocalPath);

  const avatarCloudinaryUrl = avatarCloudinaryReponse?.url;
  const coverImageCloudinaryUrl = coverImageCloudinaryResponse?.url;


  const user = new User({
    userName,
    fullName,
    email,
    password,
    avatar: avatarCloudinaryUrl,
    coverImage: coverImageCloudinaryUrl || "",
  });

  const accessToken = await user.generatedAccessToken();
  const refreshAccessToken = await user.generatedRefreshAccessToken();


  user.refresherToken = refreshAccessToken;

  const newUser = await user.save();

  const checkUserCreated = await User.findById(user._id).select(
    "-password -refresherToken"
  );

  if (!checkUserCreated) {
    throw new ApiError(
      401,
      "Something went wrong during created the new User!!"
    );
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshAccessToken, options)
    .json({
      message: "User register Successfully!",
      data: checkUserCreated,
    });
});

/*
  Login User
  -We need email,password
  -check email,pasword field is empty or not
  -we fetch the user based on email
  -we see user exist or not
  -we compare the password
  -we genrated the accessToken and refreshToken
  -send the data without password and refreshToken ,send the cookies (accessToken,RefreshToken)
  
*/
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || email?.trim() === "" || password?.trim() === "") {
    throw new ApiError(400, "email or password field is missing");
  }
  const user = await User.find({ email });
  if (user.length === 0) {
    throw new ApiError(404, "User not found with given email");
  }
  const userDetails = user[0];
  const userId = userDetails?._id;
  const isPasswordMatch = await userDetails.isPasswordCorrect(password);

  if (!isPasswordMatch) {
    throw new ApiError(403, "User credentails doesn't match!");
  }

  const accessToken = await userDetails.generatedAccessToken();
  const refreshAccessToken = await userDetails.generatedRefreshAccessToken();

  userDetails.refresherToken = refreshAccessToken;

  const response = await User.findByIdAndUpdate(userId, userDetails);

  const updatedUser = await User.findOne({ _id: userDetails._id }).select(
    "-password -refresherToken"
  );


  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshAccessToken)
    .json(new ApiResponse(200, "User login Successfully", updatedUser));
});

export const logoutUser = asyncHandler(async (req, res) => {});
export const getUser = asyncHandler(async (req, res) => {});

/*

-We can update userName and fullName
- First verify the user using middleware - verifyUser
- Retrive the userName,fullName
- Check basic validation
-
-
*/
export const updateUser = asyncHandler(async (req, res) => {
  const { userName, fullName } = req.body;

  if (!userName || !fullName || userName === "" || fullName === "") {
    throw new ApiError(400, "Field's are missing");
  }

  const userInfo = req.user;
  const user = await User.findById(userInfo?.id);

  user.userName = userName;
  user.fullName = fullName;

  await user.save();

  const updatedUser = await User.findById(userInfo?.id).select(
    "-password -refresherToken"
  );

  res
    .status(200)
    .json(new ApiResponse(200, "User Updated Successfully", updatedUser));
});

/*

*/
export const forgetPassword = asyncHandler(async (req, res) => {});

/*
->First verify the user using middleware.
->retrive the password, newPassword
->check basic validation
->check the old password is correct or not
->retrive the user and update the password and save the user
-> regenrated the accessToken and refreshToken and send the reponse to client
*/
export const changePassword = asyncHandler(async (req, res) => {

  const userInfo = req.user;
  const { password, newPassword } = req.body;

  if (!password || password?.trim() === "") {
    throw new ApiError(400, "Password field is missing!");
  }
  if (!newPassword || newPassword?.trim() === "") {
    throw new ApiError(400, "New Password field is missing");
  }

  const user = await User.findById(userInfo?.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "old Password doesn't matched.");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  const userDetails = await User.findById(userInfo.id);

  const accessToken = await userDetails.generatedAccessToken();
  const refreshAccessToken = await userDetails.generatedRefreshAccessToken();

  userDetails.refresherToken = refreshAccessToken;

  const response = await User.findByIdAndUpdate(userInfo.id, userDetails);


  const updatedUser = await User.findOne({ _id: userDetails._id }).select(
    "-password -refresherToken"
  );


  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshAccessToken)
    .json(new ApiResponse(200, "Pasword changed successfully", updatedUser));
});
/*
->add the middlware for verify the user
->add the multer middleware to handle the avatar
->get the localpath of avatar
->upload on clodinary and get the url
-> retrive the user and updated the url of avatar
-> save the user in db 
-> retrive the updated user and send the response the client
*/
export const updateAvatar = asyncHandler(async (req, res) => {

  const userInfo = req.user;
  const avatarLocalPath = req?.file?.path;
  
  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is missing");
  }
  
  const response = await uploadOnCloudinary(avatarLocalPath);
  const url = response?.url;
  
  if(!url){
    throw new ApiError(400,"Something went wrong while uploading the avatar on cloudinary");
  }

  const user = await User.findById(userInfo.id);

  const oldAvatarurl = user.avatar;
  const publicIdOfAvatar = extractPublicId(oldAvatarurl);

  user.avatar = url;
  
  const deleteResponse = await deleteOnCloudinary([publicIdOfAvatar]);
  
  await user.save({validateBeforeSave:false });
  const updatedUser = await User.find({_id:userInfo.id}).select("-password -refresherToken");
  
  res
  .status(200)
  .json(new ApiResponse(200,"User Avatar Updated Successfully",updatedUser))

});
