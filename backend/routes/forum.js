const express = require("express");
const router = express.Router();
const {
  fetchForumPosts,
  addForumPost,
} = require("../controllers/forumController");

router.get("/", fetchForumPosts);
router.post("/", addForumPost);

module.exports = router;
