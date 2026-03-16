/**
 * ASCE 7-22 Wind Pressure Calculator Types
 *
 * These types define the inputs and outputs for ASCE 7-22 Chapter 30
 * Components and Cladding (C&C) wind pressure calculations.
 *
 * Reference: ASCE/SEI 7-22, Minimum Design Loads and Associated Criteria
 * for Buildings and Other Structures
 */

/** Exposure categories per ASCE 7-22 Section 26.7 */
export type ExposureCategory = 'B' | 'C' | 'D';

/** Risk categories per ASCE 7-22 Table 1.5-1 */
export type RiskCategory = 1 | 2 | 3 | 4;

/** Wind pressure zones for C&C per ASCE 7-22 Figure 30.3-1 */
export type WindZone = 4 | 5;

/** Florida county identifiers */
export interface CountyInfo {
  name: string;
  isHVHZ: boolean;
  state: string;
}

/**
 * Calculator Input
 *
 * All parameters needed to calculate wind pressures on
 * components and cladding (doors, windows, panels).
 */
export interface CalculatorInput {
  /** Florida county name (e.g., "Broward", "Miami-Dade") */
  county: string;

  /** Whether location is in a High-Velocity Hurricane Zone */
  isHVHZ: boolean;

  /** Ultimate wind speed (Vult) in mph per ASCE 7-22 Figure 26.5-1 */
  ultimateWindSpeed: number;

  /** Exposure category per ASCE 7-22 Section 26.7 */
  exposureCategory: ExposureCategory;

  /** Mean roof height in feet */
  meanRoofHeight: number;

  /** Building length in feet (longest horizontal dimension) */
  buildingLength: number;

  /** Building width in feet (shortest horizontal dimension) */
  buildingWidth: number;

  /**
   * Effective wind area in square feet.
   * For doors/windows, this is the product width × height.
   */
  effectiveWindArea: number;

  /**
   * Topographic factor per ASCE 7-22 Section 26.8.
   * Default: 1.0 (flat terrain). Values > 1.0 for hills, ridges, escarpments.
   */
  topographicFactor?: number;

  /** Risk category per ASCE 7-22 Table 1.5-1. Default: 2 (residential) */
  riskCategory?: RiskCategory;

  /** Project address (optional, for record-keeping) */
  address?: string;
}

/** Wind pressure results for a single zone */
export interface ZonePressure {
  /** Positive (inward) pressure in psf */
  positive: number;

  /** Negative (outward/suction) pressure in psf */
  negative: number;

  /** Wind loads in pounds-force for the given effective wind area */
  loads: {
    /** Positive load in lbf */
    positive: number;
    /** Negative load in lbf */
    negative: number;
  };
}

/** Intermediate calculation values (for transparency/debugging) */
export interface IntermediateValues {
  /**
   * Zone end width 'a' in feet.
   * Per ASCE 7-22: a = min(0.1 × least horizontal dimension, 0.4 × h)
   * but not less than 4% of least dimension or 3 ft.
   */
  zoneEndWidth: number;

  /** Velocity pressure at mean roof height (qh) in psf */
  velocityPressure: number;

  /** Velocity pressure exposure coefficient at mean roof height */
  exposureCoefficient: number;

  /** Wind directionality factor (Kd) */
  directionalityFactor: number;

  /** Ground elevation factor (Ke) */
  groundElevationFactor: number;
}

/**
 * Calculator Output
 *
 * Complete results including zone pressures, intermediate values,
 * critical pressures for product selection, and any warnings.
 */
export interface CalculatorOutput {
  /** Input snapshot (for record-keeping) */
  input: CalculatorInput;

  /** Intermediate calculation values */
  intermediate: IntermediateValues;

  /** Zone 4 (interior) pressures and loads */
  zone4: ZonePressure;

  /** Zone 5 (corner/edge) pressures and loads */
  zone5: ZonePressure;

  /**
   * Critical pressures for product selection.
   * Products must meet or exceed these values.
   */
  criticalPressure: {
    /** Maximum positive pressure (psf) across all zones */
    positive: number;
    /** Maximum negative (suction) pressure magnitude (psf) across all zones */
    negative: number;
  };

  /** ASCE 7 version used */
  asce7Version: string;

  /** Florida Building Code version applied */
  floridaBuildingCodeVersion: string;

  /** ISO timestamp of calculation */
  calculatedAt: string;

  /** Any warnings or advisory messages */
  warnings: string[];
}

/** Product comparison input */
export interface ProductRating {
  /** Product name/description */
  name: string;

  /** Florida Product Approval number (e.g., "FL12345-R2") */
  approvalNumber?: string;

  /** Manufacturer name */
  manufacturer?: string;

  /** Rated positive (inward) pressure in psf */
  ratedPositive: number;

  /** Rated negative (outward/suction) pressure in psf (enter as positive number) */
  ratedNegative: number;

  /** Whether product is NOA (Notice of Acceptance) approved for HVHZ */
  isHVHZApproved?: boolean;
}

/** Product comparison result */
export interface ProductComparison {
  product: ProductRating;
  requiredPressure: {
    positive: number;
    negative: number;
  };
  zone4: {
    positivePass: boolean;
    negativePass: boolean;
  };
  zone5: {
    positivePass: boolean;
    negativePass: boolean;
  };
  overallPass: boolean;
  margin: {
    /** Margin in psf (positive = excess capacity, negative = deficient) */
    positive: number;
    negative: number;
  };
  warnings: string[];
}

/** Validation error for input checking */
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}
