const { addUserClasses } = require("../../../controllers/classesController");
const { postUserClasses } = require("../../../models/classesModel");

// Mock the model
jest.mock("../../../models/classesModel");

describe("addUserClasses Controller", () => {
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
      dayOfWeek: "2",
      startTime: "10:00",
      endTime: "11:00",
      rate: 50,
      status: "Pending",
      role: "Student",
      createdAt: new Date("2025-07-21T15:00:00.000Z").toISOString(),
      endedAt: new Date("2025-08-12T12:00:00.000Z").toISOString(),
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

    const req = { params: { uid }, body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addUserClasses(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Class added",
      studentClass,
      tutorClass,
    });
    expect(postUserClasses).toHaveBeenCalledTimes(2);
    expect(postUserClasses).toHaveBeenCalledWith({
      user: uid,
      people: input.people,
      course: input.course,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      rate: input.rate,
      status: input.status,
      role: "Student",
      createdAt: input.createdAt,
      endedAt: input.endedAt,
    });
    expect(postUserClasses).toHaveBeenCalledWith({
      user: input.people,
      people: uid,
      course: input.course,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      rate: input.rate,
      status: input.status,
      role: "Tutor",
      createdAt: input.createdAt,
      endedAt: input.endedAt,
    });
  });

  it("returns 400 for missing required fields", async () => {
    const uid = "user123";
    const input = {
      people: "tutor123",
      course: "Math 101",
      startTime: "10:00",
      // Missing endTime, rate, status, role
    };

    const req = { params: { uid }, body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addUserClasses(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required fields" });
    expect(postUserClasses).not.toHaveBeenCalled();
  });

  it("returns 500 for server error", async () => {
    const uid = "user123";
    const input = {
      people: "tutor123",
      course: "Math 101",
      dayOfWeek: "2",
      startTime: "10:00",
      endTime: "11:00",
      rate: 50,
      status: "Scheduled",
      role: "Student",
      createdAt: new Date("2025-07-21T15:00:00.000Z").toISOString(),
      endedAt: new Date("2025-08-12T12:00:00.000Z").toISOString(),
    };
    postUserClasses.mockRejectedValue(new Error("Database error"));

    const req = { params: { uid }, body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addUserClasses(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    expect(postUserClasses).toHaveBeenCalledTimes(1);
  });
});
