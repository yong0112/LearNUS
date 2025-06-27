const request = require("supertest");
const express = require("express");
const { addUserEvents } = require("../../../controllers/eventsController");
const { postUserEvents } = require("../../../models/eventsModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.post("/api/events/:uid", addUserEvents);

// Mock the model
jest.mock("../../../models/eventsModel");

describe("POST /api/events/:uid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("creates an event with valid input", async () => {
    const uid = "user123";
    const input = {
      title: "CS Study Group",
      date: "2025-07-01",
      startTime: "10:00",
      endTime: "11:00",
    };
    const eventClass = { id: "event1", ...input };
    postUserEvents.mockResolvedValue(eventClass);

    const response = await request(app).post(`/api/events/${uid}`).send(input);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: "Event added", eventClass });
    expect(postUserEvents).toHaveBeenCalledWith({
      user: uid,
      title: input.title,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
    });
  });

  it("returns 400 for missing required fields", async () => {
    const uid = "user123";
    const input = {
      title: "CS Study Group",
      date: "2025-07-01",
      // Missing startTime, endTime
    };

    const response = await request(app).post(`/api/events/${uid}`).send(input);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Missing required fields" });
    expect(postUserEvents).not.toHaveBeenCalled();
  });

  it("returns 500 for server error", async () => {
    const uid = "user123";
    const input = {
      title: "CS Study Group",
      date: "2025-07-01",
      startTime: "10:00",
      endTime: "11:00",
    };
    postUserEvents.mockRejectedValue(new Error("Database error"));

    const response = await request(app).post(`/api/events/${uid}`).send(input);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Server error" });
    expect(postUserEvents).toHaveBeenCalledWith({
      user: uid,
      title: input.title,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
    });
  });
});
