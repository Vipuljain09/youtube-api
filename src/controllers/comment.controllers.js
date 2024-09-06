import mongoose, { isValidObjectId, Mongoose } from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/User.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user.id;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(404, "Video ID is missing or invalid.");
  }

  const videoDetail = await Video.findById(videoId);
  if (!videoDetail) {
    throw new ApiError(
      404,
      "Video Id is not found is DB, may be it's deleted."
    );
  }

  const userDetails = await User.findById(userId);

  if (!userDetails) {
    throw new ApiError(404, "User is not found is DB, may be it's deleted.");
  }

  const videoMongooseId = new mongoose.Types.ObjectId(videoId);

  const commentAgg = Comment.aggregate([
    {
      $match: {
        video: videoMongooseId,
        comment: null,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "commentedBy",
        foreignField: "_id",
        as: "commentedBy",
        pipeline: [
          {
            $project: {
              _id: 1,
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
        commentedBy: { $arrayElemAt: ["$commentedBy", 0] },
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "comment",
        as: "count",
      },
    },
    {
      $addFields: {
        count: {
          $size: "$count",
        },
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ]);

  const options = {
    page,
    limit,
  };

  const paginatedCommentDetails = await Comment.aggregatePaginate(
    commentAgg,
    options
  );

  console.log(paginatedCommentDetails);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Comment's fetched successfully",
        paginatedCommentDetails
      )
    );
});

const getNestedComments = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
});


/*
->first verify the user
->validaton on content message and videoId
->Check mentioned videoId,commentId is found or not. 
->optional validation on comment ID
->create the data and post it then sent the reponse
*/

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { content, video, comment } = req.body;

  if (!content || content?.trim() === "") {
    throw new ApiError(404, "Content field is missing");
  }

  if (!video || !isValidObjectId(video)) {
    throw new ApiError(404, "Video ID is missing or invalid.");
  }

  if (comment && !isValidObjectId(comment)) {
    throw new ApiError(404, "Comment ID is invalid.");
  }

  const videoDetail = await Video.findById(video);

  if (!videoDetail) {
    throw new ApiError(
      404,
      "Video Id is not found is DB, may be it's deleted."
    );
  }

  if (comment) {
    const referencedcommentDetail = await Comment.findById(comment);
    if (!referencedcommentDetail) {
      throw new ApiError(
        404,
        "Comment Id is not found is DB, may be it's deleted."
      );
    }
  }

  const userId = req.user.id;

  const userDetails = await User.findById(userId);

  if (!userDetails) {
    throw new ApiError(404, "User is not found is DB, may be it's deleted.");
  }

  const commentData = new Comment({
    content,
    commentedBy: userId,
    video: video,
  });

  if (comment) {
    commentData.comment = comment;
  }

  await commentData.save();

  const commentDetailRespone = await Comment.findById(commentData._id);

  if (!commentDetailRespone) {
    throw new ApiError(
      400,
      "Something went wrong during db reponse, try again later."
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "Add Comment successfully", commentDetailRespone)
    );
});
/*
 */
const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req?.user?.id;

  if (!content || content?.trim() === "") {
    throw new ApiError(404, "Content field is missing");
  }

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(404, "CommentId is missing or invalid");
  }

  const commentDetail = await Comment.findById(commentId);

  if (!commentDetail) {
    throw new ApiError(
      404,
      "Comment Id is not found is DB, may be it's deleted."
    );
  }

  const userDetails = await User.findById(userId);

  if (!userDetails) {
    throw new ApiError(404, "User is not found is DB, may be it's deleted.");
  }

  const updatedResponse = await Comment.findByIdAndUpdate(commentId, {
    content,
  });

  const newCommentDetails = await Comment.findById(commentId);

  if (!newCommentDetails) {
    throw new ApiError(
      400,
      "Something went wrong during db reponse, try again later."
    );
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, "Comment Update successfully", newCommentDetails)
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  const userId = req?.user?.id;

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(404, "CommentId is missing or invalid");
  }

  const commentDetail = await Comment.findById(commentId);

  if (!commentDetail) {
    throw new ApiError(
      404,
      "Comment Id is not found is DB, may be it's deleted."
    );
  }

  const userDetails = await User.findById(userId);

  if (!userDetails) {
    throw new ApiError(404, "User is not found is DB, may be it's deleted.");
  }

  const deletedResponse = await Comment.findByIdAndDelete(commentId);

  res.status(200).json(new ApiResponse(200, "Comment Deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
