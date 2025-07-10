const { fetchUserEvents } = require("../../../controllers/eventsController");
const { getUserEvents } = require("../../../models/eventsModel");

// Mock the model
jest.mock("../../../models/eventsModel");

describe("fetchUserEvents Controller", () => {
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

    const req = { params: { uid } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchUserEvents(req, res);

    expect(res.json).toHaveBeenCalledWith(mockEvents);
    expect(getUserEvents).toHaveBeenCalledWith(uid);
  });

  it("returns 404 when no events are found", async () => {
    const uid = "user123";
    getUserEvents.mockRejectedValue(new Error("No events"));

    const req = { params: { uid } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchUserEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No events" });
    expect(getUserEvents).toHaveBeenCalledWith(uid);
  });
});
