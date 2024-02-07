import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  addTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(addTweet).get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
