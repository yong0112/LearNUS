import { render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";
import Login from "../app/login"; // Adjust the path to your Login component
import { db, auth } from "../lib/firebase"; // Adjust the path to your Firebase config

// Mock dependencies not covered in jest.setup.js
// jest.mock('expo-router', () => ({
//   Link: ({ children }: { children: React.ReactNode }) => children,
//   useRouter: () => ({
//     replace: jest.fn(),
//   }),
// }));

// Mock Firebase config module
jest.mock("../lib/firebase", () => ({
  db: {},
  auth: {},
}));

// Mock Image to handle require statements for assets
jest.mock("../assets/images/logo.jpg", () => "mocked-logo.jpg");

// Mock Alert
jest.spyOn(Alert, "alert");

describe("Login Component", () => {
  it("renders email input, password input, and login button with correct placeholders", () => {
    render(<Login />);

    // Check for email input with placeholder
    const emailInput = screen.getByPlaceholderText("Email");
    expect(emailInput).toBeOnTheScreen();

    // Check for password input with placeholder
    const passwordInput = screen.getByPlaceholderText("Password");
    expect(passwordInput).toBeOnTheScreen();

    // Check for login button
    const loginButton = screen.getByText("Continue");
    expect(loginButton).toBeOnTheScreen();
  });
});
