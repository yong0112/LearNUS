const express = require("express");
const router = express.Router();
const constants = require("../config/constants");

router.get("/", (req, res) => {
  res.json(constants);
});

module.exports = router;
