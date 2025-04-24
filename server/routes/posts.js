const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");

router.post("/", async (req, res) => {
  try {
    const { content, author } = req.body;
    const post = new Post({ content, author });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id }).sort({
          createdAt: -1,
        });
        return { ...post.toObject(), comments };
      })
    );
    res.json(postsWithComments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/comments", async (req, res) => {
  try {
    const { content, author } = req.body;
    const comment = new Comment({
      content,
      author,
      postId: req.params.id,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const posts = await Post.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    const comments = await Comment.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    const commentedPostIds = [...new Set(comments.map((c) => c.postId))];

    const postsWithMatchingComments = await Post.find({
      _id: { $in: commentedPostIds },
    });

    const allPosts = [...posts, ...postsWithMatchingComments].reduce(
      (acc, post) => {
        const exists = acc.some((p) => p._id.equals(post._id));
        return exists ? acc : [...acc, post];
      },
      []
    );

    res.json({
      posts: allPosts,
      comments,
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
