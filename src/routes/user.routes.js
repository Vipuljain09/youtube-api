import { Router } from "express";
import { changePassword, loginUser, registerUser, updateAvatar, updateUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyUser } from "../middlewares/verifyUser.middleware.js";

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
router.route("/login").post(loginUser);
router.route("/update-user").post(verifyUser,updateUser);
router.route("/change-password").post(verifyUser,changePassword);
router.route("/update-avatar").post(verifyUser,upload.single('avatar'),updateAvatar);

export default router;
