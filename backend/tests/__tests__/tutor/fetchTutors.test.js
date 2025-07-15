const { fetchTutors } = require("../../../controllers/tutorController");
const { getTutors } = require("../../../models/tutorModel");

// Mock the model
jest.mock("../../../models/tutorModel");

describe("fetchTutors Controller", () => {
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

    const req = { params: { uid } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchTutors(req, res);

    expect(res.json).toHaveBeenCalledWith(mockTutors);
    expect(getTutors).toHaveBeenCalledWith(uid);
    expect(console.log).toHaveBeenCalledWith("Received POST");
  });

  it("returns 404 when no tutors are found", async () => {
    const uid = "user123";
    getTutors.mockRejectedValue(new Error("No tutors found"));

    const req = { params: { uid } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchTutors(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No tutors found" });
    expect(getTutors).toHaveBeenCalledWith(uid);
    expect(console.log).toHaveBeenCalledWith("Received POST");
  });
});
