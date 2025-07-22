const {
  getForumPosts,
  postForum,
  getComments,
  postComment,
  togglePostUpvote: togglePostUpvoteModel,
  getPostUpvoteStatus: getPostUpvoteStatusModel,
  toggleCommentUpvote: toggleCommentUpvoteModel,
  getCommentUpvoteStatus: getCommentUpvoteStatusModel,
  removePost,
  removeComment,
} = require("../models/forumModel");

const fetchForumPosts = async (req, res) => {
  console.log("Received POST");
  const uid = req.params.uid;

  try {
    const posts = await getForumPosts(uid);
    res.json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const addForumPost = async (req, res) => {
  const { title, content, courseTag, author } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Missing title" });
  }

  if (!content) {
    return res.status(400).json({ error: "Missing content" });
  }

  try {
    const newPost = await postForum({ title, content, courseTag, author });
    res.status(201).json({ message: "Post added", newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const fetchComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await getComments(postId);
    res.json(comments);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const addComment = async (req, res) => {
  const { postId } = req.params;
  const { content, author, authorName } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Missing content" });
  }

  try {
    const newComment = await postComment(postId, {
      content,
      author,
      authorName,
    });
    res.status(201).json({ message: "Comment added", newComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const togglePostUpvote = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const result = await togglePostUpvoteModel(postId, userId);
    res.json({ message: "Upvote toggled", ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

const getPostUpvoteStatus = async (req, res) => {
  const { postId, userId } = req.params;

  try {
    const result = await getPostUpvoteStatusModel(postId, userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

const toggleCommentUpvote = async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const result = await toggleCommentUpvoteModel(postId, commentId, userId);
    res.json({ message: "Comment upvote toggled", ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

const getCommentUpvoteStatus = async (req, res) => {
  const { postId, commentId, userId } = req.params;

  try {
    const result = await getCommentUpvoteStatusModel(postId, commentId, userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

const deletePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const result = await removePost(postId, userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const result = await removeComment(postId, commentId, userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

module.exports = {
  fetchForumPosts,
  addForumPost,
  fetchComments,
  addComment,
  togglePostUpvote,
  getPostUpvoteStatus,
  toggleCommentUpvote,
  getCommentUpvoteStatus,
  deletePost,
  deleteComment,
};
