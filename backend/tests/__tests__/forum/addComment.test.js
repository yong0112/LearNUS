const request = require("supertest");
const express = require("express");
const { addComment } = require("../../../controllers/forumController");
const { postComment } = require("../../../models/forumModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.post("/api/forum/comments/:postId", addComment);

// Mock the model
jest.mock("../../../models/forumModel");

describe("POST /api/forum/comments/:postId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("creates a new comment with valid input", async () => {
    const postId = "post123";
    const input = {
      content: "This is a test comment",
      author: "user123",
      authorName: "Test User",
    };
    const newComment = { id: "comment1", ...input };
    postComment.mockResolvedValue(newComment);

    const response = await request(app)
      .post(`/api/forum/comments/${postId}`)
      .send(input);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: "Comment added", newComment });
    expect(postComment).toHaveBeenCalledWith(postId, input);
  });

  it("returns 400 for missing content", async () => {
    const postId = "post123";
    const input = {
      author: "user123",
      authorName: "Test User",
    };

    const response = await request(app)
      .post(`/api/forum/comments/${postId}`)
      .send(input);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Missing content" });
    expect(postComment).not.toHaveBeenCalled();
  });

  it("returns 500 for server error", async () => {
    const postId = "post123";
    const input = {
      content: "This is a test comment",
      author: "user123",
      authorName: "Test User",
    };
    postComment.mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post(`/api/forum/comments/${postId}`)
      .send(input);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Server error" });
    expect(postComment).toHaveBeenCalledWith(postId, input);
  });
});
