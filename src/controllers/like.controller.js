import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId?.trim()) {
    throw new ApiError(400, "Invalid video Id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  const like = await Like.findOne({ video: videoId });
  if (!like) {
    const createdLike = await Like.create({
      video: videoId,
    });
    if (!createdLike) {
      throw new ApiError(400, "Can't like the video");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "Video liked successfully", createdLike));
  } else {
    await Like.findByIdAndDelete(like._id);
    return res
      .status(200)
      .json(new ApiResponse(200, "Video unliked successfully", like));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId?.trim()) {
    throw new ApiError(400, "Invalid comment Id");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }
  const like = await Like.findOne({ comment: commentId });
  if (!like) {
    const createdLike = await Like.create({
      comment: commentId,
    });
    if (!createdLike) {
      throw new ApiError(400, "Can't like the comment");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "Comment liked successfully", createdLike));
  } else {
    await Like.findByIdAndDelete(like._id);
    return res
      .status(200)
      .json(new ApiResponse(200, "Comment unliked successfully", like));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId?.trim()) {
    throw new ApiError(400, "Invalid tweet Id");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "Tweet not found");
  }
  const like = await Like.findOne({ tweet: tweetId });
  if (!like) {
    const createdLike = await Like.create({
      tweet: tweetId,
    });
    if (!createdLike) {
      throw new ApiError(400, "Can't like the tweet");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet liked successfully", createdLike));
  } else {
    await Like.findByIdAndDelete(like._id);
    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet unliked successfully", like));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const { user } = req;
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(user._id),
        video: {
          $exists: true,
        },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideos",
      },
    },
    {
      $unwind: "$likedVideos",
    },
    {
      $replaceRoot: {
        newRoot: "$likedVideos",
      },
    },
  ]);
  if (!likedVideos || likedVideos.length === 0) {
    throw new ApiError(400, "No liked videos");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Liked videos fetched successfully", likedVideos)
    );
});

export { getLikedVideos, toggleVideoLike, toggleCommentLike, toggleTweetLike };
