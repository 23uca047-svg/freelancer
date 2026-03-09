import { render, screen } from "@testing-library/react";
import RoleRoute from "./RoleRoute";

jest.mock("react-router-dom", () => ({
  Navigate: ({ to }) => <div data-testid="navigate">{to}</div>,
}), { virtual: true });

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = require("../context/AuthContext");

describe("RoleRoute", () => {
  it("renders children for allowed role", () => {
    useAuth.mockReturnValue({ user: { uid: "1", role: "buyer" } });

    render(
      <RoleRoute allowedRoles={["buyer"]}>
        <div>buyer content</div>
      </RoleRoute>
    );

    expect(screen.getByText("buyer content")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", () => {
    useAuth.mockReturnValue({ user: null });

    render(
      <RoleRoute allowedRoles={["buyer"]}>
        <div>buyer content</div>
      </RoleRoute>
    );

    expect(screen.getByTestId("navigate")).toHaveTextContent("/login");
  });

  it("redirects seller away from buyer-only route", () => {
    useAuth.mockReturnValue({ user: { uid: "2", role: "seller" } });

    render(
      <RoleRoute allowedRoles={["buyer"]} buyerRedirect="/" sellerRedirect="/seller-dashboard">
        <div>buyer content</div>
      </RoleRoute>
    );

    expect(screen.getByTestId("navigate")).toHaveTextContent("/seller-dashboard");
  });
});
