// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025 Oasis Engineering — windcalculations.com
// This file is part of @oasis/asce7-calculator.
// Commercial license: info@oasisengineering.com

/**
 * ASCE 7-22 Project Report Calculator
 *
 * Full project report generation for multiple openings (windows, doors)
 * AND roof components. Generates a comprehensive calculation report
 * snapshot including all inputs, intermediate factors, and results.
 *
 * Reference: ASCE/SEI 7-22, Chapter 30 (Components and Cladding)
 */

import type { ExposureCategory, RiskCategory } from './types';
import type { RoofType } from './roof-formulas';
import {
  calculateKz,
  calculateVelocityPressure,
  calculateZoneEndWidth,
  getGCp,
  calculateDesignPressure,
  KD_COMPONENTS_CLADDING,
  KE_SEA_LEVEL,
  GCPI_ENCLOSED,
} from './formulas';
import { calculateRoofPressure } from './roof-formulas';
import { applyHVHZOverrides, isHVHZCounty } from './hvhz-overrides';

// ============================================================
// Types
// ============================================================

/** A single window/door opening in the project */
export interface Opening {
  /** Label like W-1, D-2, SL-3 */
  markId: string;
  /** Type of opening */
  type: 'Window' | 'Door' | 'Sliding Door' | 'Storefront' | 'Fixed Window' | 'Curtain Wall';
  /** Width in inches */
  widthInches: number;
  /** Height in inches */
  heightInches: number;
  /** Floor level (1-based) */
  floorLevel: number;
  /** Wall pressure zone */
  zone: 4 | 5;
  /** Optional manufacturer */
  manufacturer?: string;
  /** Optional model */
  model?: string;
  /** Optional FL Product Approval number */
  flApproval?: string;
  /** Optional Miami-Dade NOA number */
  noaNumber?: string;
}

/** Project-level inputs */
export interface ProjectInput {
  /** Project name/description */
  projectName: string;
  /** Building address */
  address: string;
  /** State abbreviation */
  state: string;
  /** County name */
  county: string;
  /** Is this in HVHZ? */
  isHVHZ: boolean;
  /** Ultimate wind speed (mph) */
  ultimateWindSpeed: number;
  /** Exposure category */
  exposureCategory: ExposureCategory;
  /** Mean roof height (ft) */
  meanRoofHeight: number;
  /** Building length (ft) */
  buildingLength: number;
  /** Building width (ft) */
  buildingWidth: number;
  /** Risk category (default 2) */
  riskCategory?: RiskCategory;
  /** Topographic factor (default 1.0) */
  topographicFactor?: number;
  /** Ground elevation factor (default 1.0) */
  groundElevationFactor?: number;
  /** Enclosure type */
  enclosureType: 'Enclosed' | 'Partially Enclosed';
  /** All window/door openings */
  openings: Opening[];
  /** Roof info (optional, for roof C&C) */
  roof?: {
    roofType: RoofType;
    /** Effective wind area for roof components (sq ft) */
    effectiveArea: number;
  };
}

/** Result for a single opening */
export interface OpeningResult {
  opening: Opening;
  /** Effective wind area in sq ft (converted from inches) */
  effectiveWindArea: number;
  /** Height used for Kz (floor-adjusted if needed) */
  heightUsed: number;
  /** Kz at the opening's height */
  kz: number;
  /** Velocity pressure at opening height (psf) */
  qz: number;
  /** GCp values used */
  gcpPositive: number;
  gcpNegative: number;
  /** Design pressures (psf) */
  designPressurePositive: number;
  designPressureNegative: number;
}

