const { postReport } = require("../models/reportModel");

const addReport = async (req, res) => {
  const { title, content, author } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Missing title" });
  }

  if (!content) {
    return res.status(400).json({ error: "Missing content" });
  }

  try {
    const newReport = await postReport({ title, content, author });
    res.status(201).json({ message: "Report added", newReport });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { addReport };
