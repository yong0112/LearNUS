const { postUserEvents } = require("../models/eventsModel");

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

module.exports = { addUserEvents };