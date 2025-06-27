const request = require("supertest");
const express = require("express");
const { addUserClasses } = require("../../../controllers/classesController");
const { postUserClasses } = require("../../../models/classesModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.post("/api/classes/:uid", addUserClasses);

// Mock the model
jest.mock("../../../models/classesModel");

describe("POST /api/classes/:uid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("creates student and tutor classes with valid input", async () => {
    const uid = "user123";
    const input = {
      people: "tutor123",
      course: "Math 101",
      date: "2",
      startTime: "10:00",
      endTime: "11:00",
      rate: 50,
      status: "Pending",
      role: "Student",
    };
    const studentClass = { id: "class1", ...input, user: uid, role: "Student" };
    const tutorClass = {
      id: "class2",
      ...input,
      user: input.people,
      people: uid,
      role: "Tutor",
    };
    postUserClasses
      .mockResolvedValueOnce(studentClass)
      .mockResolvedValueOnce(tutorClass);

    const response = await request(app).post(`/api/classes/${uid}`).send(input);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Class added",
      studentClass,
      tutorClass,
    });
    expect(postUserClasses).toHaveBeenCalledTimes(2);
    expect(postUserClasses).toHaveBeenCalledWith({
      user: uid,
      people: input.people,
      course: input.course,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      rate: input.rate,
      status: input.status,
      role: "Student",
    });
    expect(postUserClasses).toHaveBeenCalledWith({
      user: input.people,
      people: uid,
      course: input.course,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      rate: input.rate,
      status: input.status,
      role: "Tutor",
    });
  });

  it("returns 400 for missing required fields", async () => {
    const uid = "user123";
    const input = {
      people: "tutor123",
      course: "Math 101",
      date: "2025-07-01",
      startTime: "10:00",
      // Missing endTime, rate, status, role
    };

    const response = await request(app).post(`/api/classes/${uid}`).send(input);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Missing required fields" });
    expect(postUserClasses).not.toHaveBeenCalled();
  });

  it("returns 500 for server error", async () => {
    const uid = "user123";
    const input = {
      people: "tutor123",
      course: "Math 101",
      date: "2025-07-01",
      startTime: "10:00",
      endTime: "11:00",
      rate: 50,
      status: "Scheduled",
      role: "Student",
    };
    postUserClasses.mockRejectedValue(new Error("Database error"));

    const response = await request(app).post(`/api/classes/${uid}`).send(input);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Server error" });
    expect(postUserClasses).toHaveBeenCalledTimes(1);
  });
});
