const request = require("supertest");
const express = require("express");
const { addForumPost } = require("../../../controllers/forumController");
const { postForum } = require("../../../models/forumModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.post("/api/forum", addForumPost);

// Mock the model
jest.mock("../../../models/forumModel");

describe("POST /api/forum", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("creates a new post with valid input", async () => {
    const input = {
      title: "New Post",
      content: "This is a test post",
      courseTag: "CS101",
      author: "user123",
    };
    const newPost = { id: "post1", ...input };
    postForum.mockResolvedValue(newPost);

    const response = await request(app).post("/api/forum").send(input);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: "Post added", newPost });
    expect(postForum).toHaveBeenCalledWith(input);
  });

  it("returns 400 for missing title", async () => {
    const input = {
      content: "This is a test post",
      courseTag: "CS101",
      author: "user123",
    };

    const response = await request(app).post("/api/forum").send(input);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Missing title" });
    expect(postForum).not.toHaveBeenCalled();
  });

  it("returns 400 for missing content", async () => {
    const input = {
      title: "New Post",
      courseTag: "CS101",
      author: "user123",
    };

    const response = await request(app).post("/api/forum").send(input);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Missing content" });
    expect(postForum).not.toHaveBeenCalled();
  });

  it("returns 500 for server error", async () => {
    const input = {
      title: "New Post",
      content: "This is a test post",
      courseTag: "CS101",
      author: "user123",
    };
    postForum.mockRejectedValue(new Error("Database error"));

    const response = await request(app).post("/api/forum").send(input);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Server error" });
    expect(postForum).toHaveBeenCalledWith(input);
  });
});
