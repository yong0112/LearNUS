const { toggleCommentUpvote } = require("../../../controllers/forumController");
const {
  toggleCommentUpvote: toggleCommentUpvoteModel,
} = require("../../../models/forumModel");

// Mock the model
jest.mock("../../../models/forumModel");

describe("toggleCommentUpvote Controller", () => {
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

    const req = { params: { postId, commentId }, body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await toggleCommentUpvote(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Comment upvote toggled",
      ...result,
    });
    expect(toggleCommentUpvoteModel).toHaveBeenCalledWith(
      postId,
      commentId,
      input.userId,
    );
  });

  it("returns 400 for missing userId", async () => {
    const postId = "post123";
    const commentId = "comment123";
    const input = {};

    const req = { params: { postId, commentId }, body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await toggleCommentUpvote(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing userId" });
    expect(toggleCommentUpvoteModel).not.toHaveBeenCalled();
  });

  it("returns 500 for server error", async () => {
    const postId = "post123";
    const commentId = "comment123";
    const input = { userId: "user123" };

    toggleCommentUpvoteModel.mockRejectedValue(new Error("Database error"));

    const req = { params: { postId, commentId }, body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await toggleCommentUpvote(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    expect(toggleCommentUpvoteModel).toHaveBeenCalledWith(
      postId,
      commentId,
      input.userId,
    );
  });
});
