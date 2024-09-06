import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
  toggleTweetLike,
  getVideoCountLike,
  getCommentCountLike,
} from "../controllers/likes.controllers.js";
import { verifyUser } from "../middlewares/verifyUser.middleware.js";

const router = Router();
router.use(verifyUser); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);
router.route("/video/:videoId").get(getVideoCountLike);
router.route("/comment/:commentId").get(getCommentCountLike);

export default router;
