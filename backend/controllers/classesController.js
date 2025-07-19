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
  const uid = req.params.uid;
  const { people, course, dayOfWeek, startTime, endTime, rate, status, role } =
    req.body;

  if (
    !people ||
    !course ||
    !dayOfWeek ||
    !startTime ||
    !endTime ||
    !rate ||
    !status ||
    !role
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const studentData = {
    user: uid,
    people: people,
    course,
    dayOfWeek,
    startTime,
    endTime,
    rate,
    status,
    role: "Student",
  };

  const tutorData = {
    user: people,
    people: uid,
    course,
    dayOfWeek,
    startTime,
    endTime,
    rate,
    status,
    role: "Tutor",
  };

  try {
    const studentClass = await postUserClasses(studentData);
    const tutorClass = await postUserClasses(tutorData);
    res.status(201).json({ message: "Class added", studentClass, tutorClass });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { fetchUserClasses, addUserClasses };
