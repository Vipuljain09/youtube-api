import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  uploadVideoOnCloudinary,
} from "../utils/uploadOnCloudinary.js";
import { deleteOnCloudinary } from "../utils/deleteOnCloudinary.js";
import { extractPublicId } from "../utils/helper.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  console.log(userId, query);

  const userMongooseId = new mongoose.Types.ObjectId(userId);
  const sortTypeValue = sortType === "asc" ? 1 : -1;

  const options = {
    page,
    limit,
  };
  
  const agg = Video.aggregate([
    {
      $match: {
        owner: userMongooseId,
      },
    },
    {
      $match: {
        title: { $regex: query, $options: "i" },
      },
    },
    {
      $sort: {
        [sortBy]: sortTypeValue,
      },
    },
  ]);


  console.log(agg);

  const paginatedResponse = await Video.aggregatePaginate(agg,options);
  console.log(paginatedResponse);

  res.status(200).json(new ApiResponse(200, "Video's fetch successfully", paginatedResponse));
});

/*
->First we verify the user from verifyUser middleware
->We upload the video and thumbnail in local using multer
->we check basic validation of video and thumbnail url, title, description 
-> upload the video on cloudinary and get the information about video and thumbnail
-> create the payload and save in DB
*/

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  const { title, description } = req.body;
  const user = req.user;

  const videoLocalPath = req?.files?.video[0]?.path;
  const thumbnailLocalPath = req?.files?.thumbnail[0]?.path;

  if (!videoLocalPath || videoLocalPath === "") {
    throw new ApiError(404, "Video file is not found!!");
  }
  if (!thumbnailLocalPath || thumbnailLocalPath === "") {
    throw new ApiError(404, "Thumbnail file is not found");
  }

  if (
    !title ||
    title?.trim() === "" ||
    !description ||
    description?.trim() === ""
  ) {
    throw new ApiError(404, "Title or Description is not found");
  }

  const videoResponse = await uploadVideoOnCloudinary(videoLocalPath);
  const thumbnailResponse = await uploadOnCloudinary(thumbnailLocalPath);

  if (videoResponse === null || thumbnailResponse === null) {
    throw new ApiError(
      401,
      "Something went wrong while uploading the file's on Cloudinary."
    );
  }

  const videoUrl = videoResponse?.url;
  const duration = videoResponse?.duration;
  const thumbnailUrl = thumbnailResponse?.url;

  const videoData = new Video({
    title,
    description,
    videoFile: videoUrl,
    duration,
    thumbnail: thumbnailUrl,
    owner: user?.id,
  });

  await videoData.save();
  const VideoDetail = await Video.findById(videoData?._id);

  res
    .status(200)
    .json(new ApiResponse(200, "Video Upload successfully", VideoDetail));
});

/*
->First we veriy the user using middleware
->We check the basic validation for videoId
->we fetch the video deatils and return the response

*/
const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id

  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(404, "VideoId is missing or invalid");
  }

  const videoDeatil = await Video.findById(videoId);

  if (!videoDeatil) {
    throw new ApiError(404, "Video not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Video fetch successfully", videoDeatil));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

/*

*/
const deleteVideo = asyncHandler(async (req, res) => {
  //TODO: delete video

  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(404, "VideoId is missing or invalid");
  }

  const videoDeatil = await Video.findById(videoId);

  if (!videoDeatil) {
    throw new ApiError(400, "Video not found");
  }

  const videopublicId = extractPublicId(videoDeatil?.videoFile || "");
  const thumbnailpublicId = extractPublicId(videoDeatil?.thumbnail || "");

  const deleteVideoCloudinary = await deleteOnCloudinary(videopublicId, true);
  const deleteThumbnailCloudinary = await deleteOnCloudinary(thumbnailpublicId);

  const deleteVideoResponse = await Video.findByIdAndDelete(videoId);

  res.status(200).json(new ApiResponse(200, "Video Delete Successfully"));
});

/*
->Verify the user using middleware
->Check basic validation on videoId
->fetch the videoDetail
->updated the status of video and save 
-> return the updated response
*/
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(404, "VideoId is missing or invalid");
  }

  const videoDeatil = await Video.findById(videoId);

  if (!videoDeatil) {
    throw new ApiError(400, "Video not found");
  }

  videoDeatil.isPublished = !videoDeatil.isPublished;

  await videoDeatil.save();

  const videoUpdatedResponse = await Video.findById(videoId);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Video Publish Status upadted successfully",
        videoUpdatedResponse
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
