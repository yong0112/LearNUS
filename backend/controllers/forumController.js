const { getForumPosts, postForum } = require("../models/forumModel");

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

module.exports = { fetchForumPosts, addForumPost };
