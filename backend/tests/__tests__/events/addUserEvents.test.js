const { addUserEvents } = require("../../../controllers/eventsController");
const { postUserEvents } = require("../../../models/eventsModel");

// Mock the model
jest.mock("../../../models/eventsModel");

describe("addUserEvents Controller", () => {
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

    const req = { params: { uid }, body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addUserEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Event added",
      eventClass,
    });
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

    const req = { params: { uid }, body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addUserEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required fields" });
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

    const req = { params: { uid }, body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addUserEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    expect(postUserEvents).toHaveBeenCalledWith({
      user: uid,
      title: input.title,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
    });
  });
});
