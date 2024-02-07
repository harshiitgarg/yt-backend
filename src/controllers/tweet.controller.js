import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }
  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });
  if (!tweet) {
    throw new ApiError(500, "Tweet not added");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet added successfully", tweet));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { user } = req;
  const tweets = await Tweet.find({
    owner: user._id,
  });
  if (!tweets) {
    throw new ApiError(404, "No tweet found for the user");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "User tweets fetched successfully", tweets));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Invalid tweet");
  }
  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );
  if (!tweet) {
    throw new ApiError(400, "Tweet not updated");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet updated successfully", tweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Invalid tweet");
  }
  const tweet = await Tweet.findByIdAndDelete(tweetId);
  if (!tweet) {
    throw new ApiError(500, "Tweet can't be deleted");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully", tweet));
});

export { addTweet, getUserTweets, updateTweet, deleteTweet };
