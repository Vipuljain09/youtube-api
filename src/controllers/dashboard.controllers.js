import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user.id;
  console.log(userId);

  const moongoseUserId = new mongoose.Types.ObjectId(userId);
  const videoDetail = await Video.aggregate([
    {
      $match: {
        owner: moongoseUserId,
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likeCount",
      },
    },
    {
      $addFields: {
        likeCount: { $size: "$likeCount" },
      },
    },
    {
      $group: {
        _id: null,
        totalVideo: { $count: {} },
        totalLike: { $sum: "$likeCount" },
      },
    },
  ]);

  const subscriberDetail = await Subscription.aggregate([
    {
      $match: {
        channel: moongoseUserId,
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(200, "Channel Stats fetch successfully", {
      videoDetail,
      subscriberDetail,
    })
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
});

export { getChannelStats, getChannelVideos };
