import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/publish").post(
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "videoFile",
      maxCount: 1,
    },
  ]),
  publishAVideo
);
router.route("/").get(getAllVideos);
router.route("/getVideo/:videoId").get(getVideoById);
router
  .route("/updateVideo/:videoId")
  .patch(upload.single("thumbnail"), updateVideo);
router.route("/deleteVideo/:videoId").delete(deleteVideo);
router.route("/togglePublishStatus/:videoId").get(togglePublishStatus);

export default router;
