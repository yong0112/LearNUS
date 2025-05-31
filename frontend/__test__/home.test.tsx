import React from "react";
import { render } from "@testing-library/react-native";
import HomeScreen from "../app/(tabs)/home"; // Adjust path as needed
import { MenuProvider } from "react-native-popup-menu";

// Mock Firebase auth
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    onAuthStateChanged: jest.fn((callback) => {
      callback({ uid: "test-user" }); // Simulate logged-in user
      return jest.fn(); // Fake unsubscribe
    }),
  })),
}));

jest.mock("../lib/firebase", () => ({
  auth: {
    onAuthStateChanged: jest.fn((callback) => {
      callback({ uid: "test-user" });
      return jest.fn();
    }),
  },
  db: {},
}));

// Mock fetch with proper typing
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  } as Response)
) as jest.Mock;

describe("HomeScreen", () => {
  it("renders without crashing", async () => {
    const { getByText } = render(
      <MenuProvider>
        <HomeScreen />
      </MenuProvider>,
    );
    expect(getByText("Lear")).toBeTruthy();
  });
});


global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]), // 
  }),
) as jest.Mock;

describe("HomeScreen", () => {
  it("renders without crashing", async () => {
    const { getByText } = render(
      <MenuProvider>
        <HomeScreen />
      </MenuProvider>,
    );
    expect(getByText("Lear")).toBeTruthy(); 
  });
});
