import React from "react";
import { render } from "@testing-library/react-native";
import HomeScreen from "../app/(tabs)/home"; // Adjust path as needed
import { MenuProvider } from "react-native-popup-menu";

// 🔧 Mock Firebase Auth
jest.mock("firebase/auth", () => {
  return {
    getAuth: jest.fn(() => ({
      onAuthStateChanged: jest.fn((callback) => {
        callback({ uid: "test-user" }); // simulate logged-in user
        return jest.fn(); // return fake unsubscribe
      }),
    })),
  };
});

// __test__/home.test.tsx

jest.mock('../lib/firebase', () => {
  return {
    auth: {
      onAuthStateChanged: jest.fn((callback) => {
        callback({ uid: 'test-user' }); // mock user object
        return jest.fn(); // unsubscribe function
      }),
    },
    db: {}, // mock Firestore db object if needed
  };
});


// Optional: Mock fetch if used
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]), // or mock dummy tutors list
  })
) as jest.Mock;

describe("HomeScreen", () => {
  it("renders without crashing", async () => {
    const { getByText } = render(
      <MenuProvider>
        <HomeScreen />
      </MenuProvider>
    );
    expect(getByText("Lear")).toBeTruthy(); // Adjust text to match your UI
  });
});

