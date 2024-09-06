import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.models.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // TODO: toggle subscription
  const { channelId } = req.params;
  const userId = req.user.id;

  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel Id is missing or invalid.");
  }

  const channelDetails = await User.findById(channelId);

  if (!channelDetails) {
    throw new ApiError(404, "Channel does not existed.");
  }

  const userDetails = await User.findById(userId);

  if (!userDetails) {
    throw new ApiError(404, "User not found.");
  }

  const mongooseUserId = new mongoose.Types.ObjectId(userId);
  const mongooseChannelId = new mongoose.Types.ObjectId(channelId);

  const subscribedDetail = await Subscription.aggregate([
    {
      $match: {
        subscriber: mongooseUserId,
        channel: mongooseChannelId,
      },
    },
  ]);

  if (subscribedDetail.length === 0) {
    const newSubscriptionData = new Subscription({
      channel: channelId,
      subscriber: userId,
    });

    await newSubscriptionData.save();

    const newSubscriptionResponse = await Subscription.findById(
      newSubscriptionData._id
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Channel Subscribed succcessfully",
          newSubscriptionResponse
        )
      );
  }

  console.log(subscribedDetail);

  const deletedSubscriptionResponse = await Subscription.findByIdAndDelete(
    subscribedDetail[0]._id,
    { new: true }
  );
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Channel Unsubscribed succcessfully",
        deletedSubscriptionResponse
      )
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user.id;

  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel Id is missing or invalid.");
  }

  const channelDetails = await User.findById(channelId);

  if (!channelDetails) {
    throw new ApiError(404, "Channel does not existed.");
  }
  const mongooseChannelId = new mongoose.Types.ObjectId(channelId);
  const subscriberList = await Subscription.aggregate([
    {
      $match: {
        channel: mongooseChannelId,
      },
    },
    {
      $project: {
        subscriber: 1,
        _id: 0,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              _id: 1,
              userName: 1,
              fullName: 1,
              email: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriber: { $arrayElemAt: ["$subscriber", 0] },
      },
    },
  ]);

  if (!subscriberList) {
    throw new ApiError(
      400,
      "Something went wrong during db opertion , try again later"
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "Subcriber List fetch Successfully", subscriberList)
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId || !isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Subscriber Id is missing or invalid.");
  }

  const subscriberDetails = await User.findById(subscriberId);

  if (!subscriberDetails) {
    throw new ApiError(404, "subscriber does not existed.");
  }

  const mongooseSubscriberId = new mongoose.Types.ObjectId(subscriberId);

  const subscribedChannelDetail = await Subscription.aggregate([
    {
      $match: {
        subscriber: mongooseSubscriberId,
      },
    },
    {
      $project: {
        channel: 1,
        _id: 0,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $project: {
              userName: 1,
              email: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        channel: { $arrayElemAt: ["$channel", 0] },
      },
    },
  ]);

  if(!subscribedChannelDetail){
    throw new ApiError(400,"Somthing went wrong during db operation, try again later.")
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Subscribed channel fetch successfully",
        subscribedChannelDetail
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
