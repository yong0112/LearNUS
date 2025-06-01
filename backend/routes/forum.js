const express = require('express');
const router = express.Router();
const { fetchForumPosts, addForumPost } = require('../controllers/forumController');

router.get('/', fetchForumPosts);
router.get('/', addForumPost);

module.exports = router;
