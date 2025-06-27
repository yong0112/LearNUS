const request = require("supertest");
const express = require("express");
const { fetchComments } = require("../../../controllers/forumController");
const { getComments } = require("../../../models/forumModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.get("/api/forum/comments/:postId", fetchComments);

// Mock the model
jest.mock("../../../models/forumModel");

describe("GET /api/forum/comments/:postId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns comments for valid postId", async () => {
    const postId = "post123";
    const mockComments = [
      { id: "comment1", content: "Comment 1", author: "user123" },
      { id: "comment2", content: "Comment 2", author: "user456" },
    ];
    getComments.mockResolvedValue(mockComments);

    const response = await request(app).get(`/api/forum/comments/${postId}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockComments);
    expect(getComments).toHaveBeenCalledWith(postId);
  });

  it("returns 404 when no comments are found", async () => {
    const postId = "post123";
    getComments.mockRejectedValue(new Error("No comments found"));

    const response = await request(app).get(`/api/forum/comments/${postId}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "No comments found" });
    expect(getComments).toHaveBeenCalledWith(postId);
  });
});
