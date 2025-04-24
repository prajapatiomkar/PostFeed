const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

CommentSchema.index({ content: "text" });

module.exports = mongoose.model("Comment", CommentSchema);
