import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Schema } from "mongoose";

// const getVideoComments = asyncHandler(async (req, res) => {
//   //Left to be completed
// });

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content.trim()) {
    throw new ApiError(401, "Enter some content for the content");
  }
  const { videoId } = req.params;
  if (!videoId.trim()) {
    throw new ApiError(401, "Invalid video Id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  const comment = await Comment.create({
    content,
    video,
    owner: req.user._id,
  });
  if (!comment) {
    throw new ApiError(500, "Something went wrong");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Comment created successfully", comment));
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content.trim()) {
    throw new ApiError(401, "Enter some content for the content");
  }
  const { commentId } = req.params;
  if (!commentId.trim()) {
    throw new ApiError(401, "Invalid video Id");
  }
  const updatedComment = await Comment.findOneAndUpdate(
    { _id: commentId, owner: req.user?._id },
    {
      $set: {
        content,
      },
    },
    { new: true }
  );
  if (!updatedComment) {
    throw new ApiError(400, "Comment don't exist");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Comment updated successfully", updatedComment));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Invalid comment Id");
  }
  const deletedComment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user._id,
  });
  if (!deletedComment) {
    throw new ApiError(400, "Comment not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Comment deleted successfully", deletedComment));
});

export { addComment, updateComment, deleteComment };
