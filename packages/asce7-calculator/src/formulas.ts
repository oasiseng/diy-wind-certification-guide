// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025 Oasis Engineering — windcalculations.com
// This file is part of @oasis/asce7-calculator.
// Commercial license: info@oasisengineering.com

/**
 * ASCE 7-22 Wind Pressure Formulas
 *
 * Components and Cladding (C&C) for enclosed low-rise buildings.
 * Reference: ASCE/SEI 7-22, Chapter 30, Part 1
 *
 * Key equations:
 *   qh = 0.00256 × Kz × Kzt × Kd × Ke × V²  (Eq. 26.10-1)
 *   p  = qh × [(GCp) - (GCpi)]                 (Eq. 30.3-1)
 *
 * Where:
 *   qh  = velocity pressure at mean roof height (psf)
 *   Kz  = velocity pressure exposure coefficient
 *   Kzt = topographic factor
 *   Kd  = wind directionality factor (0.85 for C&C)
 *   Ke  = ground elevation factor (1.0 at sea level)
 *   V   = basic wind speed, Vult (mph)
 *   GCp = external pressure coefficient (from Figure 30.3-1)
 *   GCpi = internal pressure coefficient (+/-0.18 for enclosed buildings)
 */

import type { ExposureCategory } from './types';

// ============================================================
// Constants per ASCE 7-22
// ============================================================

/** Wind directionality factor for C&C, Table 26.6-1 */
export const KD_COMPONENTS_CLADDING = 0.85;

/** Ground elevation factor at sea level, Table 26.9-1 Note */
export const KE_SEA_LEVEL = 1.0;

/** Internal pressure coefficient for enclosed buildings, Table 26.13-1 */
export const GCPI_ENCLOSED = 0.18;

/**
 * Velocity pressure exposure coefficients (Kz) at various heights
 * per ASCE 7-22 Table 26.10-1
 *
 * Format: { height_ft: { B: Kz, C: Kz, D: Kz } }
 * Heights below 15 ft use the 15 ft value per code.
 */
const KZ_TABLE: Array<{
  height: number;
  B: number;
  C: number;
  D: number;
}> = [
  { height: 0, B: 0.57, C: 0.85, D: 1.03 },
  { height: 15, B: 0.57, C: 0.85, D: 1.03 },
  { height: 20, B: 0.62, C: 0.90, D: 1.08 },
  { height: 25, B: 0.66, C: 0.94, D: 1.12 },
  { height: 30, B: 0.70, C: 0.98, D: 1.16 },
  { height: 40, B: 0.76, C: 1.04, D: 1.22 },
  { height: 50, B: 0.81, C: 1.09, D: 1.27 },
  { height: 60, B: 0.85, C: 1.13, D: 1.31 },
  { height: 70, B: 0.89, C: 1.17, D: 1.34 },
  { height: 80, B: 0.93, C: 1.21, D: 1.38 },
  { height: 90, B: 0.96, C: 1.24, D: 1.40 },
  { height: 100, B: 0.99, C: 1.26, D: 1.43 },
  { height: 120, B: 1.04, C: 1.31, D: 1.48 },
  { height: 140, B: 1.09, C: 1.36, D: 1.52 },
  { height: 160, B: 1.13, C: 1.39, D: 1.55 },
  { height: 180, B: 1.17, C: 1.43, D: 1.58 },
  { height: 200, B: 1.20, C: 1.46, D: 1.61 },
];

/**
 * External pressure coefficients (GCp) for C&C
 * per ASCE 7-22 Figure 30.3-1 (walls, enclosed buildings, h <= 60 ft)
 *
 * These are functions of effective wind area (A) in sq ft.
 * Zone 4 = interior walls, Zone 5 = corners/edges
 *
 * Values are interpolated on log10(A) between 10 and 500 sq ft.
 * Below 10 sq ft, use 10 sq ft values. Above 500 sq ft, use 500 sq ft values.
 */