/** Full project report output */
export interface ProjectReport {
  /** Input snapshot */
  project: ProjectInput;
  /** Date of calculation */
  calculatedAt: string;
  /** ASCE 7-22 version */
  asce7Version: string;
  /** Common calculation factors */
  commonFactors: {
    kd: number;
    ke: number;
    kzt: number;
    gcpiPositive: number;
    gcpiNegative: number;
    zoneEndWidth: number;
    /** Kz at mean roof height */
    kzRoof: number;
    /** qh at mean roof height */
    qh: number;
  };
  /** Results for each opening */
  openingResults: OpeningResult[];
  /** Roof C&C results (if roof info provided) */
  roofResults?: {
    zone1: { positive: number; negative: number };
    zone2: { positive: number; negative: number };
    zone3: { positive: number; negative: number };
  };
  /** Any warnings */
  warnings: string[];
}

// ============================================================
// Main Report Generator
// ============================================================

/**
 * Generate a complete project report with all openings calculated.
 *
 * Per ASCE 7-22 Chapter 30 for low-rise C&C (h ≤ 60 ft), uses qh
 * (velocity pressure at mean roof height) for all openings regardless
 * of floor level. For higher buildings, implementations may adjust
 * the height used for Kz based on floor level.
 *
 * @param input - Project input parameters
 * @returns Complete project report with all calculations and results
 */
