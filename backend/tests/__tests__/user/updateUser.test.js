// Mock the model
jest.mock("../../../models/userModel");

const request = require("supertest");
const express = require("express");
const {
  updateUserProfilePic,
  updateUserQR,
} = require("../../../controllers/userController");
const { updateUserProfile } = require("../../../models/userModel");

const mockUpdateUserProfile = updateUserProfile;

// Set up Express app for testing
const app = express();
app.use(express.json());
app.post("/api/users", updateUserProfilePic);

describe("updateUser Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("updates user profile with valid input", async () => {
    const input = {
      uid: "user123",
      profilePicture: "https://randomuser.me/api/portraits/men/11.jpg",
    };
    mockUpdateUserProfile.mockResolvedValue(true);

    const response = await request(app).post("/api/users").send(input);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "User profile picture updates successfully ",
    });
    expect(mockUpdateUserProfile).toHaveBeenCalledWith(input.uid, {
      profilePicture: input.profilePicture,
      updatedAt: expect.any(Date),
    });
  });

  it("returns 404 for missing uid", async () => {
    const input = {
      profilePicture: "https://randomuser.me/api/portraits/men/11.jpg",
    };

    const response = await request(app).post("/api/users").send(input);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "UID is required" });
    expect(mockUpdateUserProfile).not.toHaveBeenCalled();
  });

  it("returns 500 for server error", async () => {
    const input = {
      uid: "user123",
      profilePicture: "https://randomuser.me/api/portraits/men/11.jpg",
    };
    mockUpdateUserProfile.mockRejectedValue(new Error("Database error"));

    const response = await request(app).post("/api/users").send(input);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "Failed to update user profile picture",
      details: "Database error",
    });
    expect(mockUpdateUserProfile).toHaveBeenCalledWith(input.uid, {
      profilePicture: input.profilePicture,
      updatedAt: expect.any(Date),
    });
  });
});
