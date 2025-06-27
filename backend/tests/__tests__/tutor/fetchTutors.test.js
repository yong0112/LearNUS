const request = require("supertest");
const express = require("express");
const { fetchTutors } = require("../../../controllers/tutorController");
const { getTutors } = require("../../../models/tutorModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.get("/api/tutors/:uid", fetchTutors);

// Mock the model
jest.mock("../../../models/tutorModel");

describe("GET /api/tutors/:uid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  it("returns tutors for a valid uid", async () => {
    const uid = "user123";
    const mockTutors = [
      {
        id: "tutor1",
        tutor: "user123",
        course: "Math 101",
        location: "Online",
        description: "Experienced math tutor",
        availability: "Weekdays 10:00-14:00",
        rate: 50,
      },
      {
        id: "tutor2",
        tutor: "user123",
        course: "CS101",
        location: "Campus",
        description: "CS expert",
        availability: "Weekends 14:00-16:00",
        rate: 60,
      },
    ];
    getTutors.mockResolvedValue(mockTutors);

    const response = await request(app).get(`/api/tutors/${uid}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTutors);
    expect(getTutors).toHaveBeenCalledWith(uid);
    expect(console.log).toHaveBeenCalledWith("Received POST");
  });

  it("returns 404 when no tutors are found", async () => {
    const uid = "user123";
    getTutors.mockRejectedValue(new Error("No tutors found"));

    const response = await request(app).get(`/api/tutors/${uid}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "No tutors found" });
    expect(getTutors).toHaveBeenCalledWith(uid);
    expect(console.log).toHaveBeenCalledWith("Received POST");
  });
});
