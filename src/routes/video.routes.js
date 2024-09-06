import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
} from "../controllers/video.controllers.js";
import { verifyUser } from "../middlewares/verifyUser.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router
  .route("/")
  .post(
    verifyUser,
    upload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    publishAVideo
  )
  .get(verifyUser, getAllVideos);

router
  .route("/:videoId")
  .get(verifyUser, getVideoById)
  .delete(verifyUser, deleteVideo);

router.route("/toggle-status/:videoId").post(verifyUser, togglePublishStatus);

export default router;
