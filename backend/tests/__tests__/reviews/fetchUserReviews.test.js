const request = require("supertest");
const express = require("express");
const { fetchUserReviews } = require("../../../controllers/reviewsController");
const { getUserReviews } = require("../../../models/reviewsModel");

// Set up Express app for testing
const app = express();
app.use(express.json());
app.get("/api/reviews/:uid", fetchUserReviews);

// Mock the model
jest.mock("../../../models/reviewsModel");

describe("GET /api/reviews/:uid", () => {
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

    const response = await request(app).get(`/api/reviews/${uid}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockReviews);
    expect(getUserReviews).toHaveBeenCalledWith(uid);
  });

  it("returns 404 when no reviews are found", async () => {
    const uid = "user123";
    getUserReviews.mockRejectedValue(new Error("No reviews"));

    const response = await request(app).get(`/api/reviews/${uid}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "No reviews" });
    expect(getUserReviews).toHaveBeenCalledWith(uid);
  });
});
