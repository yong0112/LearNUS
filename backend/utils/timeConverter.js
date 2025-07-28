const { DAYS } = require("../config/constants");

function convertTimeLocally(current) {
  const newDate = new Date();
  const formatted = newDate.setHours(current.getHours() + 8);
  return new Date(formatted);
}

function formatAvailability(dayOfWeek, start, end) {
  const day = DAYS.find((d) => d.value == dayOfWeek);
  const startTime = new Date(start);
  const formattedStart = startTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const endTime = new Date(end);
  const formattedEnd = endTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${day?.label} (${formattedStart} - ${formattedEnd})`;
}

module.exports = { convertTimeLocally, formatAvailability };
