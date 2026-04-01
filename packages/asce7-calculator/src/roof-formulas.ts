// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025 Oasis Engineering — windcalculations.com
// This file is part of @oasis/asce7-calculator.
// Commercial license: info@oasisengineering.com

/**
 * ASCE 7-22 Roof Components & Cladding (C&C) Wind Pressure Formulas
 *
 * External pressure coefficients (GCp) for sloped and flat roof surfaces.
 * Reference: ASCE/SEI 7-22, Chapter 30, Part 2, Figures 30.3-2A through 30.3-2I
 *
 * Key equations:
 *   p = qh × [(GCp) - (±GCpi)]                    (Eq. 30.4-1)
 *
 * Where:
 *   qh  = velocity pressure at mean roof height (psf)
 *   GCp = external pressure coefficient (from Figure 30.3-2)
 *   GCpi = internal pressure coefficient (±0.18 for enclosed, ±0.55 for partially enclosed)
 *
 * CRITICAL: GCp values from ASCE 7-22 figures are COMBINED coefficients
 * (gust factor already embedded). Do NOT apply a separate G factor.
 */

/** Roof zone types per ASCE 7-22 roof pressure figures */
export type RoofZone = 1 | 2 | 3;

/** Roof types supported by ASCE 7-22 Figures 30.3-2A through 30.3-2I */
export type RoofType =
  | 'Flat'
  | 'Gable ≤7°'
  | 'Gable 7-20°'
  | 'Gable 20-27°'
  | 'Gable 27-45°'
  | 'Hip 7-20°'
  | 'Hip 20-27°'
  | 'Monoslope ≤3°'
  | 'Monoslope 3-10°'
  | 'Monoslope 10-30°';

// ============================================================
// GCp Data Tables from ASCE 7-22 Figures 30.3-2A–30.3-2I
// ============================================================

/**
 * Negative GCp coefficients for different roof types and zones.
 * Format: { roofType: { zone: { area10: number, area500: number } } }
 *
 * These values are extracted from ASCE 7-22 Figures 30.3-2A through 30.3-2I.
 * Interpolation is logarithmic between 10 and 500 sq ft.
 */
/**
 * ASCE 7-22 Figures 30.3-2A through 30.3-2I
 *
 * IMPORTANT: These values reflect the ASCE 7-16/7-22 updates which
 * significantly increased uplift coefficients for flat and low-slope
 * roofs compared to ASCE 7-10. The flat roof Zone 3 corner value
 * increased from -2.8 to -3.2 at 10 sq ft, and similar increases
 * apply across other zones and roof types.
 *
 * All values below are read directly from ASCE 7-22 figures.
 */
