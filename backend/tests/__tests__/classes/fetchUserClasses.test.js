const request = require("supertest");
const express = require("express");
const { fetchUserClasses } = require("../../../controllers/classesController");
const { getUserClasses } = require("../../../models/classesModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.get("/api/classes/:uid", fetchUserClasses);

// Mock the model
jest.mock("../../../models/classesModel");

describe("GET /api/classes/:uid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns classes for a valid uid", async () => {
    const uid = "user123";
    const mockClasses = [
      {
        id: "class1",
        people: "tutor123",
        course: "Math 101",
        date: "2025-07-01",
        startTime: "10:00",
        endTime: "11:00",
        rate: 50,
        status: "Pending",
        role: "Student",
      },
      {
        id: "class2",
        people: "student456",
        course: "CS101",
        date: "2025-07-02",
        startTime: "14:00",
        endTime: "15:00",
        rate: 60,
        status: "Completed",
        role: "Tutor",
      },
    ];
    getUserClasses.mockResolvedValue(mockClasses);

    const response = await request(app).get(`/api/classes/${uid}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockClasses);
    expect(getUserClasses).toHaveBeenCalledWith(uid);
  });

  it("returns 404 when no classes are found", async () => {
    const uid = "user123";
    getUserClasses.mockRejectedValue(new Error("No classes"));

    const response = await request(app).get(`/api/classes/${uid}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "No classes" });
    expect(getUserClasses).toHaveBeenCalledWith(uid);
  });
});