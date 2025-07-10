const { getPostUpvoteStatus } = require("../../../controllers/forumController");
const {
  getPostUpvoteStatus: getPostUpvoteStatusModel,
} = require("../../../models/forumModel");

// Mock the model
jest.mock("../../../models/forumModel");

describe("getPostUpvoteStatus Controller", () => {
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

    const req = { params: { postId, userId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getPostUpvoteStatus(req, res);

    expect(res.json).toHaveBeenCalledWith(result);
    expect(getPostUpvoteStatusModel).toHaveBeenCalledWith(postId, userId);
  });

  it("returns 500 for server error", async () => {
    const postId = "post123";
    const userId = "user123";
    getPostUpvoteStatusModel.mockRejectedValue(new Error("Database error"));

    const req = { params: { postId, userId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getPostUpvoteStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    expect(getPostUpvoteStatusModel).toHaveBeenCalledWith(postId, userId);
  });
});
