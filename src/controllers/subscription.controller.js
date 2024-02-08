import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId?.trim()) {
    throw new ApiError(400, "Invalid channel");
  }
  const subscribedChannel = await Subscription.findOne({
    channel: new mongoose.Types.ObjectId(channelId),
    subscriber: new mongoose.Types.ObjectId(req.user._id),
  });
  if (!subscribedChannel) {
    subscribedChannel = await Subscription.create({
      channel: new mongoose.Types.ObjectId(channelId),
      subscriber: new mongoose.Types.ObjectId(req.user._id),
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Channel subscribed successfully",
          subscribedChannel
        )
      );
  } else {
    await Subscription.findOneAndDelete({
      channel: new mongoose.Types.ObjectId(channelId),
      subscriber: new mongoose.Types.ObjectId(req.user._id),
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Channel unsubscribed successfully",
          subscribedChannel
        )
      );
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId?.trim()) {
    throw new ApiError(400, "Invalid channel");
  }
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "channelSubscribers",
      },
    },
    {
      $unwind: "$channelSubscribers",
    },
    {
      $replaceRoot: {
        newRoot: "$channelSubscribers",
      },
    },
  ]);
  if (!subscribers) {
    throw new ApiError(404, "No subscribers");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "User channel subscribers fetched successfully",
        subscribers
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId?.trim()) {
    throw new ApiError(400, "Invalid subscriber");
  }
  const channels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannels",
      },
    },
    {
      $unwind: "$subscribedChannels",
    },
    {
      $replaceRoot: {
        newRoot: "$subscribedChannels",
      },
    },
  ]);
  if (!channels) {
    throw new ApiError(404, "No subscribed channel found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Subscribed channels fetched successfully", channels)
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
