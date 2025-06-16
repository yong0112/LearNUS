const { getUserClasses, postUserClasses } = require("../models/classesModel");

const fetchUserClasses = async (req, res) => {
  const uid = req.params.uid;

  try {
    const classes = await getUserClasses(uid);
    res.json(classes);
  } catch (err) {
    res.status(404).json({ message: "No classes" });
  }
};

const addUserClasses = async (req, res) => {
  const { people,
      course,
      date,
      startTime,
      endTime,
      rate,
      status
  } = req.body;

  if (
    !people ||
    !course ||
    !date ||
    !startTime ||
    !endTime ||
    !rate ||
    !status
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newClass = await postUserClasses({
      people,
      course,
      date,
      startTime,
      endTime,
      rate,
      status
    });
    res.status(201).json({ message: "Class added", newClass });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { fetchUserClasses, addUserClasses };
