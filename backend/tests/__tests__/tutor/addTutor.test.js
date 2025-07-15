const { addTutor } = require("../../../controllers/tutorController");
const { postTutor } = require("../../../models/tutorModel");

// Mock the model
jest.mock("../../../models/tutorModel");

describe("addTutor Controller", () => {
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

    const req = { body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addTutor(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Tutor added", newTutor });
    expect(postTutor).toHaveBeenCalledWith(input);
  });

  it("returns 400 for missing required fields", async () => {
    const input = {
      tutor: "user123",
      course: "Math 101",
      location: "Online",
      // Missing description, availability, rate
    };

    const req = { body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addTutor(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required fields" });
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

    const req = { body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addTutor(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    expect(postTutor).toHaveBeenCalledWith(input);
  });
});
