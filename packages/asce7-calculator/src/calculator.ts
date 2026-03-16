/**
 * ASCE 7-22 Wind Pressure Calculator
 *
 * Main entry point that composes all formula functions into
 * a complete C&C wind pressure calculation.
 *
 * Usage:
 *   import { calculate, compareProduct } from '@oasis/asce7-calculator';
 *
 *   const result = calculate({
 *     county: 'Broward',
 *     isHVHZ: true,
 *     ultimateWindSpeed: 170,
 *     exposureCategory: 'C',
 *     meanRoofHeight: 12,
 *     buildingLength: 50,
 *     buildingWidth: 50,
 *     effectiveWindArea: 20,
 *   });
 */

import type {
  CalculatorInput,
  CalculatorOutput,
  ProductRating,
  ProductComparison,
  ZonePressure,
} from './types';

import {
  calculateKz,
  calculateVelocityPressure,
  calculateZoneEndWidth,
  getGCp,
  calculateDesignPressure,
  calculateWindLoad,
  KD_COMPONENTS_CLADDING,
  KE_SEA_LEVEL,
} from './formulas';

import { applyHVHZOverrides } from './hvhz-overrides';
import { validateInput } from './validations';

/**
 * Perform a complete ASCE 7-22 C&C wind pressure calculation.
 *
 * @param input - All required calculation parameters
 * @returns Complete calculation output with zone pressures, loads, and warnings
 * @throws Error if input validation fails
 */
export function calculate(input: CalculatorInput): CalculatorOutput {
  // 1. Validate inputs
  const errors = validateInput(input);
  if (errors.length > 0) {
    const messages = errors.map((e) => `${e.field}: ${e.message}`).join('; ');
    throw new Error(`Invalid input: ${messages}`);
  }

  const warnings: string[] = [];
  const riskCategory = input.riskCategory ?? 2;
  const kzt = input.topographicFactor ?? 1.0;

  // 2. Apply HVHZ overrides if applicable
  let windSpeed = input.ultimateWindSpeed;
  let exposure = input.exposureCategory;

  if (input.isHVHZ) {
    const overrides = applyHVHZOverrides(
      input.county,
      windSpeed,
      exposure,
      riskCategory
    );
    windSpeed = overrides.windSpeed;
    exposure = overrides.exposureCategory;
    warnings.push(...overrides.warnings);
  }

  // 3. Calculate exposure coefficient (Kz)
  const kz = calculateKz(input.meanRoofHeight, exposure);

  // 4. Calculate velocity pressure (qh)
  const qh = calculateVelocityPressure(kz, kzt, windSpeed);

  // 5. Calculate zone end width (a)
  const zoneEndWidth = calculateZoneEndWidth(
    input.buildingLength,
    input.buildingWidth,
    input.meanRoofHeight
  );

  // 6. Get external pressure coefficients for each zone
  const gcpZone4 = getGCp(input.effectiveWindArea, 4);
  const gcpZone5 = getGCp(input.effectiveWindArea, 5);

  // 7. Calculate design pressures
  const pressureZone4 = calculateDesignPressure(qh, gcpZone4.positive, gcpZone4.negative);
  const pressureZone5 = calculateDesignPressure(qh, gcpZone5.positive, gcpZone5.negative);

  // 8. Calculate wind loads (force)
  const area = input.effectiveWindArea;

  const zone4: ZonePressure = {
    positive: pressureZone4.positive,
    negative: pressureZone4.negative,
    loads: {
      positive: calculateWindLoad(pressureZone4.positive, area),
      negative: calculateWindLoad(pressureZone4.negative, area),
    },
  };

  const zone5: ZonePressure = {
    positive: pressureZone5.positive,
    negative: pressureZone5.negative,
    loads: {
      positive: calculateWindLoad(pressureZone5.positive, area),
      negative: calculateWindLoad(pressureZone5.negative, area),
    },
  };

  // 9. Determine critical pressures (worst case across zones)
  const criticalPressure = {
    positive: Math.max(zone4.positive, zone5.positive),
    negative: Math.min(zone4.negative, zone5.negative), // Most negative = most severe suction
  };

  // 10. Add advisory warnings
  if (windSpeed >= 170) {
    warnings.push(
      `High wind speed region (${windSpeed} mph). Ensure all products are rated for hurricane-force winds.`
    );
  }

  if (Math.abs(criticalPressure.negative) > 80) {
    warnings.push(
      `High suction pressure (${criticalPressure.negative} psf). Zone 5 (corners) is the governing case. Verify product ratings carefully.`
    );
  }

  return {
    input: { ...input, topographicFactor: kzt, riskCategory },
    intermediate: {
      zoneEndWidth,
      velocityPressure: qh,
      exposureCoefficient: kz,
      directionalityFactor: KD_COMPONENTS_CLADDING,
      groundElevationFactor: KE_SEA_LEVEL,
    },
    zone4,
    zone5,
    criticalPressure,
    asce7Version: '7-22',
    floridaBuildingCodeVersion: '2023',
    calculatedAt: new Date().toISOString(),
    warnings,
  };
}

