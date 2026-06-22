import React from "react";
import { render, screen } from "@testing-library/react";
import Leaderboard from "../src/components/Leaderboard";

// Mock the getLeaderboard function
jest.mock("../src/lib/firebase", () => ({
  getLeaderboard: jest.fn().mockResolvedValue([
    { uid: "1", displayName: "Test User 1", country: "India", score: 95, totalPoints: 1500, badge: "ecosystem" },
    { uid: "2", displayName: "Test User 2", country: "USA", score: 85, totalPoints: 1200, badge: "advocate" },
  ])
}));

describe("Leaderboard Component", () => {
  it("renders the leaderboard title", () => {
    render(<Leaderboard currentUid="1" />);
    expect(screen.getByText("Global Leaderboard")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    render(<Leaderboard currentUid="1" />);
    expect(screen.getByText(/Firebase \+ BigQuery/i)).toBeInTheDocument();
  });
});
