import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const UserSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    watchHistory: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: "Video",
        },
      ],
    },
    refresherToken: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Encrpted the password...
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  console.log(bcrypt.hash(this.password, 10));
  
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare the password..
UserSchema.methods.isPasswordCorrect = async function (password) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

UserSchema.methods.generatedAccessToken = async function () {
  return jwt.sign(
    {
      id: this._id,
      userName: this.userName,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_SCERET_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

UserSchema.methods.generatedRefreshAccessToken = async function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_ACCESS_SCERET_KEY,
    {
      expiresIn: process.env.REFRESH_ACCESS_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", UserSchema);