/**
 * Compare a product's rated pressures against calculated requirements.
 *
 * @param calcOutput - Result from calculate()
 * @param product    - Product pressure ratings
 * @returns Detailed comparison with pass/fail for each zone
 */
export function compareProduct(
  calcOutput: CalculatorOutput,
  product: ProductRating
): ProductComparison {
  const warnings: string[] = [];

  // Zone 4 comparison
  const z4PosPass = product.ratedPositive >= calcOutput.zone4.positive;
  const z4NegPass = product.ratedNegative >= Math.abs(calcOutput.zone4.negative);

  // Zone 5 comparison (governing case)
  const z5PosPass = product.ratedPositive >= calcOutput.zone5.positive;
  const z5NegPass = product.ratedNegative >= Math.abs(calcOutput.zone5.negative);

  const overallPass = z4PosPass && z4NegPass && z5PosPass && z5NegPass;

  // Calculate margins
  const marginPositive =
    product.ratedPositive - calcOutput.criticalPressure.positive;
  const marginNegative =
    product.ratedNegative - Math.abs(calcOutput.criticalPressure.negative);

  // Warnings
  if (!overallPass) {
    if (!z5NegPass) {
      warnings.push(
        `FAIL: Product suction rating (${product.ratedNegative} psf) does not meet Zone 5 requirement (${Math.abs(calcOutput.zone5.negative)} psf). Zone 5 (corners/edges) is the most critical location.`
      );
    }
    if (!z5PosPass) {
      warnings.push(
        `FAIL: Product positive rating (${product.ratedPositive} psf) does not meet Zone 5 requirement (${calcOutput.zone5.positive} psf).`
      );
    }
    if (z5PosPass && z5NegPass && (!z4PosPass || !z4NegPass)) {
      warnings.push(
        `FAIL: Product passes Zone 5 but fails Zone 4. This is unusual — verify product ratings.`
      );
    }
  } else {
    warnings.push(
      `PASS: Product meets all required wind pressures. Margin: +${marginPositive.toFixed(1)} psf (positive), +${marginNegative.toFixed(1)} psf (negative).`
    );
  }

  // HVHZ warning
  if (calcOutput.input.isHVHZ && !product.isHVHZApproved) {
    warnings.push(
      `WARNING: This location is in an HVHZ. Product may require a Miami-Dade NOA (Notice of Acceptance) in addition to Florida Product Approval.`
    );
  }

  return {
    product,
    requiredPressure: {
      positive: calcOutput.criticalPressure.positive,
      negative: Math.abs(calcOutput.criticalPressure.negative),
    },
    zone4: {
      positivePass: z4PosPass,
      negativePass: z4NegPass,
    },
    zone5: {
      positivePass: z5PosPass,
      negativePass: z5NegPass,
    },
    overallPass,
    margin: {
      positive: Math.round(marginPositive * 10) / 10,
      negative: Math.round(marginNegative * 10) / 10,
    },
    warnings,
  };
}