const GCP_NEGATIVE_ROOF: Record<RoofType, Record<RoofZone, { area10: number; area500: number }>> = {
  // Figure 30.3-2A: Flat roofs (θ ≤ 5°)
  'Flat': {
    1: { area10: -1.3, area500: -0.9 },
    2: { area10: -2.3, area500: -1.5 },
    3: { area10: -3.2, area500: -2.2 },
  },
  // Figure 30.3-2B: Gable roofs θ ≤ 7° (treated same as flat per ASCE 7-22)
  'Gable ≤7°': {
    1: { area10: -1.3, area500: -0.9 },
    2: { area10: -2.3, area500: -1.5 },
    3: { area10: -3.2, area500: -2.2 },
  },
  // Figure 30.3-2C: Gable roofs 7° < θ ≤ 20°
  'Gable 7-20°': {
    1: { area10: -1.2, area500: -0.8 },
    2: { area10: -2.0, area500: -1.3 },
    3: { area10: -2.8, area500: -1.9 },
  },
  // Figure 30.3-2D: Gable roofs 20° < θ ≤ 27°
  'Gable 20-27°': {
    1: { area10: -1.3, area500: -0.9 },
    2: { area10: -2.2, area500: -1.5 },
    3: { area10: -3.2, area500: -2.2 },
  },
  // Figure 30.3-2E: Gable roofs 27° < θ ≤ 45°
  'Gable 27-45°': {
    1: { area10: -1.0, area500: -0.7 },
    2: { area10: -2.3, area500: -1.5 },
    3: { area10: -3.2, area500: -2.2 },
  },
  // Figure 30.3-2F: Hip roofs 7° < θ ≤ 20°
  'Hip 7-20°': {
    1: { area10: -1.2, area500: -0.8 },
    2: { area10: -1.8, area500: -1.2 },
    3: { area10: -2.5, area500: -1.7 },
  },
  // Figure 30.3-2G: Hip roofs 20° < θ ≤ 27°
  'Hip 20-27°': {
    1: { area10: -1.5, area500: -1.0 },
    2: { area10: -2.2, area500: -1.5 },
    3: { area10: -2.9, area500: -2.0 },
  },
  // Figure 30.3-2H: Monoslope roofs θ ≤ 3°
  'Monoslope ≤3°': {
    1: { area10: -1.3, area500: -0.9 },
    2: { area10: -2.3, area500: -1.5 },
    3: { area10: -3.2, area500: -2.2 },
  },
  // Figure 30.3-2H: Monoslope roofs 3° < θ ≤ 10°
  'Monoslope 3-10°': {
    1: { area10: -1.5, area500: -1.0 },
    2: { area10: -2.5, area500: -1.7 },
    3: { area10: -3.5, area500: -2.4 },
  },
  // Figure 30.3-2I: Monoslope roofs 10° < θ ≤ 30°
  'Monoslope 10-30°': {
    1: { area10: -1.7, area500: -1.1 },
    2: { area10: -2.7, area500: -1.8 },
    3: { area10: -3.8, area500: -2.6 },
  },
};

/**
 * Positive GCp coefficients for different roof types.
 * Format: { roofType: number }
 *
 * Positive GCp values are uniform across zones and NOT area-dependent.
 * These values are extracted from ASCE 7-22 Figures 30.3-2A through 30.3-2I.
 */
const GCP_POSITIVE_ROOF: Record<RoofType, number> = {
  'Flat': 0.3,
  'Gable ≤7°': 0.3,
  'Gable 7-20°': 0.3,
  'Gable 20-27°': 0.3,
  'Gable 27-45°': 0.8,
  'Hip 7-20°': 0.3,
  'Hip 20-27°': 0.5,
  'Monoslope ≤3°': 0.3,
  'Monoslope 3-10°': 0.4,
  'Monoslope 10-30°': 0.5,
};

/** Internal pressure coefficient for enclosed buildings, Table 26.13-1 */
const GCPI_ENCLOSED = 0.18;

/** Internal pressure coefficient for partially enclosed buildings, Table 26.13-1 */
const GCPI_PARTIALLY_ENCLOSED = 0.55;

// ============================================================
// Interpolation Helper
// ============================================================

/**
 * Interpolate GCp using logarithmic interpolation between 10 and 500 sq ft.
 *
 * Per ASCE 7-22, interpolation uses natural log:
 *   y = y1 + (y2 - y1) * (ln(A) - ln(10)) / (ln(500) - ln(10))
 *
 * Areas ≤ 10 sq ft use the 10 sq ft value.
 * Areas ≥ 500 sq ft use the 500 sq ft value.
 *
 * @param area    - Effective wind area in sq ft
 * @param val10   - GCp value at 10 sq ft
 * @param val500  - GCp value at 500 sq ft
 * @returns Interpolated GCp value
 */
function interpolateGCpLogarithmic(area: number, val10: number, val500: number): number {
  // Clamp to table bounds
  if (area <= 10) return val10;
  if (area >= 500) return val500;

  // Logarithmic interpolation using natural log
  const ln10 = Math.log(10);
  const ln500 = Math.log(500);
  const lnA = Math.log(area);

  const fraction = (lnA - ln10) / (ln500 - ln10);
  return val10 + (val500 - val10) * fraction;
}

// ============================================================
// Core Calculation Functions
// ============================================================

/**
 * Get roof GCp coefficients for a given zone, effective area, and roof type.
 *
 * Returns both positive and negative GCp values. Negative values are interpolated
 * logarithmically between 10 and 500 sq ft. Positive values are constant (not
 * area-dependent) per ASCE 7-22.
 *
 * @param effectiveWindArea - Effective wind area in sq ft
 * @param zone              - Roof zone (1, 2, or 3)
 * @param roofType          - Roof type (e.g., "Flat", "Gable 20-27°")
 * @returns { positive: GCp+, negative: GCp- }
 * @throws Error if roof type is not supported
 */
