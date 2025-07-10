const {
  getCommentUpvoteStatus,
} = require("../../../controllers/forumController");
const {
  getCommentUpvoteStatus: getCommentUpvoteStatusModel,
} = require("../../../models/forumModel");

// Mock the model
jest.mock("../../../models/forumModel");

describe("getCommentUpvoteStatus", () => {
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

    const req = { params: { postId, commentId, userId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getCommentUpvoteStatus(req, res);

    expect(res.json).toHaveBeenCalledWith(result);
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

    const req = { params: { postId, commentId, userId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getCommentUpvoteStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    expect(getCommentUpvoteStatusModel).toHaveBeenCalledWith(
      postId,
      commentId,
      userId,
    );
  });
});
