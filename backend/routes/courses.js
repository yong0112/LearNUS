const express = require('express');
const router = express.Router();
const courses = require('../data/courses.json');

router.get('/', (req, res) => {
  res.json(courses);
});

module.exports = router;