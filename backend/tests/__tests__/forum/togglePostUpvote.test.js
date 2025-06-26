const request = require("supertest");
const express = require("express");
const { togglePostUpvote } = require("../../../controllers/forumController");
const {
  togglePostUpvote: togglePostUpvoteModel,
} = require("../../../models/forumModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.post("/api/forum/:postId/upvote", togglePostUpvote);

// Mock the model
jest.mock("../../../models/forumModel");

describe("POST /api/forum/:postId/upvote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("toggles upvote with valid input", async () => {
    const postId = "post123";
    const input = { userId: "user123" };
    const result = { upvoted: true, upvotes: 1 };
    togglePostUpvoteModel.mockResolvedValue(result);

    const response = await request(app)
      .post(`/api/forum/${postId}/upvote`)
      .send(input);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Upvote toggled", ...result });
    expect(togglePostUpvoteModel).toHaveBeenCalledWith(postId, input.userId);
  });

  it("returns 400 for missing userId", async () => {
    const postId = "post123";
    const input = {};

    const response = await request(app)
      .post(`/api/forum/${postId}/upvote`)
      .send(input);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Missing userId" });
    expect(togglePostUpvoteModel).not.toHaveBeenCalled();
  });

  it("returns 500 for server error", async () => {
    const postId = "post123";
    const input = { userId: "user123" };
    togglePostUpvoteModel.mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post(`/api/forum/${postId}/upvote`)
      .send(input);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Database error" });
    expect(togglePostUpvoteModel).toHaveBeenCalledWith(postId, input.userId);
  });
});