/** GCp positive (inward) for Zone 4 and Zone 5 walls */
const GCP_POSITIVE_WALL: { area: number; zone4: number; zone5: number }[] = [
  { area: 10, zone4: 1.0, zone5: 1.0 },
  { area: 20, zone4: 1.0, zone5: 1.0 },
  { area: 50, zone4: 0.9, zone5: 0.9 },
  { area: 100, zone4: 0.8, zone5: 0.8 },
  { area: 200, zone4: 0.75, zone5: 0.75 },
  { area: 500, zone4: 0.7, zone5: 0.7 },
];

/** GCp negative (outward/suction) for Zone 4 and Zone 5 walls */
const GCP_NEGATIVE_WALL: { area: number; zone4: number; zone5: number }[] = [
  { area: 10, zone4: -1.1, zone5: -1.4 },
  { area: 20, zone4: -1.1, zone5: -1.4 },
  { area: 50, zone4: -1.0, zone5: -1.3 },
  { area: 100, zone4: -0.95, zone5: -1.2 },
  { area: 200, zone4: -0.9, zone5: -1.1 },
  { area: 500, zone4: -0.85, zone5: -1.0 },
];

// ============================================================
// Core Calculation Functions
// ============================================================

/**
 * Interpolate Kz (velocity pressure exposure coefficient)
 * per ASCE 7-22 Table 26.10-1.
 *
 * For heights between table entries, linear interpolation is used.
 * Heights below 15 ft use the 15 ft value.
 */
export function calculateKz(
  height: number,
  exposure: ExposureCategory
): number {
  // Heights below 15 ft use 15 ft value per ASCE 7
  const h = Math.max(height, 15);

  // Find bracketing entries
  let lower = KZ_TABLE[0];
  let upper = KZ_TABLE[KZ_TABLE.length - 1];

  for (let i = 0; i < KZ_TABLE.length - 1; i++) {
    if (h >= KZ_TABLE[i].height && h <= KZ_TABLE[i + 1].height) {
      lower = KZ_TABLE[i];
      upper = KZ_TABLE[i + 1];
      break;
    }
  }

  // If above table, use highest value
  if (h >= upper.height) {
    return upper[exposure];
  }

  // Linear interpolation
  if (lower.height === upper.height) {
    return lower[exposure];
  }

  const fraction = (h - lower.height) / (upper.height - lower.height);
  const kz = lower[exposure] + fraction * (upper[exposure] - lower[exposure]);

  return Math.round(kz * 100) / 100;
}

/**
 * Calculate velocity pressure at mean roof height (qh)
 * per ASCE 7-22 Equation 26.10-1:
 *
 *   qh = 0.00256 × Kz × Kzt × Kd × Ke × V²
 *
 * @param kz  - Velocity pressure exposure coefficient
 * @param kzt - Topographic factor (default 1.0)
 * @param v   - Ultimate wind speed in mph
 * @param kd  - Directionality factor (default 0.85 for C&C)
 * @param ke  - Ground elevation factor (default 1.0)
 * @returns Velocity pressure in psf
 */
export function calculateVelocityPressure(
  kz: number,
  kzt: number,
  v: number,
  kd: number = KD_COMPONENTS_CLADDING,
  ke: number = KE_SEA_LEVEL
): number {
  const qh = 0.00256 * kz * kzt * kd * ke * v * v;
  return Math.round(qh * 10) / 10;
}

/**
 * Calculate the zone end width 'a' per ASCE 7-22 Section 26.2.
 *
 * a = min(0.1 × least horizontal dimension, 0.4 × h)
 * but not less than either:
 *   - 4% of least horizontal dimension, or
 *   - 3 ft
 *
 * @param buildingLength - Building length in feet
 * @param buildingWidth  - Building width in feet
 * @param meanRoofHeight - Mean roof height in feet
 */
export function calculateZoneEndWidth(
  buildingLength: number,
  buildingWidth: number,
  meanRoofHeight: number
): number {
  const leastDimension = Math.min(buildingLength, buildingWidth);
  const a = Math.min(0.1 * leastDimension, 0.4 * meanRoofHeight);
  const aMin = Math.max(0.04 * leastDimension, 3);
  return Math.round(Math.max(a, aMin) * 10) / 10;
}

