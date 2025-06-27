const request = require("supertest");
const express = require("express");
const { fetchUserProfile } = require("../../../controllers/userController");
const { getUserProfile } = require("../../../models/userModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.get("/api/users/:uid", fetchUserProfile);

// Mock the model
jest.mock("../../../models/userModel");

describe("GET /api/users/:uid", () => {
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

    const response = await request(app).get(`/api/users/${uid}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
    expect(getUserProfile).toHaveBeenCalledWith(uid);
  });

  it("returns 404 when user is not found", async () => {
    const uid = "user123";
    getUserProfile.mockRejectedValue(new Error("404 User not found"));

    const response = await request(app).get(`/api/users/${uid}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "404 User not found" });
    expect(getUserProfile).toHaveBeenCalledWith(uid);
  });
});
