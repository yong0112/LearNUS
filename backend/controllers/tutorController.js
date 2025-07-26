const { getTutors, postTutor, updateStatus } = require("../models/tutorModel");
const { getUserProfile } = require("../models/userModel");
const { computeMatchScore } = require("../utils/suggestedTutor");

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
  const {
    tutor,
    course,
    location,
    description,
    dayOfWeek,
    startTime,
    endTime,
    rate,
  } = req.body;

  if (
    !tutor ||
    !course ||
    !location ||
    !description ||
    !dayOfWeek ||
    !startTime ||
    !endTime ||
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
      dayOfWeek,
      startTime,
      endTime,
      rate,
    });
    res.status(201).json({ message: "Tutor added", newTutor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const updateBooking = async (req, res) => {
  const { uid, booked } = req.body;

  if (!uid) return res.status(404).json({ error: "UID is required" });

  try {
    const updateData = {
      ...(booked && { booked: booked }),
      updatedAt: new Date(),
    };

    await updateStatus(uid, updateData);

    res
      .status(200)
      .json({ message: "Tutor booking status updates successfully " });
  } catch (err) {
    res.status(500).json({
      error: "Failed to update tutor booking status",
      details: err.message,
    });
  }
};

const filterSuggestedTutor = async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await getUserProfile(studentId);
    const tutors = await getTutors();
    const filteredTutors = tutors.filter((tutor) => {
      return !tutor.booked;
    });

    const scoredTutors = await Promise.all(
      filteredTutors.map(async (tutor) => {
        const tutorUserProfile = await getUserProfile(tutor.tutor);
        return {
          tutor: tutor,
          score: computeMatchScore(student, tutorUserProfile, tutor),
        };
      }),
    );

    const topTutors = scoredTutors
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((profile) => profile.tutor);

    res.status(200).json(topTutors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching suggested tutors" });
  }
};

module.exports = { fetchTutors, addTutor, updateBooking, filterSuggestedTutor };
