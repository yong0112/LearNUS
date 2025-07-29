const express = require("express");
const router = express.Router();
const constants = require("../config/constants");
const { fetchModuleList } = require("../controllers/moduleController");

router.get("/", (req, res) => {
  res.json(constants);
});
router.get("/module", fetchModuleList);

module.exports = router;
