import { render, screen } from "@testing-library/react";
import ProtectedRoute from "./components/ProtectedRoute";

jest.mock("react-router-dom", () => ({
  Navigate: ({ to }) => <div data-testid="navigate">{to}</div>,
}), { virtual: true });

jest.mock("./context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = require("./context/AuthContext");

describe("ProtectedRoute", () => {
  it("renders children when user is authenticated", () => {
    useAuth.mockReturnValue({ user: { uid: "user_1", role: "buyer" } });

    render(
      <ProtectedRoute>
        <div>private page</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("private page")).toBeInTheDocument();
  });

  it("redirects guests to login", () => {
    useAuth.mockReturnValue({ user: null });

    render(
      <ProtectedRoute>
        <div>private page</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText("private page")).not.toBeInTheDocument();
    expect(screen.getByTestId("navigate")).toHaveTextContent("/login");
  });
});
