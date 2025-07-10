const { fetchComments } = require("../../../controllers/forumController");
const { getComments } = require("../../../models/forumModel");

// Mock the model
jest.mock("../../../models/forumModel");

describe("fetchComment Controller", () => {
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

    const req = { params: { postId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchComments(req, res);

    expect(res.json).toHaveBeenCalledWith(mockComments);
    expect(getComments).toHaveBeenCalledWith(postId);
  });

  it("returns 404 when no comments are found", async () => {
    const postId = "post123";
    getComments.mockRejectedValue(new Error("No comments found"));

    const req = { params: { postId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchComments(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No comments found" });
    expect(getComments).toHaveBeenCalledWith(postId);
  });
});
