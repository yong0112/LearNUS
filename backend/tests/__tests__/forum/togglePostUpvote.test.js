const { togglePostUpvote } = require("../../../controllers/forumController");
const {
  togglePostUpvote: togglePostUpvoteModel,
} = require("../../../models/forumModel");

// Mock the model
jest.mock("../../../models/forumModel");

describe("togglePostUpvote Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("toggles upvote with valid input", async () => {
    const postId = "post123";
    const input = { userId: "user123" };
    const result = { upvoted: true, upvotes: 1 };
    togglePostUpvoteModel.mockResolvedValue(result);

    const req = { params: { postId }, body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await togglePostUpvote(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Upvote toggled",
      ...result,
    });
    expect(togglePostUpvoteModel).toHaveBeenCalledWith(postId, input.userId);
  });

  it("returns 400 for missing userId", async () => {
    const postId = "post123";
    const input = {};

    const req = { params: { postId }, body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await togglePostUpvote(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing userId" });
    expect(togglePostUpvoteModel).not.toHaveBeenCalled();
  });

  it("returns 500 for server error", async () => {
    const postId = "post123";
    const input = { userId: "user123" };
    togglePostUpvoteModel.mockRejectedValue(new Error("Database error"));

    const req = { params: { postId }, body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await togglePostUpvote(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    expect(togglePostUpvoteModel).toHaveBeenCalledWith(postId, input.userId);
  });
});
