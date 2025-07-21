const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/users");
app.use("/api", userRoutes);
const classesRoutes = require("./routes/classes");
app.use("/api/users", classesRoutes);
const reviewsRoutes = require("./routes/reviews");
app.use("/api/users", reviewsRoutes);
const sessionRoutes = require("./routes/session");
app.use("/api/users", sessionRoutes);
const tutorRoutes = require("./routes/tutors");
app.use("/api/tutors", tutorRoutes);
const constantRoutes = require("./routes/constants");
app.use("/api/constants", constantRoutes);
const coursesRoutes = require("./routes/courses");
app.use("/api/courses", coursesRoutes);
const forumRoutes = require("./routes/forum");
app.use("/api/forum", forumRoutes);
const eventRoutes = require("./routes/events");
app.use("/api/users", eventRoutes);

app.get("/", (req, res) => {
  res.send("API is working~~");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
