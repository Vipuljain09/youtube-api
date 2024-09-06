import dotenv from "dotenv";
import app from "./app.js";
import connectdb from "./db/connectdb.js";
dotenv.config();
 
connectdb()
  .then((data) => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server is listening on port ", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed", err);
  });
