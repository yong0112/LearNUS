const { getUserEvents, postUserEvents } = require("../models/eventsModel");

const fetchUserEvents = async (req, res) => {
  const uid = req.params.uid;

  try {
    const events = await getUserEvents(uid);
    res.json(events);
  } catch (err) {
    res.status(404).json({ message: "No events" });
  }
};

const addUserEvents = async (req, res) => {
  const uid = req.params.uid;
  const { title, date, startTime, endTime } =
    req.body;

  if (
    !title||
    !date ||
    !startTime ||
    !endTime
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const eventData = {
    title,
    date,
    startTime,
    endTime
  };

  try {
    const eventClass = await postUserEvents(eventData);
    res.status(201).json({ message: "Event added", eventClass });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { fetchUserEvents, addUserEvents };