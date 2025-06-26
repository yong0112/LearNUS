const request = require("supertest");
const express = require("express");
const { fetchForumPosts } = require("../../../controllers/forumController");
const { getForumPosts } = require("../../../models/forumModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.get("/api/forum/:uid", fetchForumPosts);

// Mock the model
jest.mock("../../../models/forumModel");

describe("GET /api/forum/:uid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  it("returns posts for valid uid", async () => {
    const uid = "user123";
    const mockPosts = [
      { id: "post1", author: "Author 1", title: "Post 1", content: "Content 1" },
      { id: "post2", author: "Author 2", title: "Post 2", content: "Content 2" },
    ];
    getForumPosts.mockResolvedValue(mockPosts);

    const response = await request(app).get(`/api/forum/${uid}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockPosts);
    expect(getForumPosts).toHaveBeenCalledWith(uid);
    expect(console.log).toHaveBeenCalledWith("Received POST");
  });

  it("returns 404 when no posts are found", async () => {
    const uid = "user123";
    getForumPosts.mockRejectedValue(new Error("No posts found"));

    const response = await request(app).get(`/api/forum/${uid}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "No posts found" });
    expect(getForumPosts).toHaveBeenCalledWith(uid);
    expect(console.log).toHaveBeenCalledWith("Received POST");
  });
});