const request = require("supertest");
const express = require("express");
const {
  getCommentUpvoteStatus,
} = require("../../../controllers/forumController");
const {
  getCommentUpvoteStatus: getCommentUpvoteStatusModel,
} = require("../../../models/forumModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.get(
  "/api/forum/:postId/comments/:commentId/upvote/:userId",
  getCommentUpvoteStatus,
);

// Mock the model
jest.mock("../../../models/forumModel");

describe("GET /api/forum/:postId/comments/:commentId/upvote/:userId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("returns comment upvote status for valid postId, commentId, and userId", async () => {
    const postId = "post123";
    const commentId = "comment123";
    const userId = "user123";
    const result = { upvoted: true, upvotes: 1 };
    getCommentUpvoteStatusModel.mockResolvedValue(result);

    const response = await request(app).get(
      `/api/forum/${postId}/comments/${commentId}/upvote/${userId}`,
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual(result);
    expect(getCommentUpvoteStatusModel).toHaveBeenCalledWith(
      postId,
      commentId,
      userId,
    );
  });

  it("returns 500 for server error", async () => {
    const postId = "post123";
    const commentId = "comment123";
    const userId = "user123";
    getCommentUpvoteStatusModel.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get(
      `/api/forum/${postId}/comments/${commentId}/upvote/${userId}`,
    );
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Database error" });
    expect(getCommentUpvoteStatusModel).toHaveBeenCalledWith(
      postId,
      commentId,
      userId,
    );
  });
});
