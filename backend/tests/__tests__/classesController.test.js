const request = require('supertest');
const express = require('express');
const { fetchUserClasses } = require('../../controllers/classesController');
const { getUserClasses } = require('../../models/classesModel');

// Set up Express app for testing
const app = express();
app.use(express.json());
app.get('/api/classes/:uid', fetchUserClasses);

// Mock the model
jest.mock('../../models/classesModel');

describe('classesController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchUserClasses returns classes for valid uid', async () => {
    const uid = 'user123';
    const mockClasses = [
      { id: 'class1', name: 'Math 101' },
      { id: 'class2', name: 'Physics 201' },
    ];
    getUserClasses.mockResolvedValue(mockClasses);

    const response = await request(app).get(`/api/classes/${uid}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockClasses);
    expect(getUserClasses).toHaveBeenCalledWith(uid);
  });
});