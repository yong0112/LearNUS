// LearNUS/backend/tests/setup.js
jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn().mockReturnValue({}),
  },
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          get: jest.fn(),
        })),
      })),
    })),
  })),
}));

jest.mock("firebase-admin", () => {
  const mockCollection = {
    doc: jest.fn(() => mockDoc),
    get: jest.fn(),
  };
  const mockDoc = {
    collection: jest.fn(() => mockCollection),
  };
  const mockFirestore = {
    collection: jest.fn(() => mockCollection),
  };

  return {
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn().mockReturnValue({}),
    },
    firestore: jest.fn(() => mockFirestore),
    apps: [], // ✅ Add this line
  };
});
