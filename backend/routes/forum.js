const express = require("express");
const router = express.Router();
const {
  fetchForumPosts,
  addForumPost,
  fetchComments,
  addComment,
  togglePostUpvote,
  getPostUpvoteStatus,
  toggleCommentUpvote,
  getCommentUpvoteStatus,
} = require("../controllers/forumController");

router.get("/", fetchForumPosts);
router.post("/", addForumPost);
router.get("/:postId/comments", fetchComments);
router.post("/:postId/comments", addComment);
router.post("/:postId/upvote", togglePostUpvote);
router.get("/:postId/upvote-status/:userId", getPostUpvoteStatus);
router.post("/:postId/comments/:commentId/upvote", toggleCommentUpvote);
router.get(
  "/:postId/comments/:commentId/upvote-status/:userId",
  getCommentUpvoteStatus,
);

module.exports = router;
