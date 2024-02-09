import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const totalViews = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
      },
    },
  ]);
  const totalSubscribers = await Subscription.countDocuments({
    channel: req.user._id,
  });
  const totalVideos = await Video.countDocuments({ owner: req.user._id });
  const totalLikes = await Like.countDocuments({
    video: { $in: await Video.find({ owner: req.user._id }, "_id") },
  });
  return res.status(200).json(
    new ApiResponse(200, "Channel Stats fetched successfully", {
      totalViews,
      totalSubscribers,
      totalVideos,
      totalLikes,
    })
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { user } = req;
  const videos = await Video.findOne({
    owner: new mongoose.Types.ObjectId(user._id),
  });
  if (!videos) {
    throw new ApiError(404, "No channel videos found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Channel videos fetched successfully", videos));
});

export { getChannelStats, getChannelVideos };