export function getRoofGCp(
  effectiveWindArea: number,
  zone: RoofZone,
  roofType: RoofType
): { positive: number; negative: number } {
  // Validate roof type
  if (!GCP_NEGATIVE_ROOF[roofType]) {
    throw new Error(`Unsupported roof type: ${roofType}`);
  }

  // Get positive GCp (constant, not area-dependent)
  const positive = GCP_POSITIVE_ROOF[roofType];

  // Interpolate negative GCp logarithmically
  const negData = GCP_NEGATIVE_ROOF[roofType][zone];
  const negative = interpolateGCpLogarithmic(effectiveWindArea, negData.area10, negData.area500);

  return {
    positive: Math.round(positive * 1000) / 1000,
    negative: Math.round(negative * 1000) / 1000,
  };
}

/**
 * Calculate design wind pressure for roof C&C per ASCE 7-22 Eq. 30.4-1:
 *
 *   p = qh × [(GCp) − (±GCpi)]
 *
 * Computes both load cases (+GCpi and −GCpi) and returns the worst case:
 *   - Positive pressure: max of qh*(GCp+ + GCpi), qh*(GCp+ - GCpi)
 *   - Negative pressure: min of qh*(GCp- - GCpi), qh*(GCp- + GCpi)
 *
 * @param params.qh                 - Velocity pressure at mean roof height (psf)
 * @param params.effectiveWindArea  - Effective wind area in sq ft
 * @param params.roofType           - Roof type (e.g., "Flat", "Gable 20-27°")
 * @param params.enclosureType      - "Enclosed" or "Partially Enclosed"
 * @returns Pressures for zones 1, 2, 3 with positive and negative values (psf)
 */
export function calculateRoofPressure(params: {
  qh: number;
  effectiveWindArea: number;
  roofType: RoofType;
  enclosureType: 'Enclosed' | 'Partially Enclosed';
}): {
  zone1: { positive: number; negative: number };
  zone2: { positive: number; negative: number };
  zone3: { positive: number; negative: number };
} {
  const { qh, effectiveWindArea, roofType, enclosureType } = params;

  // Select GCpi based on enclosure type
  const gcpi = enclosureType === 'Enclosed' ? GCPI_ENCLOSED : GCPI_PARTIALLY_ENCLOSED;

  // Calculate pressures for each zone
  const zones: { zone1: RoofZone; zone2: RoofZone; zone3: RoofZone } = {
    zone1: 1,
    zone2: 2,
    zone3: 3,
  };

  const result: Record<
    'zone1' | 'zone2' | 'zone3',
    { positive: number; negative: number }
  > = {
    zone1: { positive: 0, negative: 0 },
    zone2: { positive: 0, negative: 0 },
    zone3: { positive: 0, negative: 0 },
  };

  Object.entries(zones).forEach(([zoneKey, zone]) => {
    const { positive: gcpPos, negative: gcpNeg } = getRoofGCp(
      effectiveWindArea,
      zone,
      roofType
    );

    // For positive pressure, take worst case:
    //   p+ = max(qh*(GCp+ + GCpi), qh*(GCp+ - GCpi))
    const posPressure1 = qh * (gcpPos + gcpi);
    const posPressure2 = qh * (gcpPos - gcpi);
    const positivePressure = Math.max(posPressure1, posPressure2);

    // For negative pressure, take worst case:
    //   p- = min(qh*(GCp- - GCpi), qh*(GCp- + GCpi))
    const negPressure1 = qh * (gcpNeg - gcpi);
    const negPressure2 = qh * (gcpNeg + gcpi);
    const negativePressure = Math.min(negPressure1, negPressure2);

    result[zoneKey as 'zone1' | 'zone2' | 'zone3'] = {
      positive: Math.round(positivePressure * 10) / 10,
      negative: Math.round(negativePressure * 10) / 10,
    };
  });

  return result;
}
