import { Router } from "express";
import {
  logInUser,
  logOutUser,
  refreshAccessToken,
  registerUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatarImage,
  updateCoverImage,
  getUserChannelInfo,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(logInUser);

//secured routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatarImage);
router
  .route("/update-coverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);
router.route("/c/:username").get(verifyJWT, getUserChannelInfo);
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
