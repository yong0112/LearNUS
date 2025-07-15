const { addComment } = require("../../../controllers/forumController");
const { postComment } = require("../../../models/forumModel");

// Mock the model
jest.mock("../../../models/forumModel");

describe("addComment Controller", () => {
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

    const req = { params: { postId }, body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Comment added",
      newComment,
    });
    expect(postComment).toHaveBeenCalledWith(postId, input);
  });

  it("returns 400 for missing content", async () => {
    const postId = "post123";
    const input = {
      author: "user123",
      authorName: "Test User",
    };

    const req = { params: { postId }, body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing content" });
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

    const req = { params: { postId }, body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    expect(postComment).toHaveBeenCalledWith(postId, input);
  });
});
