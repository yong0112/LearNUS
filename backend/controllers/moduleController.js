const { fetchModules } = require("../models/moduleModel");

const fetchModuleList = async (req, res) => {
  try {
    const modules = await fetchModules();
    console.log(modules);
    res.json(modules);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { fetchModuleList };