export function generateReport(input: ProjectInput): ProjectReport {
  const warnings: string[] = [];

  // Runtime validation — reject NaN/Infinity before any calculation
  const numericFields: Array<[string, number]> = [
    ['ultimateWindSpeed', input.ultimateWindSpeed],
    ['meanRoofHeight', input.meanRoofHeight],
    ['buildingLength', input.buildingLength],
    ['buildingWidth', input.buildingWidth],
  ];
  const invalidFields = numericFields.filter(([, v]) => !Number.isFinite(v));
  if (invalidFields.length > 0) {
    const names = invalidFields.map(([n]) => n).join(', ');
    throw new Error(`Invalid numeric input(s): ${names}. All values must be finite numbers.`);
  }

  // Validate each opening has finite dimensions
  for (const opening of input.openings) {
    if (!Number.isFinite(opening.widthInches) || !Number.isFinite(opening.heightInches) || opening.widthInches <= 0 || opening.heightInches <= 0) {
      throw new Error(`Opening "${opening.markId}" has invalid dimensions. Width and height must be positive numbers.`);
    }
  }

  // Apply defaults
  const riskCategory: RiskCategory = input.riskCategory ?? 2;
  const topographicFactor = input.topographicFactor ?? 1.0;
  const groundElevationFactor = input.groundElevationFactor ?? 1.0;

  let ultimateWindSpeed = input.ultimateWindSpeed;
  let exposureCategory = input.exposureCategory;

  // Auto-detect HVHZ from county — applies overrides even if user forgot checkbox
  const hvhzDetected = isHVHZCounty(input.county);
  if (hvhzDetected && !input.isHVHZ) {
    warnings.push(
      `HVHZ Auto-Detected: ${input.county} is a High-Velocity Hurricane Zone. FBC 2023 overrides have been applied automatically.`
    );
  }

  // Apply HVHZ overrides if detected or manually flagged
  if (input.isHVHZ || hvhzDetected) {
    const hvhzResult = applyHVHZOverrides(
      input.county,
      ultimateWindSpeed,
      exposureCategory,
      riskCategory
    );
    ultimateWindSpeed = hvhzResult.windSpeed;
    exposureCategory = hvhzResult.exposureCategory;
    warnings.push(...hvhzResult.warnings);
  }

  // Kzt advisory warning
  if (topographicFactor > 1.0) {
    warnings.push(
      `Topographic factor Kzt = ${topographicFactor}. Per ASCE 7-22 Section 26.8, Kzt must be calculated using the procedure in Chapter 26 for buildings on hills, ridges, or escarpments. Verify this value per Figure 26.8-1.`
    );
  }

  // Mean roof height hard limit — Chapter 30 Part 1 is only valid for h ≤ 60 ft
  if (input.meanRoofHeight > 60) {
    throw new Error(
      `Mean roof height (${input.meanRoofHeight} ft) exceeds the 60 ft limit for ASCE 7-22 Chapter 30 Part 1 (low-rise C&C). Buildings taller than 60 ft require Part 3 methods and a licensed PE seal. Contact info@oasisengineering.com for a sealed engineering package.`
    );
  }

  // Calculate common factors (once, used for all openings and roof)
  const kzRoof = calculateKz(input.meanRoofHeight, exposureCategory);
  const qh = calculateVelocityPressure(
    kzRoof,
    topographicFactor,
    ultimateWindSpeed,
    KD_COMPONENTS_CLADDING,
    groundElevationFactor
  );
  const zoneEndWidth = calculateZoneEndWidth(
    input.buildingLength,
    input.buildingWidth,
    input.meanRoofHeight
  );

  // Determine GCpi based on enclosure type
  const gcpiPositive = input.enclosureType === 'Enclosed' ? GCPI_ENCLOSED : 0.55;
  const gcpiNegative = input.enclosureType === 'Enclosed' ? -GCPI_ENCLOSED : -0.55;

  // Calculate each opening
  const openingResults: OpeningResult[] = input.openings.map((opening) => {
    // Convert dimensions from inches to feet, compute effective wind area (sq ft)
    const widthFt = opening.widthInches / 12;
    const heightFt = opening.heightInches / 12;
    const effectiveWindArea = widthFt * heightFt;

    // For low-rise C&C (h <= 60 ft), use mean roof height for all openings
    // For taller buildings, this could be adjusted based on floor level
    const heightUsed = input.meanRoofHeight;
    const kz = calculateKz(heightUsed, exposureCategory);

    // Use qh (velocity pressure at mean roof height) per ASCE 7-22 Chapter 30
    const qz = qh;

    // Get GCp from formulas
    const gcpValues = getGCp(effectiveWindArea, opening.zone);
    const gcpPositive = gcpValues.positive;
    const gcpNegative = gcpValues.negative;

    // Calculate design pressures
    // For enclosure type, use GCpi appropriately:
    // Positive: qz * (GCp+ + GCpi)
    // Negative: qz * (GCp- - GCpi)
    const designPressures = calculateDesignPressure(qz, gcpPositive, gcpNegative, gcpiPositive);

    return {
      opening,
      effectiveWindArea: Math.round(effectiveWindArea * 100) / 100,
      heightUsed,
      kz,
      qz,
      gcpPositive,
      gcpNegative,
      designPressurePositive: designPressures.positive,
      designPressureNegative: designPressures.negative,
    };
  });

  // Calculate roof pressures if roof info is provided
  let roofResults: ProjectReport['roofResults'] | undefined;
  if (input.roof) {
    const roofPressures = calculateRoofPressure({
      qh,
      effectiveWindArea: input.roof.effectiveArea,
      roofType: input.roof.roofType,
      enclosureType: input.enclosureType,
    });

    roofResults = {
      zone1: {
        positive: roofPressures.zone1.positive,
        negative: roofPressures.zone1.negative,
      },
      zone2: {
        positive: roofPressures.zone2.positive,
        negative: roofPressures.zone2.negative,
      },
      zone3: {
        positive: roofPressures.zone3.positive,
        negative: roofPressures.zone3.negative,
      },
    };
  }

  // Compile the complete report
  const report: ProjectReport = {
    project: {
      ...input,
      riskCategory,
      topographicFactor,
      groundElevationFactor,
      ultimateWindSpeed,
      exposureCategory,
    },
    calculatedAt: new Date().toISOString(),
    asce7Version: 'ASCE 7-22',
    commonFactors: {
      kd: KD_COMPONENTS_CLADDING,
      ke: groundElevationFactor,
      kzt: topographicFactor,
      gcpiPositive,
      gcpiNegative,
      zoneEndWidth,
      kzRoof,
      qh,
    },
    openingResults,
    roofResults,
    warnings,
  };

  return report;
}
