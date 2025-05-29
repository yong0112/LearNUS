const { getTutors, postTutor } = require("../models/tutorModel");
const { FORMATS } = require("../config/constants");

const fetchTutors = async (req, res) => {
  console.log("Received POST");
  const uid = req.params.uid;

  try {
    const tutor = await getTutors(uid);
    res.json(tutor);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const addTutor = async (req, res) => {
  const { tutor, course, location, description, availability, rate } = req.body;

  if (
    !tutor ||
    !course ||
    !location ||
    !description ||
    !availability ||
    !rate
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newTutor = await postTutor({
      tutor,
      course,
      location,
      description,
      availability,
      rate,
    });
    res.status(201).json({ message: "Tutor added", newTutor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { fetchTutors, addTutor };
