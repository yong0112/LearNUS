const request = require("supertest");
const express = require("express");
const { toggleCommentUpvote } = require("../../../controllers/forumController");
const { toggleCommentUpvote: toggleCommentUpvoteModel } = require("../../../models/forumModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.post("/api/forum/:postId/comments/:commentId/upvote", toggleCommentUpvote);

// Mock the model
jest.mock("../../../models/forumModel");

describe("POST /api/forum/:postId/comments/:commentId/upvote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("toggles comment upvote with valid input", async () => {
    const postId = "post123";
    const commentId = "comment123";
    const input = { userId: "user123" };
    const result = { upvoted: true, upvotes: 1 };
    toggleCommentUpvoteModel.mockResolvedValue(result);

    const response = await request(app)
      .post(`/api/forum/${postId}/comments/${commentId}/upvote`)
      .send(input);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Comment upvote toggled", ...result });
    expect(toggleCommentUpvoteModel).toHaveBeenCalledWith(postId, commentId, input.userId);
  });

  it("returns 400 for missing userId", async () => {
    const postId = "post123";
    const commentId = "comment123";
    const input = {};

    const response = await request(app)
      .post(`/api/forum/${postId}/comments/${commentId}/upvote`)
      .send(input);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Missing userId" });
    expect(toggleCommentUpvoteModel).not.toHaveBeenCalled();
  });

  it("returns 500 for server error", async () => {
    const postId = "post123";
    const commentId = "comment123";
    const input = { userId: "user123" };

    toggleCommentUpvoteModel.mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post(`/api/forum/${postId}/comments/${commentId}/upvote`)
      .send(input);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Database error" });
    expect(toggleCommentUpvoteModel).toHaveBeenCalledWith(postId, commentId, input.userId);
  });
});