/**
 * HVHZ (High-Velocity Hurricane Zone) Overrides
 *
 * Florida Building Code 2023, Section 1620.2 and 1620.3
 * establishes minimum wind speed and exposure requirements
 * for HVHZ jurisdictions (Miami-Dade and Broward counties).
 *
 * These overrides supersede ASCE 7 Hazard Tool values when
 * the FBC minimums are higher.
 */

import type { ExposureCategory, RiskCategory } from './types';

/** HVHZ county configuration */
export interface HVHZCountyConfig {
  /** County name */
  county: string;
  /** Whether this is an HVHZ jurisdiction */
  isHVHZ: boolean;
  /** Minimum wind speeds by risk category (mph), per FBC 2023 Section 1620.2 */
  minimumWindSpeeds: Record<RiskCategory, number>;
  /** Minimum exposure category per FBC 2023 Section 1620.3 */
  minimumExposureCategory: ExposureCategory;
  /** Additional notes */
  notes: string;
}

/**
 * HVHZ county configurations per FBC 2023
 */
export const HVHZ_COUNTIES: Record<string, HVHZCountyConfig> = {
  'Miami-Dade': {
    county: 'Miami-Dade',
    isHVHZ: true,
    minimumWindSpeeds: {
      1: 170,
      2: 175,
      3: 185,
      4: 195,
    },
    minimumExposureCategory: 'C',
    notes:
      'FBC 2023 Section 1620.2. All structures in Miami-Dade require NOA (Notice of Acceptance) approved products. DIY submissions typically require sealed engineering.',
  },
  'Broward': {
    county: 'Broward',
    isHVHZ: true,
    minimumWindSpeeds: {
      1: 165,
      2: 170,
      3: 180,
      4: 190,
    },
    minimumExposureCategory: 'C',
    notes:
      'FBC 2023 Section 1620.2. Broward County HVHZ rules apply. Products must meet Miami-Dade NOA or Florida Product Approval with HVHZ compliance. DIY submissions may require sealed engineering.',
  },
};

/**
 * Check if a county is in an HVHZ jurisdiction.
 */
export function isHVHZCounty(county: string): boolean {
  const normalized = county.trim();
  return normalized in HVHZ_COUNTIES;
}

/**
 * Get HVHZ configuration for a county.
 * Returns null if county is not HVHZ.
 */
export function getHVHZConfig(county: string): HVHZCountyConfig | null {
  const normalized = county.trim();
  return HVHZ_COUNTIES[normalized] ?? null;
}

/**
 * Apply HVHZ overrides to wind speed and exposure category.
 *
 * Per FBC 2023 Section 1620.2, the design wind speed shall not be
 * less than the values specified for each risk category.
 *
 * Per FBC 2023 Section 1620.3, all HVHZ structures shall be
 * designed for Exposure Category C minimum.
 *
 * @returns Adjusted wind speed and exposure, plus any warnings generated
 */
export function applyHVHZOverrides(
  county: string,
  windSpeed: number,
  exposureCategory: ExposureCategory,
  riskCategory: RiskCategory = 2
): {
  windSpeed: number;
  exposureCategory: ExposureCategory;
  warnings: string[];
} {
  const config = getHVHZConfig(county);
  const warnings: string[] = [];

  if (!config) {
    return { windSpeed, exposureCategory, warnings };
  }

  // Apply minimum wind speed per FBC 2023 Section 1620.2
  const minimumSpeed = config.minimumWindSpeeds[riskCategory];
  let adjustedSpeed = windSpeed;
  if (windSpeed < minimumSpeed) {
    adjustedSpeed = minimumSpeed;
    warnings.push(
      `HVHZ Override: Wind speed increased from ${windSpeed} mph to ${minimumSpeed} mph per FBC 2023 Section 1620.2 (${config.county} County, Risk Category ${riskCategory}).`
    );
  }

  // Apply minimum exposure category per FBC 2023 Section 1620.3
  const exposureRank: Record<ExposureCategory, number> = { B: 1, C: 2, D: 3 };
  const minRank = exposureRank[config.minimumExposureCategory];
  const currentRank = exposureRank[exposureCategory];
  let adjustedExposure = exposureCategory;

  if (currentRank < minRank) {
    adjustedExposure = config.minimumExposureCategory;
    warnings.push(
      `HVHZ Override: Exposure category changed from ${exposureCategory} to ${config.minimumExposureCategory} per FBC 2023 Section 1620.3 (${config.county} County).`
    );
  }

  // General HVHZ warning
  warnings.push(
    `HVHZ Location: ${config.county} County is a High-Velocity Hurricane Zone. ${config.notes}`
  );

  return {
    windSpeed: adjustedSpeed,
    exposureCategory: adjustedExposure,
    warnings,
  };
}
