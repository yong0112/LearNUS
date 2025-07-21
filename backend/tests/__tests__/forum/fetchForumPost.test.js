const { fetchForumPosts } = require("../../../controllers/forumController");
const { getForumPosts } = require("../../../models/forumModel");

// Mock the model
jest.mock("../../../models/forumModel");

describe("fetchForumPost Controller", () => {
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
      {
        id: "post1",
        author: "Author 1",
        title: "Post 1",
        content: "Content 1",
      },
      {
        id: "post2",
        author: "Author 2",
        title: "Post 2",
        content: "Content 2",
      },
    ];
    getForumPosts.mockResolvedValue(mockPosts);

    const req = { params: { uid } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchForumPosts(req, res);

    expect(res.json).toHaveBeenCalledWith(mockPosts);
    expect(getForumPosts).toHaveBeenCalledWith(uid);
    expect(console.log).toHaveBeenCalledWith("Received POST");
  });

  it("returns 404 when no posts are found", async () => {
    const uid = "user123";
    getForumPosts.mockRejectedValue(new Error("No posts found"));

    const req = { params: { uid } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchForumPosts(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No posts found" });
    expect(getForumPosts).toHaveBeenCalledWith(uid);
    expect(console.log).toHaveBeenCalledWith("Received POST");
  });
});
