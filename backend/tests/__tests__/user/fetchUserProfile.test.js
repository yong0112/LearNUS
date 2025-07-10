const { fetchUserProfile } = require("../../../controllers/userController");
const { getUserProfile } = require("../../../models/userModel");

// Mock the model
jest.mock("../../../models/userModel");

describe("fetchUserProfile Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns user profile for a valid uid", async () => {
    const uid = "user123";
    const mockUser = {
      id: uid,
      email: "user@example.com",
      name: "Test User",
      createdAt: "2025-06-01",
    };
    getUserProfile.mockResolvedValue(mockUser);

    const req = { params: { uid } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchUserProfile(req, res);

    expect(res.json).toHaveBeenCalledWith(mockUser);
    expect(getUserProfile).toHaveBeenCalledWith(uid);
  });

  it("returns 404 when user is not found", async () => {
    const uid = "user123";
    getUserProfile.mockRejectedValue(new Error("404 User not found"));

    const req = { params: { uid } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "404 User not found" });
    expect(getUserProfile).toHaveBeenCalledWith(uid);
  });
});
