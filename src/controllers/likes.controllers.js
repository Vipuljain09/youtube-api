import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/User.models.js";
import { Comment } from "../models/comment.models.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on video
  const { videoId } = req.params;
  const userId = req.user.id;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Video Id's is missing or invalid");
  }

  const videoDeatil = await Video.findById(videoId);

  if (!videoDeatil) {
    throw new ApiError(404, "Video does not existed.");
  }

  const userDetails = await User.findById(userId);

  if (!userDetails) {
    throw new ApiError(404, "User does not existed.");
  }
  const mongooseVideoId = new mongoose.Types.ObjectId(videoId);
  const mongooseUserId = new mongoose.Types.ObjectId(userId);
  const likeDetails = await Like.aggregate([
    {
      $match: {
        likedBy: mongooseUserId,
        video: mongooseVideoId,
      },
    },
  ]);

  if (likeDetails.length === 0) {
    const likeData = new Like({
      likedBy: userId,
      video: videoId,
    });
    await likeData.save();
    const result = await Like.aggregate([
      {
        $match: {
          likedBy: mongooseUserId,
          video: mongooseVideoId,
        },
      },
    ]);
    if (!result || result.length === 0) {
      throw new ApiError(
        400,
        "Something went wrong during db opertion, try again later"
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Video Like's added Successfully", result));
  } else {
    const result = await Like.findByIdAndDelete(likeDetails[0]._id);
    return res
      .status(200)
      .json(new ApiResponse(200, "Video Like's removed Successfully", result));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on comment
  const { commentId } = req.params;

  const userId = req.user.id;

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment Id's is missing or invalid");
  }

  const commentDeatil = await Comment.findById(commentId);

  if (!commentDeatil) {
    throw new ApiError(404, "Comment does not existed.");
  }

  const userDetails = await User.findById(userId);

  if (!userDetails) {
    throw new ApiError(404, "User does not existed.");
  }

  const mongooseCommentId = new mongoose.Types.ObjectId(commentId);
  const mongooseUserId = new mongoose.Types.ObjectId(userId);

  const likeDetails = await Like.aggregate([
    {
      $match: {
        likedBy: mongooseUserId,
        comment: mongooseCommentId,
      },
    },
  ]);

  if (likeDetails.length === 0) {
    const likeData = new Like({
      likedBy: userId,
      comment: commentId,
    });
    await likeData.save();
    const result = await Like.aggregate([
      {
        $match: {
          likedBy: mongooseUserId,
          comment: mongooseCommentId,
        },
      },
    ]);

    if (!result || result.length === 0) {
      throw new ApiError(
        400,
        "Something went wrong during db opertion, try again later"
      );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Comment Like's added Successfully", result[0])
      );
  } else {
    const result = await Like.findByIdAndDelete(likeDetails[0]._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Comment Like's removed Successfully", result)
      );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
});

//Get all liked of register user
const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user.id;

  const userDetails = await User.findById(userId);

  if (!userDetails) {
    throw new ApiError(404, "User does not existed.");
  }
  const mongooseUserId = new mongoose.Types.ObjectId(userId);

  const allLikedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: mongooseUserId,
        video: { $ne: null },
      },
    },
  ]);

  if (!allLikedVideos) {
    throw new ApiError(
      400,
      "Something went wrong during db opertion, try again later"
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Fetch all liked successfully", allLikedVideos));
});

// get count of likes on given videoId
export const getVideoCountLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.id;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Video Id's is missing or invalid");
  }

  const videoDeatil = await Video.findById(videoId);

  if (!videoDeatil) {
    throw new ApiError(404, "Video does not existed.");
  }

  const userDetails = await User.findById(userId);

  if (!userDetails) {
    throw new ApiError(404, "User does not existed.");
  }
  const mongooseVideoId = new mongoose.Types.ObjectId(videoId);
  const mongooseUserId = new mongoose.Types.ObjectId(userId);

  const likeDetails = await Like.aggregate([
    {
      $match: {
        video: mongooseVideoId,
      },
    },
  ]);

  if (!likeDetails) {
    throw new ApiError(
      400,
      "Something went wrong during aggeration operation, try again later"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Video Like fetch successfully", {
        count: likeDetails.length,
      })
    );
});

// get count of likes on given commentId
export const getCommentCountLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment Id's is missing or invalid");
  }

  const commentDeatil = await Comment.findById(commentId);

  if (!commentDeatil) {
    throw new ApiError(404, "Comment does not existed.");
  }

  const userDetails = await User.findById(userId);

  if (!userDetails) {
    throw new ApiError(404, "User does not existed.");
  }
  const mongooseCommentId = new mongoose.Types.ObjectId(commentId);
  const mongooseUserId = new mongoose.Types.ObjectId(userId);

  const likeDetails = await Like.aggregate([
    {
      $match: {
        comment: mongooseCommentId,
      },
    },
  ]);

  if (!likeDetails) {
    throw new ApiError(
      400,
      "Something went wrong during aggeration operation, try again later"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Comment Like fetch successfully", {
        count: likeDetails.length,
      })
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