/**
 * Interpolate GCp (external pressure coefficient) from the
 * ASCE 7-22 Figure 30.3-1 tables.
 *
 * Interpolation is logarithmic between table entries.
 * Uses natural log (ln) for consistency with roof-formulas.ts.
 * Note: log base does not affect the interpolation result since
 * the fraction ln(A/A1)/ln(A2/A1) = log10(A/A1)/log10(A2/A1).
 */
function interpolateGCp(
  area: number,
  table: { area: number; zone4: number; zone5: number }[],
  zone: 4 | 5
): number {
  const key = zone === 4 ? 'zone4' : 'zone5';

  // Clamp area to table bounds
  const minArea = table[0].area;
  const maxArea = table[table.length - 1].area;
  const clampedArea = Math.max(minArea, Math.min(maxArea, area));

  // Find bracketing entries
  for (let i = 0; i < table.length - 1; i++) {
    if (clampedArea >= table[i].area && clampedArea <= table[i + 1].area) {
      if (table[i].area === table[i + 1].area) return table[i][key];

      // Logarithmic interpolation using natural log
      const logA = Math.log(clampedArea);
      const logA1 = Math.log(table[i].area);
      const logA2 = Math.log(table[i + 1].area);
      const fraction = (logA - logA1) / (logA2 - logA1);

      return table[i][key] + fraction * (table[i + 1][key] - table[i][key]);
    }
  }

  // Fallback to last entry
  return table[table.length - 1][key];
}

/**
 * Get external pressure coefficients (GCp) for a given zone and area.
 *
 * @returns { positive: GCp+, negative: GCp- }
 */
export function getGCp(
  effectiveWindArea: number,
  zone: 4 | 5
): { positive: number; negative: number } {
  return {
    positive: Math.round(interpolateGCp(effectiveWindArea, GCP_POSITIVE_WALL, zone) * 1000) / 1000,
    negative: Math.round(interpolateGCp(effectiveWindArea, GCP_NEGATIVE_WALL, zone) * 1000) / 1000,
  };
}

/**
 * Calculate design wind pressure for C&C per ASCE 7-22 Eq. 30.3-1:
 *
 *   p = qh × [(GCp) - (GCpi)]   (positive pressure, inward)
 *   p = qh × [(GCp) + (GCpi)]   (negative pressure, outward — note: GCp is negative)
 *
 * For design, both ±GCpi load cases should be evaluated and the
 * governing (worst) values reported:
 *   p+ = max[qh × (GCp+ + GCpi), qh × (GCp+ - GCpi)]
 *   p- = min[qh × (GCp- - GCpi), qh × (GCp- + GCpi)]
 *
 * @param qh   - Velocity pressure in psf
 * @param gcpPositive - External positive pressure coefficient
 * @param gcpNegative - External negative pressure coefficient
 * @param gcpi - Internal pressure coefficient magnitude (e.g., 0.18 enclosed, 0.55 partially enclosed)
 * @returns Pressure in psf { positive, negative }
 */
export function calculateDesignPressure(
  qh: number,
  gcpPositive: number,
  gcpNegative: number,
  gcpi: number = GCPI_ENCLOSED
): { positive: number; negative: number } {
  // Evaluate both ±GCpi load cases and keep governing design values.
  const positiveCase1 = qh * (gcpPositive + gcpi);
  const positiveCase2 = qh * (gcpPositive - gcpi);
  const positive = Math.max(positiveCase1, positiveCase2);

  const negativeCase1 = qh * (gcpNegative - gcpi);
  const negativeCase2 = qh * (gcpNegative + gcpi);
  const negative = Math.min(negativeCase1, negativeCase2);

  return {
    positive: Math.round(positive * 10) / 10,
    negative: Math.round(negative * 10) / 10,
  };
}

/**
 * Calculate wind load (force) on a component.
 *
 * F = p × A
 *
 * @param pressure - Design pressure in psf
 * @param area     - Effective wind area in sq ft
 * @returns Force in lbf
 */
export function calculateWindLoad(pressure: number, area: number): number {
  return Math.round(pressure * area * 10) / 10;
}
