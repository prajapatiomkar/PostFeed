import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import axios from "axios";

function App() {
  const [userName, setUserName] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false); // New state

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/posts");
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPosts();
      return;
    }

    try {
      setIsSearching(true);
      const response = await axios.get(
        `http://localhost:5000/api/posts/search?q=${encodeURIComponent(
          searchQuery
        )}`
      );

      // Combine posts with their comments
      const postsWithComments = response.data.posts.map((post) => {
        const postComments = response.data.comments.filter(
          (comment) => comment.postId === post._id
        );
        return { ...post, comments: postComments };
      });

      setPosts(postsWithComments);
      setIsSearching(false);
    } catch (error) {
      console.error("Error searching:", error);
      setIsSearching(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !userName.trim()) return;

    try {
      await axios.post("http://localhost:5000/api/posts", {
        content: newPostContent,
        author: userName,
      });
      setNewPostContent("");
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleAddComment = async (postId, commentContent) => {
    if (!commentContent.trim() || !userName.trim()) return;

    try {
      await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, {
        content: commentContent,
        author: userName,
      });
      fetchPosts();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" style={{ marginTop: "2rem" }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Post Feed
        </Typography>
        <TextField
          fullWidth
          label="Enter your name"
          variant="outlined"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && userName.trim()) {
              setIsAuthenticated(true);
            }
          }}
          style={{ marginBottom: "1rem" }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (userName.trim()) {
              setIsAuthenticated(true);
            }
          }}
          disabled={!userName.trim()}
        >
          Continue
        </Button>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      style={{ marginTop: "2rem", marginBottom: "2rem" }}
    >
      <Typography variant="h4" gutterBottom>
        Post Feed
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome, {userName}
      </Typography>

      <Box display="flex" alignItems="center" mb={3}>
        <TextField
          fullWidth
          label="Search posts and comments"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={isSearching}
          style={{ marginLeft: "1rem" }}
        >
          {isSearching ? <CircularProgress size={24} /> : "Search"}
        </Button>
      </Box>

      <Box mb={3}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="What's on your mind?"
          variant="outlined"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          style={{ marginBottom: "1rem" }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreatePost}
          disabled={!newPostContent.trim()}
        >
          Post
        </Button>
      </Box>

      {/* Posts List */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Typography
          variant="body1"
          style={{ textAlign: "center", marginTop: "2rem" }}
        >
          {searchQuery
            ? "No results found for your search."
            : "No posts available. Be the first to post!"}
        </Typography>
      ) : (
        posts.map((post) => (
          <Card key={post._id} style={{ marginBottom: "2rem" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar style={{ marginRight: "1rem" }}>
                  {post.author.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="subtitle1">{post.author}</Typography>
              </Box>
              <Typography variant="body1" paragraph>
                {post.content}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {new Date(post.createdAt).toLocaleString()}
              </Typography>

              <Box mt={2} pl={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Comments
                </Typography>
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <Box key={comment._id} mb={2}>
                      <Box display="flex" alignItems="center" mb={0.5}>
                        <Avatar
                          style={{
                            marginRight: "0.5rem",
                            width: 24,
                            height: 24,
                          }}
                        >
                          {comment.author.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="caption">
                          {comment.author}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{comment.content}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No comments yet
                  </Typography>
                )}

                {/* Add Comment */}
                <Box mt={2} display="flex">
                  <TextField
                    fullWidth
                    size="small"
                    label="Add a comment"
                    variant="outlined"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        handleAddComment(post._id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
}

export default App;
