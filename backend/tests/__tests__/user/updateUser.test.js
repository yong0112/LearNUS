const request = require("supertest");
const express = require("express");
const { updateUser } = require("../../../controllers/userController");
const { updateUserProfile } = require("../../../models/userModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.post("/api/users", updateUser);

// Mock the model
jest.mock("../../../models/userModel");

describe("POST /api/users", () => {
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
      email: "newuser@example.com",
    };
    updateUserProfile.mockResolvedValue(true);

    const response = await request(app).post("/api/users").send(input);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "User profile updates successfully ",
    });
    expect(updateUserProfile).toHaveBeenCalledWith(input.uid, {
      email: input.email,
      updatedAt: expect.any(Date),
    });
  });

  it("returns 404 for missing uid", async () => {
    const input = {
      email: "newuser@example.com",
    };

    const response = await request(app).post("/api/users").send(input);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "UID is required" });
    expect(updateUserProfile).not.toHaveBeenCalled();
  });

  it("returns 500 for server error", async () => {
    const input = {
      uid: "user123",
      email: "newuser@example.com",
    };
    updateUserProfile.mockRejectedValue(new Error("Database error"));

    const response = await request(app).post("/api/users").send(input);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "Failed to update user profile",
      details: "Database error",
    });
    expect(updateUserProfile).toHaveBeenCalledWith(input.uid, {
      email: input.email,
      updatedAt: expect.any(Date),
    });
  });
});
