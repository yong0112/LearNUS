const request = require("supertest");
const express = require("express");
const { addTutor } = require("../../../controllers/tutorController");
const { postTutor } = require("../../../models/tutorModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.post("/api/tutors", addTutor);

// Mock the model
jest.mock("../../../models/tutorModel");

describe("POST /api/tutors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("creates a tutor with valid input", async () => {
    const input = {
      tutor: "user123",
      course: "Math 101",
      location: "Online",
      description: "Experienced math tutor",
      availability: "Weekdays 10:00-14:00",
      rate: 50,
    };
    const newTutor = { id: "tutor1", ...input };
    postTutor.mockResolvedValue(newTutor);

    const response = await request(app).post("/api/tutors").send(input);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: "Tutor added", newTutor });
    expect(postTutor).toHaveBeenCalledWith(input);
  });

  it("returns 400 for missing required fields", async () => {
    const input = {
      tutor: "user123",
      course: "Math 101",
      location: "Online",
      // Missing description, availability, rate
    };

    const response = await request(app).post("/api/tutors").send(input);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Missing required fields" });
    expect(postTutor).not.toHaveBeenCalled();
  });

  it("returns 500 for server error", async () => {
    const input = {
      tutor: "user123",
      course: "Math 101",
      location: "Online",
      description: "Experienced math tutor",
      availability: "Weekdays 10:00-14:00",
      rate: 50,
    };
    postTutor.mockRejectedValue(new Error("Database error"));

    const response = await request(app).post("/api/tutors").send(input);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Server error" });
    expect(postTutor).toHaveBeenCalledWith(input);
  });
});
