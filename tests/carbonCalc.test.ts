import {
  calculateTransitEmissions,
  calculateDietEmissions,
  calculateEnergyEmissions,
  calculateFootprint,
  AuditAnswers
} from "../src/utils/carbonCalc";

describe("Carbon Footprint Calculation Suite", () => {
  
  // Test 1: Transit Emission Calculations
  describe("Transit Emissions", () => {
    test("calculates gasoline car emissions correctly", () => {
      // 100 km * 0.18 kg CO2/km = 18 kg CO2
      expect(calculateTransitEmissions("gasoline-car", 100)).toBe(18);
    });

    test("calculates electric car emissions correctly", () => {
      // 100 km * 0.05 kg CO2/km = 5 kg CO2
      expect(calculateTransitEmissions("electric-car", 100)).toBe(5);
    });

    test("calculates public transit emissions correctly", () => {
      // 250 km * 0.04 kg CO2/km = 10 kg CO2
      expect(calculateTransitEmissions("public-transit", 250)).toBe(10);
    });

    test("active transit results in zero emissions", () => {
      expect(calculateTransitEmissions("active", 50)).toBe(0);
      expect(calculateTransitEmissions("active", 0)).toBe(0);
    });

    test("handles negative distance inputs gracefully by returning 0", () => {
      expect(calculateTransitEmissions("gasoline-car", -50)).toBe(0);
    });
  });

  // Test 2: Diet Emission Calculations
  describe("Diet Emissions", () => {
    test("returns correct constants for diet profiles", () => {
      expect(calculateDietEmissions("meat-heavy")).toBe(55);
      expect(calculateDietEmissions("balanced")).toBe(30);
      expect(calculateDietEmissions("vegetarian")).toBe(18);
      expect(calculateDietEmissions("vegan")).toBe(12);
    });
  });

  // Test 3: Shared Household Energy Calculations
  describe("Energy Emissions", () => {
    test("shares grid electricity and gas heating baseline across household size", () => {
      // Setup: 100 kWh/week, grid-gas source, household size = 2
      // Electricity: 100 kWh * 0.37 kg CO2/kWh = 37 kg CO2
      // Heating base: 15 kg CO2/person * 2 people = 30 kg CO2
      // Total Household: 37 + 30 = 67 kg CO2
      // Per Person: 67 / 2 = 33.50 kg CO2
      expect(calculateEnergyEmissions("grid-gas", 100, 2)).toBe(33.5);
    });

    test("calculates zero-carbon footprint for renewable solar + heat pump configuration", () => {
      // Renewable source has factor 0.00 and heatingBase 0.0
      expect(calculateEnergyEmissions("clean-electricity", 200, 4)).toBe(0);
    });

    test("shares high-intensity heating fuel correctly", () => {
      // Setup: 50 kWh/week, grid-oil-coal source, household size = 1
      // Electricity: 50 * 0.37 = 18.5 kg CO2
      // Heating base: 35 kg CO2 * 1 = 35 kg CO2
      // Total: 18.5 + 35 = 53.5 kg CO2
      // Per Person: 53.5 / 1 = 53.50 kg CO2
      expect(calculateEnergyEmissions("grid-oil-coal", 50, 1)).toBe(53.5);
    });

    test("handles zero or negative household sizes safely (defaults to 1)", () => {
      // 100 kWh/week, grid-gas, size <= 0
      // Expected result same as size = 1: (100 * 0.37 + 15) / 1 = 52.00
      expect(calculateEnergyEmissions("grid-gas", 100, 0)).toBe(52);
      expect(calculateEnergyEmissions("grid-gas", 100, -2)).toBe(52);
    });
  });

  // Test 4: Full Integrated Calculation
  describe("Total Footprint Integration", () => {
    test("correctly sums up individual sections", () => {
      const answers: AuditAnswers = {
        transitMode: "gasoline-car",
        transitDistance: 120, // 120 * 0.18 = 21.6
        dietType: "balanced", // 30.0
        energySource: "grid-gas",
        weeklyKwh: 100, 
        householdSize: 2, // (100 * 0.37 + 15 * 2) / 2 = (37 + 30) / 2 = 33.5
      };

      // Total Expected = 21.6 + 30.0 + 33.5 = 85.10 kg CO2e
      const result = calculateFootprint(answers);
      expect(result.transit).toBe(21.6);
      expect(result.diet).toBe(30.0);
      expect(result.energy).toBe(33.5);
      expect(result.total).toBe(85.1);
    });
  });

});
