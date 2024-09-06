import mongoose, { Schema, SchemaType } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const CommentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    commentedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    comment:{
      type:Schema.Types.ObjectId,
      ref:"Comment"
    }
  },
  { timestamps: true }
);

CommentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", CommentSchema);

