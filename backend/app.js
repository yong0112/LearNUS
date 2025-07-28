const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const SocketHandlers = require("./socket/socketHandlers");
const chat = require("./routes/chat");
const message = require("./routes/message");

const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Configure this properly for production
    methods: ["GET", "POST"],
  },
});

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
const notificationRoutes = require("./routes/notifications");
app.use("/api/users", notificationRoutes);
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
app.use("/api/chat", chat);
app.use("/api/message", message);
const SessionCleanUpJob = require("./jobs/sessionEnded");
const sessionCleanupJob = new SessionCleanUpJob();

// Initialize Socket.IO handlers
const socketHandlers = new SocketHandlers(io);
io.on("connection", (socket) => {
  socketHandlers.handleConnection(socket);
});
const reportRoutes = require("./routes/reports");
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.send("API is working~~");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
