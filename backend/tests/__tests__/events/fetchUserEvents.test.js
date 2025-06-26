const request = require("supertest");
const express = require("express");
const { fetchUserEvents } = require("../../../controllers/eventsController");
const { getUserEvents } = require("../../../models/eventsModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.get("/api/events/:uid", fetchUserEvents);

// Mock the model
jest.mock("../../../models/eventsModel");

describe("GET /api/events/:uid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns events for a valid uid", async () => {
    const uid = "user123";
    const mockEvents = [
      {
        id: "event1",
        title: "Dinner with Friends",
        date: "2025-07-01",
        startTime: "18:00",
        endTime: "20:00",
      },
      {
        id: "event2",
        title: "CS Workshop",
        date: "2025-07-02",
        startTime: "14:00",
        endTime: "15:00",
      },
    ];
    getUserEvents.mockResolvedValue(mockEvents);

    const response = await request(app).get(`/api/events/${uid}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockEvents);
    expect(getUserEvents).toHaveBeenCalledWith(uid);
  });

  it("returns 404 when no events are found", async () => {
    const uid = "user123";
    getUserEvents.mockRejectedValue(new Error("No events"));

    const response = await request(app).get(`/api/events/${uid}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "No events" });
    expect(getUserEvents).toHaveBeenCalledWith(uid);
  });
});