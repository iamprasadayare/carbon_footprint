// Scientific emission factors (expressed in kg CO2e per unit)
export const EMISSION_FACTORS = {
  // Transit factors per km (EPA / DEFRA averages)
  transit: {
    "gasoline-car": 0.18,      // Standard gasoline-powered vehicle
    "electric-car": 0.05,      // EV factoring in national grid mix average
    "public-transit": 0.04,    // Bus, train, metro average per passenger-km
    "active": 0.00,            // Walking, cycling, running
  },

  // Weekly dietary footprint (World Resources Institute / IPCC averages in kg CO2e/week)
  diet: {
    "meat-heavy": 55.0,        // High beef, lamb, and frequent red meat consumption (~7.8 kg/day)
    "balanced": 30.0,          // Occasional poultry, fish, pork, dairy (~4.3 kg/day)
    "vegetarian": 18.0,        // Dairy and eggs, zero meat (~2.5 kg/day)
    "vegan": 12.0,             // Strictly plant-based (~1.7 kg/day)
  },

  // Household energy factors
  energy: {
    electricityKwh: 0.37,      // EPA eGRID US national average (kg CO2e per kWh)
    renewableKwh: 0.00,        // Zero direct emissions for 100% clean/solar energy
    
    // Weekly heating/cooling base per person based on fuels (kg CO2e)
    heatingBase: {
      "grid-gas": 15.0,        // Natural gas heating baseline
      "clean-electricity": 0.0, // Electric heat pump powered by clean energy
      "grid-oil-coal": 35.0,   // High-intensity oil or coal heating
    }
  }
};

export type TransitMode = keyof typeof EMISSION_FACTORS.transit;
export type DietType = keyof typeof EMISSION_FACTORS.diet;
export type EnergySource = keyof typeof EMISSION_FACTORS.energy.heatingBase;

export interface AuditAnswers {
  transitMode: TransitMode;
  transitDistance: number; // km per week
  dietType: DietType;
  energySource: EnergySource;
  weeklyKwh: number;       // Weekly electricity usage of household (kWh)
  householdSize: number;   // Number of residents sharing utility footprint
}

export interface EmissionBreakdown {
  transit: number; // kg CO2e / week
  diet: number;    // kg CO2e / week
  energy: number;  // kg CO2e / week
  total: number;   // kg CO2e / week
}

/**
 * Calculates transportation emissions per week.
 */
export function calculateTransitEmissions(mode: TransitMode, distanceKm: number): number {
  if (distanceKm < 0) return 0;
  const factor = EMISSION_FACTORS.transit[mode] || 0;
  return Number((distanceKm * factor).toFixed(2));
}

/**
 * Calculates diet emissions per week.
 */
export function calculateDietEmissions(dietType: DietType): number {
  return EMISSION_FACTORS.diet[dietType] || 0;
}

/**
 * Calculates household energy emissions per week (divided by household size).
 */
export function calculateEnergyEmissions(
  energySource: EnergySource,
  weeklyKwh: number,
  householdSize: number
): number {
  const size = Math.max(1, householdSize); // Prevent division by zero or negative size
  const isRenewable = energySource === "clean-electricity";
  
  // Calculate electricity contribution
  const kwhFactor = isRenewable ? EMISSION_FACTORS.energy.renewableKwh : EMISSION_FACTORS.energy.electricityKwh;
  const electricityEmissions = (weeklyKwh * kwhFactor);
  
  // Calculate heating base contribution
  const heatingEmissions = EMISSION_FACTORS.energy.heatingBase[energySource] || 0;

  // Personal footprint = (Electricity / size) + heating allocation
  // (We assume electricity is shared, and heating baseline is specified per-person or also shared; 
  // let's share total energy usage equally)
  const totalHouseholdEnergy = electricityEmissions + (heatingEmissions * size);
  return Number((totalHouseholdEnergy / size).toFixed(2));
}

/**
 * Runs the complete carbon footprint calculation.
 */
export function calculateFootprint(answers: AuditAnswers): EmissionBreakdown {
  const transit = calculateTransitEmissions(answers.transitMode, answers.transitDistance);
  const diet = calculateDietEmissions(answers.dietType);
  const energy = calculateEnergyEmissions(answers.energySource, answers.weeklyKwh, answers.householdSize);
  
  const total = Number((transit + diet + energy).toFixed(2));
  
  return {
    transit,
    diet,
    energy,
    total
  };
}
