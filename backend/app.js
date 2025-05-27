const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);
const classesRoutes = require("./routes/classes");
app.use("/api/users", classesRoutes);
const reviewsRoutes = require("./routes/reviews");
app.use("/api/users", reviewsRoutes);

app.get("/", (req, res) => {
  res.send("API is working~~");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});