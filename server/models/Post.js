const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.index({ content: "text" });

module.exports = mongoose.model("Post", PostSchema);
