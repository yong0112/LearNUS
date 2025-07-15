const { fetchUserReviews } = require("../../../controllers/reviewsController");
const { getUserReviews } = require("../../../models/reviewsModel");

// Mock the model
jest.mock("../../../models/reviewsModel");

describe("fetchUserReviews Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns reviews for a valid uid", async () => {
    const uid = "user123";
    const mockReviews = [
      {
        id: "review1",
        reviewer: "user456",
        rating: 5,
        comment: "Great tutor!",
        createdAt: "2025-07-01",
      },
      {
        id: "review2",
        reviewer: "user789",
        rating: 4.5,
        comment: "Very helpful session.",
        createdAt: "2025-07-01",
      },
    ];
    getUserReviews.mockResolvedValue(mockReviews);

    const req = { params: { uid } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchUserReviews(req, res);

    expect(res.json).toHaveBeenCalledWith(mockReviews);
    expect(getUserReviews).toHaveBeenCalledWith(uid);
  });

  it("returns 404 when no reviews are found", async () => {
    const uid = "user123";
    getUserReviews.mockRejectedValue(new Error("No reviews"));

    const req = { params: { uid } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchUserReviews(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No reviews" });
    expect(getUserReviews).toHaveBeenCalledWith(uid);
  });
});
