const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const connectWithRetry = () => {
  mongoose
    .connect("mongodb://mongo:27017/postfeed", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      retryReads: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
      console.error("Failed to connect to MongoDB - retrying in 5 sec", err);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

async function initializeIndexes() {
  try {
    const Post = require("./models/Post");
    const Comment = require("./models/Comment");

    await Post.init();
    await Comment.init();
    console.log("Text indexes initialized");
  } catch (err) {
    console.error("Index initialization error:", err);
  }
}

mongoose.connection.once("open", () => {
  initializeIndexes();
});

app.get("/", (req, res) => {
  res.send("Post Feed API");
});

const postsRouter = require("./routes/posts");
app.use("/api/posts", postsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
