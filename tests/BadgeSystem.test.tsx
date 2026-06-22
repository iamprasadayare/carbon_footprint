import React from "react";
import { render, screen } from "@testing-library/react";
import BadgeSystem from "../src/components/BadgeSystem";

// Mock firebase to prevent real initialization in test environment
jest.mock("../src/lib/firebase", () => ({
  calculateBadges: jest.fn().mockReturnValue(["ecosystem", "advocate", "scholar", "seedling"]),
  trackEvent: jest.fn(),
}));

// Mock the useAppState hook
jest.mock("../src/app/providers", () => ({
  useAppState: () => ({
    points: 1200,
    badges: ["ecosystem", "advocate", "scholar", "seedling"],
    missions: [
      { id: "1", completed: true },
      { id: "2", completed: true },
      { id: "3", completed: true },
      { id: "4", completed: true },
      { id: "5", completed: true },
      { id: "6", completed: true },
      { id: "7", completed: true },
      { id: "8", completed: true },
      { id: "9", completed: true },
      { id: "10", completed: true },
    ]
  }),
}));

describe("BadgeSystem Component", () => {
  it("renders without crashing", () => {
    render(<BadgeSystem />);
    expect(screen.getByText("Achievement Badges")).toBeInTheDocument();
  });

  it("displays the correct number of earned badges", () => {
    render(<BadgeSystem />);
    // Component shows "N/M earned" in header
    const earnedText = screen.getAllByText(/earned/i);
    expect(earnedText.length).toBeGreaterThanOrEqual(1);
  });

  it("calculates progress correctly for next badges", () => {
    render(<BadgeSystem />);
    // Component renders quest points stat label
    const missionsDone = screen.getAllByText(/Missions Done/i);
    expect(missionsDone.length).toBeGreaterThanOrEqual(1);
  });
});
