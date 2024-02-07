import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "Name and description of playlist are required.");
  }
  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
    videos: [],
  });
  if (!playlist) {
    throw new ApiError(400, "Playlist not created");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist created successfully", playlist));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const {userId} = req.params;
  if (!userId) {
    throw new ApiError(400, "Invalid user");
  }
  const playlists = await Playlist.find({
    owner: userId,
  })
  if (!playlists) {
    throw new ApiError(404, "Playlists not found");
  }
  return res.status(200).json(new ApiResponse(200, "Playlists fetched successfully", playlists))
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId?.trim()) {
    throw new ApiError(400, "Invalid playlist Id");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist found successfully", playlist));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  if (!videoId?.trim() || !playlistId?.trim()) {
    throw new ApiError(400, "Invalid video or playlist");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video doesn't exists");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: video,
      },
    },
    { new: true }
  );
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Video added to playlist successfully", playlist)
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  if (!videoId?.trim() || !playlistId?.trim()) {
    throw new ApiError(400, "Invalid video or playlist");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video doesn't exists");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  );
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Video removed from playlist successfully", playlist)
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId?.trim()) {
    throw new ApiError(400, "Invalid playlist Id");
  }
  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
  if (!deletedPlaylist) {
    throw new ApiError(400, "Playlist can't be deleted");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Playlist deleted successfully", deletedPlaylist)
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { playlistId } = req.params;
  if (!playlistId?.trim()) {
    throw new ApiError(400, "Invalid playlist Id");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );
  if (!updatedPlaylist) {
    throw new ApiError(400, "Playlist can't be updated");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Playlist updated successfully", updatedPlaylist)
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
