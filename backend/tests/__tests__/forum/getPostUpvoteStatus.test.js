const request = require("supertest");
const express = require("express");
const { getPostUpvoteStatus } = require("../../../controllers/forumController");
const {
  getPostUpvoteStatus: getPostUpvoteStatusModel,
} = require("../../../models/forumModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.get("/api/forum/:postId/upvote/:userId", getPostUpvoteStatus);

// Mock the model
jest.mock("../../../models/forumModel");

describe("GET /api/forum/:postId/upvote/:userId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("returns upvote status for valid postId and userId", async () => {
    const postId = "post123";
    const userId = "user123";
    const result = { upvoted: true, upvotes: 1 };
    getPostUpvoteStatusModel.mockResolvedValue(result);

    const response = await request(app).get(
      `/api/forum/${postId}/upvote/${userId}`,
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual(result);
    expect(getPostUpvoteStatusModel).toHaveBeenCalledWith(postId, userId);
  });

  it("returns 500 for server error", async () => {
    const postId = "post123";
    const userId = "user123";
    getPostUpvoteStatusModel.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get(
      `/api/forum/${postId}/upvote/${userId}`,
    );
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Database error" });
    expect(getPostUpvoteStatusModel).toHaveBeenCalledWith(postId, userId);
  });
});
