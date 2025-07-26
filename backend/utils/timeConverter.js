function convertTimeLocally(current) {
  const newDate = new Date();
  const formatted = newDate.setHours(current.getHours() + 8);
  return new Date(formatted);
}

module.exports = { convertTimeLocally };
