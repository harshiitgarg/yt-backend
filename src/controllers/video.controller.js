import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteCloudinary, uploadCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (
    title &&
    description &&
    [title, description].some((field) => field.trim() === "")
  ) {
    throw new ApiError(401, "Title and description are required");
  }

  //get the videofile and thumbnail from the user
  const videoFilePath = req.files?.videoFile[0]?.path;
  const thumbnailPath = req.files?.thumbnail[0]?.path;
  if (
    !videoFilePath ||
    !thumbnailPath ||
    !req.files?.videoFile[0].mimetype.includes("video") ||
    !req.files?.thumbnail[0].mimetype.includes("image")
  ) {
    throw new ApiError(
      401,
      "Video and thumbnail are required or Invalid file type."
    );
  }

  //upload the videofile and thumbnail to cloudinary
  const videoFile = await uploadCloudinary(videoFilePath);
  const thumbnail = await uploadCloudinary(thumbnailPath);
  if (!videoFile || !thumbnail) {
    throw new ApiError(500, "Error while uploading the file");
  }

  //get the duration of the video from cloudinary
  const duration = Math.floor(videoFile.duration);

  //Create a video
  const video = await Video.create({
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url,
    title,
    description,
    duration,
    isPublished: true,
    owner: req.user,
  });
  if (!video) {
    throw new ApiError(500, "Something went wrong while publishing the video");
  }

  //return the response
  return res
    .status(200)
    .json(new ApiResponse(200, "Video published successfully", video));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(200, "Invalid video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailPath = req.file?.path;
  if (!videoId.trim()) {
    throw new ApiError(200, "Invalid video id");
  }
  if ([title, description].some((field) => field.trim() === "")) {
    throw new ApiError(401, "Title and description are required");
  }
  if (!thumbnailPath || !req.file?.mimetype.includes("image")) {
    throw new ApiError(
      400,
      "Thumbnail file is required or file type is invalid"
    );
  }
  const thumbnail = await uploadCloudinary(thumbnailPath);
  if (!thumbnail.url) {
    throw new ApiError(500, "Thumbnail not updated");
  }
  const video2 = await Video.findById(videoId);
  if (video2?.thumbnail) {
    await deleteCloudinary(video2?.thumbnail);
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: thumbnail.url,
        title,
        description,
      },
    },
    { new: true }
  );
  if (!updatedVideo) {
    throw new ApiError(500, "Error while updating the video details");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Video details updated successfully", updatedVideo)
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId.trim()) {
    throw new ApiError(200, "Invalid video id");
  }
  const video = await Video.findByIdAndDelete(videoId);
  if (!video) {
    throw new ApiError(400, "Video does not exist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully", {}));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId.trim()) {
    throw new ApiError(200, "Invalid video id");
  }
  const video = await Video.findById(videoId);
  video.isPublished = !video.isPublished;
  await video.save();
  res
    .status(200)
    .json(new ApiResponse(200, "Published status toggled successfully", video));
});

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page: reqPage = 1,
    limit: reqLimit = 10,
    query,
    sortBy,
    sortType,
    userId,
  } = req.query;

  const page = parseInt(reqPage, 10) || 1;
  const limit = parseInt(reqLimit, 10) || 10;

  if (!userId?.trim()) {
    throw new ApiError(400, "Invalid user");
  }

  const videos = await Video.aggregate(
    [
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
          isPublished: true,
          title: {
            $regex: new RegExp(query?.trim().split(/\s+/).join("|"), "i"),
          },
        },
      },
      sortBy
        ? { $sort: { [sortBy]: sortType === "desc" ? -1 : 1 } }
        : undefined,
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ].filter(Boolean)
  );
  if (!videos) {
    throw new ApiError(404, "No user videos found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Videos fetched successfully"));
});

export {
  deleteVideo,
  publishAVideo,
  getVideoById,
  updateVideo,
  togglePublishStatus,
  getAllVideos,
};
