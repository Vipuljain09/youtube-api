import mongoose, { isValidObjectId, Schema } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.models.js";
import { Video } from "../models/video.models.js";

/*
->Verify the User using middleware
->basic validation on Name
->check User is present is Db or not.
->Created the data and post to Db and send the response to user.
*/
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  console.log(name, description, req.body);

  const userId = req.user.id;

  if (!name || name?.trim() === "") {
    throw new ApiError(400, "name field is missing");
  }

  const userDetails = await User.findById(userId);
  if (!userDetails) {
    throw new ApiError(404, "User not found, may be it's deleted");
  }

  const playlistData = new Playlist({
    name,
    owner: userId,
  });

  if (description && description?.trim() !== "") {
    playlistData.description = description;
  }
  await playlistData.save();

  const playlistResponse = await Playlist.findById(playlistData._id);

  if (!playlistResponse) {
    throw new ApiError(
      403,
      "Something went wrong during db opertion, try again."
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "Playlist created successfully", playlistResponse)
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const loginUserId = req.user.id;

  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(404, "User Id is missing or invalid");
  }

  const mongooseUserId = new mongoose.Types.ObjectId(userId);
  const allPlaylist = await Playlist.aggregate([
    {
      $match: {
        owner: mongooseUserId,
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, "All Playlist fetch successfully", allPlaylist));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const userId = req.user.id;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(404, "Playlist Id is missing or invalid");
  }

  const userDetails = await User.findById(userId);
  if (!userDetails) {
    throw new ApiError(404, "User not found in db.");
  }


  const mongoosePlaylistId = new mongoose.Types.ObjectId(playlistId);
  const x = await Playlist.aggregate([
    {
      $match: {
        _id: mongoosePlaylistId,
      },
    },
    
  ]);


  const playlistDetail = await Playlist.findById(playlistId);
  if (!playlistDetail) {
    throw new ApiError(400, "Playlist does not existed.");
  }

  res.status(200).json(new ApiResponse(200, "Playlist fetch successfully", x));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const userId = req.user.id;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(404, "Playlist Id is missing or invalid");
  }

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(404, "Video Id is missing or invalid");
  }

  const userDetails = await User.findById(userId);
  if (!userDetails) {
    throw new ApiError(404, "User not found in db.");
  }

  const playlistDetail = await Playlist.findById(playlistId);
  if (!playlistDetail) {
    throw new ApiError(400, "Playlist does not existed.");
  }

  const videoDetail = await Video.findById(videoId);
  if (!videoDetail) {
    throw new ApiError(400, "Video does not existed.");
  }

  playlistDetail.videosList = [...playlistDetail.videosList, videoId];

  await playlistDetail.save();

  const updatedPlaylist = await Playlist.findById(playlistId);

  if (!updatedPlaylist) {
    throw new ApiError(400, "Something went wrong during db operation");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Video added successfully in playlist",
        updatedPlaylist
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const userId = req.user.id;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(404, "Playlist Id is missing or invalid");
  }

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(404, "Video Id is missing or invalid");
  }

  const userDetails = await User.findById(userId);
  if (!userDetails) {
    throw new ApiError(404, "User not found in db.");
  }

  const playlistDetail = await Playlist.findById(playlistId);
  if (!playlistDetail) {
    throw new ApiError(400, "Playlist does not existed.");
  }

  const videoList = playlistDetail.videosList;
  const mongooseVideoId = new mongoose.Types.ObjectId(videoId);

  const newvideoList = videoList?.filter(
    (id) => id.toString() !== mongooseVideoId.toString()
  );

  playlistDetail.videosList = newvideoList;

  await playlistDetail.save();

  const updatedPlaylist = await Playlist.findById(playlistId);

  if (!updatedPlaylist) {
    throw new ApiError(400, "Something went wrong during db operation");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Video remove successfully from playlist",
        updatedPlaylist
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const userId = req.user.id;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(404, "Playlist Id is missing or invalid");
  }

  const userDetails = await User.findById(userId);

  if (!userDetails) {
    throw new ApiError(404, "User not found in db.");
  }

  const playlistDetail = await Playlist.findById(playlistId);

  if (!playlistDetail) {
    throw new ApiError(400, "Playlist Already deleted");
  }

  const deletedResponse = await Playlist.findByIdAndDelete(playlistId);

  res.status(200).json(new ApiResponse(200, "Playlist deleted Successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  const userId = req.user.id;

  if (!name || name?.trim() === "") {
    throw new ApiError(400, "name field is missing");
  }

  if (!description || description?.trim() === "") {
    throw new ApiError(400, "description field is missing");
  }

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(404, "Playlist Id is missing or invalid");
  }

  const userDetails = await User.findById(userId);

  if (!userDetails) {
    throw new ApiError(404, "User not found in db.");
  }

  const playlistDetail = await Playlist.findById(playlistId);

  if (!playlistDetail) {
    throw new ApiError(400, "Playlist does not existed.");
  }

  const upadtedPlaylistDetails = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name,
      description,
    },
    {
      new: true,
    }
  );

  if (!upadtedPlaylistDetails) {
    throw new ApiError(
      403,
      "Something went wrong during db operation, Please try again."
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Playlist updated Successfully",
        upadtedPlaylistDetails
      )
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
