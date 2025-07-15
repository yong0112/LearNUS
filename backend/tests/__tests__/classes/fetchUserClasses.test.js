const { fetchUserClasses } = require("../../../controllers/classesController");
const { getUserClasses } = require("../../../models/classesModel");

// Mock the model
jest.mock("../../../models/classesModel");

describe("fetchUserClasses Controller", () => {
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

    const req = { params: { uid } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchUserClasses(req, res);

    expect(res.json).toHaveBeenCalledWith(mockClasses);
    expect(getUserClasses).toHaveBeenCalledWith(uid);
  });

  it("returns 404 when no classes are found", async () => {
    const uid = "user123";
    getUserClasses.mockRejectedValue(new Error("No classes"));

    const req = { params: { uid } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchUserClasses(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No classes" });
    expect(getUserClasses).toHaveBeenCalledWith(uid);
  });
});
