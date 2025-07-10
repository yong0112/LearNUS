const { addForumPost } = require("../../../controllers/forumController");
const { postForum } = require("../../../models/forumModel");

// Mock the model
jest.mock("../../../models/forumModel");

describe("addForumPost Controller", () => {
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

    const req = { body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addForumPost(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Post added", newPost });
    expect(postForum).toHaveBeenCalledWith(input);
  });

  it("returns 400 for missing title", async () => {
    const input = {
      content: "This is a test post",
      courseTag: "CS101",
      author: "user123",
    };

    const req = { body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addForumPost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing title" });
    expect(postForum).not.toHaveBeenCalled();
  });

  it("returns 400 for missing content", async () => {
    const input = {
      title: "New Post",
      courseTag: "CS101",
      author: "user123",
    };

    const req = { body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addForumPost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing content" });
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

    const req = { body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addForumPost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    expect(postForum).toHaveBeenCalledWith(input);
  });
});
