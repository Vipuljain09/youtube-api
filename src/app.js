import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import UserRoute from "./routes/user.routes.js";
import VideoRoute from "./routes/video.routes.js";
import CommentRoute from "./routes/comment.routes.js";
import PlaylistRoute from "./routes/playlist.routes.js";
import LikeRoute from "./routes/likes.routes.js";
import SubscriptionRoute from "./routes/subscription.routes.js";
import DashboardRouter from "./routes/dashboard.routes.js";

import { upload } from "./middlewares/multer.middlewares.js";
const app = express();

app.use(cors()); // required to config the cors origin communication.
app.use(express.json({ limit: "16kb" })); // limit the data limit that we accepted in json.

app.use(express.urlencoded({ extended: true, limit: "16kb" })); // required to config the url data.
app.use(express.static("public")); // require to interact with static data that we store in server itself.
app.use(cookieParser()); // Helps us to access the browser cookies and set the cookies.

app.use("/api/v1/user", UserRoute);
app.use("/api/v1/video", VideoRoute);
app.use("/api/v1/comment", CommentRoute);
app.use("/api/v1/playlist", PlaylistRoute);
app.use("/api/v1/likes", LikeRoute);
app.use("/api/v1/subscription", SubscriptionRoute);
app.use("/api/v1/dashboard", DashboardRouter);

export default app;
