import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controllers.js";
import { verifyUser } from "../middlewares/verifyUser.middleware.js";

const router = Router();

router.use(verifyUser);

router.route("/:videoId").get(getVideoComments);
router.route("/").post(addComment);
router.route("/:commentId").delete(deleteComment).patch(updateComment);

export default router;
