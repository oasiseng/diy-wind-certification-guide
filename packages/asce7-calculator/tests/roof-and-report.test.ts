import { describe, it, expect } from 'vitest';
import {
  getRoofGCp,
  calculateRoofPressure,
  calculateKz,
  calculateVelocityPressure,
  calculateZoneEndWidth,
  generateReport,
} from '../src/index';

// ============================================================
// HAND-VERIFIED REFERENCE CALCULATIONS
//
// All expected values are hand-computed step-by-step using
// ASCE 7-22 equations and table values.
// ============================================================

describe('Roof C&C Calculator — ASCE 7-22 Accuracy', () => {
  // ----- GCp Table Value Verification -----
  describe('GCp Table Values (boundary checks)', () => {
    it('Flat roof Zone 1 at 10 sq ft = -1.3 (ASCE 7-22 Fig 30.3-2A)', () => {
      const gcp = getRoofGCp(10, 1, 'Flat');
      expect(gcp.negative).toBe(-1.3);
    });

    it('Flat roof Zone 3 at 10 sq ft = -3.2 (ASCE 7-22 Fig 30.3-2A)', () => {
      const gcp = getRoofGCp(10, 3, 'Flat');
      expect(gcp.negative).toBe(-3.2);
    });

    it('Flat roof Zone 2 at 500 sq ft = -1.5 (ASCE 7-22 Fig 30.3-2A)', () => {
      const gcp = getRoofGCp(500, 2, 'Flat');
      expect(gcp.negative).toBe(-1.5);
    });

    it('Gable 27-45° positive GCp = 0.8 (all zones)', () => {
      const gcp = getRoofGCp(10, 1, 'Gable 27-45°');
      expect(gcp.positive).toBe(0.8);
    });

    it('Hip 20-27° Zone 3 at 10 sq ft = -2.9', () => {
      const gcp = getRoofGCp(10, 3, 'Hip 20-27°');
      expect(gcp.negative).toBe(-2.9);
    });

    it('Monoslope 10-30° Zone 3 at 10 sq ft = -3.8', () => {
      const gcp = getRoofGCp(10, 3, 'Monoslope 10-30°');
      expect(gcp.negative).toBe(-3.8);
    });

    it('Areas below 10 sq ft clamp to 10 sq ft value', () => {
      const gcp5 = getRoofGCp(5, 2, 'Flat');
      const gcp10 = getRoofGCp(10, 2, 'Flat');
      expect(gcp5.negative).toBe(gcp10.negative);
      expect(gcp10.negative).toBe(-2.3); // ASCE 7-22 Zone 2
    });

    it('Areas above 500 sq ft clamp to 500 sq ft value', () => {
      const gcp800 = getRoofGCp(800, 1, 'Flat');
      const gcp500 = getRoofGCp(500, 1, 'Flat');
      expect(gcp800.negative).toBe(gcp500.negative);
      expect(gcp500.negative).toBe(-0.9); // ASCE 7-22 Zone 1
    });
  });

  // ----- Logarithmic Interpolation Verification -----
  describe('GCp Logarithmic Interpolation', () => {
    it('Flat Zone 1: interpolation at 100 sq ft (ASCE 7-22)', () => {
      // Manual: y = -1.3 + (-0.9 - (-1.3)) * (ln(100) - ln(10)) / (ln(500) - ln(10))
      // = -1.3 + 0.4 * (4.6052 - 2.3026) / (6.2146 - 2.3026)
      // = -1.3 + 0.4 * (2.3026 / 3.9120)
      // = -1.3 + 0.4 * 0.5886 = -1.3 + 0.2354 = -1.0646
      const gcp = getRoofGCp(100, 1, 'Flat');
      expect(gcp.negative).toBeCloseTo(-1.065, 1);
    });

    it('Flat Zone 3: interpolation at 50 sq ft (ASCE 7-22)', () => {
      // y = -3.2 + (-2.2 - (-3.2)) * (ln(50) - ln(10)) / (ln(500) - ln(10))
      // = -3.2 + 1.0 * (3.9120 - 2.3026) / (6.2146 - 2.3026)
      // = -3.2 + 1.0 * (1.6094 / 3.9120)
      // = -3.2 + 0.4114 = -2.7886
      const gcp = getRoofGCp(50, 3, 'Flat');
      expect(gcp.negative).toBeCloseTo(-2.789, 1);
    });
  });

  // ----- Full Roof Pressure Calculation -----
  describe('Full Roof Pressure — Hand Verification', () => {
    /**
     * REFERENCE CASE 1: Flat roof, Tampa area (ASCE 7-22 updated values)
     * V = 155 mph, Exposure C, h = 15 ft, Enclosed
     *
     * Step-by-step:
     *   Kz at 15 ft, Exp C = 0.85 (Table 26.10-1)
     *   qh = 0.00256 × 0.85 × 1.0 × 0.85 × 1.0 × 155² = 44.4 psf
     *   GCpi = ±0.18
     *
     * Flat roof (ASCE 7-22 Fig 30.3-2A), 10 sq ft area:
     *   Zone 1: GCp- = -1.3, GCp+ = 0.3
     *     p+ = max(44.4*(0.3+0.18), 44.4*(0.3-0.18)) = max(21.3, 5.3) = 21.3 psf
     *     p- = min(44.4*(-1.3-0.18), 44.4*(-1.3+0.18)) = min(-65.7, -49.7) = -65.7 psf
     *   Zone 2: GCp- = -2.3
     *     p- = min(44.4*(-2.3-0.18), 44.4*(-2.3+0.18)) = min(-110.1, -94.1) = -110.1 psf
     *   Zone 3: GCp- = -3.2
     *     p- = min(44.4*(-3.2-0.18), 44.4*(-3.2+0.18)) = min(-150.1, -134.1) = -150.1 psf
     */
    it('Reference Case 1: Flat roof, Tampa, 155 mph, Exp C (ASCE 7-22)', () => {
      const kz = calculateKz(15, 'C');
      expect(kz).toBe(0.85);
      const qh = calculateVelocityPressure(0.85, 1.0, 155);
      expect(qh).toBeCloseTo(44.4, 0);

      const result = calculateRoofPressure({
        qh,
        effectiveWindArea: 10,
        roofType: 'Flat',
        enclosureType: 'Enclosed',
      });

      // Zone 1: p- = 44.4 * (-1.3 - 0.18) = -65.7
      expect(result.zone1.positive).toBeCloseTo(21.3, 0);
      expect(result.zone1.negative).toBeCloseTo(-65.7, 0);

      // Zone 2: p- = 44.4 * (-2.3 - 0.18) = -110.1
      expect(result.zone2.positive).toBeCloseTo(21.3, 0);
      expect(result.zone2.negative).toBeCloseTo(-110.1, 0);

      // Zone 3: p- = 44.4 * (-3.2 - 0.18) = -150.1
      expect(result.zone3.positive).toBeCloseTo(21.3, 0);
      expect(result.zone3.negative).toBeCloseTo(-150.1, 0);
    });

    /**
     * REFERENCE CASE 2: Gable 7-20° roof, Miami-Dade
     * V = 175 mph, Exposure C, h = 12 ft, Enclosed
     *
     * Kz at 12 ft → use 15 ft min → 0.85 (Exp C)
     * qh = 0.00256 × 0.85 × 1.0 × 0.85 × 1.0 × 175² = 56.6 psf
     *
     * Gable 7-20°, 10 sq ft:
     *   Zone 1: GCp- = -1.2, GCp+ = 0.3
     *     p+ = 56.6*(0.3+0.18) = 27.2 psf
     *     p- = 56.6*(-1.2-0.18) = -78.1 psf
     *   Zone 2: GCp- = -2.0
     *     p- = 56.6*(-2.0-0.18) = -123.4 psf
     *   Zone 3: GCp- = -2.8
     *     p- = 56.6*(-2.8-0.18) = -168.7 psf
     */
    it('Reference Case 2: Gable 7-20°, Miami, 175 mph, Exp C', () => {
      const kz = calculateKz(12, 'C');
      expect(kz).toBe(0.85);
      const qh = calculateVelocityPressure(0.85, 1.0, 175);
      expect(qh).toBeCloseTo(56.6, 0);

      const result = calculateRoofPressure({
        qh,
        effectiveWindArea: 10,
        roofType: 'Gable 7-20°',
        enclosureType: 'Enclosed',
      });

      expect(result.zone1.positive).toBeCloseTo(27.2, 0);
      expect(result.zone1.negative).toBeCloseTo(-78.1, 0);
      expect(result.zone2.negative).toBeCloseTo(-123.4, 0);
      expect(result.zone3.negative).toBeCloseTo(-168.7, 0);
    });
  });
});

describe('Report Generator — Full Project', () => {
  /**
   * REFERENCE PROJECT: Fort Lauderdale commercial building
   * V = 175 mph (HVHZ, Broward), Exposure C, h = 20 ft
   * Building: 60×40 ft, Enclosed
   * Risk Cat II
   *
   * Common factors:
   *   Kz at 20 ft, Exp C = 0.90 (Table 26.10-1)
   *   qh = 0.00256 × 0.90 × 1.0 × 0.85 × 1.0 × 175² = 59.9 psf
   *   a = min(0.1×40, 0.4×20) = min(4, 8) = 4 ft
   *   GCpi = ±0.18
   *
   * Opening W-1: 36"×60" window, Zone 4
   *   Area = (36/12)*(60/12) = 3*5 = 15 sq ft
   *   GCp Zone 4 at 15 sq ft: positive ≈ 1.0, negative ≈ -1.1
   *   p+ = 59.9*(1.0 + 0.18) = 70.7 psf
   *   p- = 59.9*(-1.1 - 0.18) = -76.7 psf
   *
   * Opening D-1: 36"×84" door, Zone 5
   *   Area = (36/12)*(84/12) = 3*7 = 21 sq ft
   *   GCp Zone 5 at 21 sq ft: positive ≈ 1.0, negative ≈ -1.4
   *   p+ = 59.9*(1.0 + 0.18) = 70.7 psf
   *   p- = 59.9*(-1.4 - 0.18) = -94.6 psf
   */
  it('generates correct report for Fort Lauderdale project', () => {
    const report = generateReport({
      projectName: 'Test Commercial Building',
      address: '500 E Las Olas Blvd, Fort Lauderdale, FL 33301',
      state: 'FL',
      county: 'Broward',
      isHVHZ: true,
      ultimateWindSpeed: 175,
      exposureCategory: 'C',
      meanRoofHeight: 20,
      buildingLength: 60,
      buildingWidth: 40,
      enclosureType: 'Enclosed',
      openings: [
        {
          markId: 'W-1',
          type: 'Window',
          widthInches: 36,
          heightInches: 60,
          floorLevel: 1,
          zone: 4,
        },
        {
          markId: 'D-1',
          type: 'Door',
          widthInches: 36,
          heightInches: 84,
          floorLevel: 1,
          zone: 5,
        },
      ],
      roof: {
        roofType: 'Flat',
        effectiveArea: 10,
      },
    });

    // Verify common factors
    expect(report.commonFactors.kd).toBe(0.85);
    expect(report.commonFactors.kzRoof).toBe(0.90);
    expect(report.commonFactors.kzt).toBe(1.0);
    expect(report.commonFactors.ke).toBe(1.0);
    expect(report.commonFactors.zoneEndWidth).toBe(4.0);
    expect(report.commonFactors.qh).toBeCloseTo(59.9, 0);

    // Verify opening W-1
    const w1 = report.openingResults.find(r => r.opening.markId === 'W-1')!;
    expect(w1).toBeTruthy();
    expect(w1.effectiveWindArea).toBeCloseTo(15, 0);
    expect(w1.designPressurePositive).toBeGreaterThan(60);
    expect(w1.designPressurePositive).toBeLessThan(80);

    // Verify opening D-1 (Zone 5 should have higher suction)
    const d1 = report.openingResults.find(r => r.opening.markId === 'D-1')!;
    expect(d1).toBeTruthy();
    expect(d1.effectiveWindArea).toBeCloseTo(21, 0);
    expect(d1.designPressureNegative).toBeLessThan(w1.designPressureNegative);

    // Verify roof results exist
    expect(report.roofResults).toBeTruthy();
    expect(report.roofResults!.zone3.negative).toBeLessThan(report.roofResults!.zone1.negative);

    // Verify HVHZ warnings
    expect(report.warnings.some(w => w.includes('HVHZ'))).toBe(true);

    // Verify metadata
    expect(report.asce7Version).toBe('ASCE 7-22');
    expect(report.calculatedAt).toBeTruthy();
  });

  it('handles project without roof info', () => {
    const report = generateReport({
      projectName: 'Windows Only',
      address: '123 Main St, Orlando, FL',
      state: 'FL',
      county: 'Orange',
      isHVHZ: false,
      ultimateWindSpeed: 150,
      exposureCategory: 'C',
      meanRoofHeight: 15,
      buildingLength: 40,
      buildingWidth: 30,
      enclosureType: 'Enclosed',
      openings: [
        {
          markId: 'W-1',
          type: 'Window',
          widthInches: 48,
          heightInches: 48,
          floorLevel: 1,
          zone: 4,
        },
      ],
    });

    expect(report.openingResults).toHaveLength(1);
    expect(report.roofResults).toBeUndefined();
  });

  it('handles partially enclosed building (GCpi = ±0.55)', () => {
    const reportEnclosed = generateReport({
      projectName: 'Enclosed Test',
      address: '123 Test St',
      state: 'FL',
      county: 'Orange',
      isHVHZ: false,
      ultimateWindSpeed: 150,
      exposureCategory: 'C',
      meanRoofHeight: 15,
      buildingLength: 40,
      buildingWidth: 30,
      enclosureType: 'Enclosed',
      openings: [{ markId: 'W-1', type: 'Window', widthInches: 36, heightInches: 60, floorLevel: 1, zone: 4 }],
    });

    const reportPartial = generateReport({
      projectName: 'Partial Test',
      address: '123 Test St',
      state: 'FL',
      county: 'Orange',
      isHVHZ: false,
      ultimateWindSpeed: 150,
      exposureCategory: 'C',
      meanRoofHeight: 15,
      buildingLength: 40,
      buildingWidth: 30,
      enclosureType: 'Partially Enclosed',
      openings: [{ markId: 'W-1', type: 'Window', widthInches: 36, heightInches: 60, floorLevel: 1, zone: 4 }],
    });

    // Partially enclosed should have higher pressures (GCpi = 0.55 vs 0.18)
    expect(reportPartial.openingResults[0].designPressurePositive)
      .toBeGreaterThan(reportEnclosed.openingResults[0].designPressurePositive);
    expect(reportPartial.openingResults[0].designPressureNegative)
      .toBeLessThan(reportEnclosed.openingResults[0].designPressureNegative);
  });
});

describe('Wall C&C — Hand-Computed Reference Values', () => {
  /**
   * REFERENCE CASE: Known calculation verification
   * V = 150 mph, Exposure C, h = 15 ft
   * Kz = 0.85, Kd = 0.85, Kzt = 1.0, Ke = 1.0
   * qh = 0.00256 × 0.85 × 1.0 × 0.85 × 1.0 × 150² = 41.6 psf
   *
   * For 20 sq ft effective area:
   *   Zone 4: GCp+ = 1.0, GCp- = -1.1, GCpi = 0.18
   *     p+ = 41.6*(1.0+0.18) = 49.1 psf
   *     p- = 41.6*(-1.1-0.18) = -53.2 psf
   *   Zone 5: GCp+ = 1.0, GCp- = -1.4
   *     p+ = 41.6*(1.0+0.18) = 49.1 psf
   *     p- = 41.6*(-1.4-0.18) = -65.7 psf
   */
  it('Hand-computed: 150 mph, Exp C, 15 ft, 20 sq ft area', () => {
    const kz = calculateKz(15, 'C');
    expect(kz).toBe(0.85);

    const qh = calculateVelocityPressure(0.85, 1.0, 150);
    // 0.00256 * 0.85 * 0.85 * 22500 = 41.6
    expect(qh).toBeCloseTo(41.6, 0);
  });

  it('Zone end width for 60×40 building, 20 ft height', () => {
    // a = min(0.1*40, 0.4*20) = min(4, 8) = 4 ft
    // aMin = max(0.04*40, 3) = max(1.6, 3) = 3 ft
    // result = max(4, 3) = 4 ft
    const a = calculateZoneEndWidth(60, 40, 20);
    expect(a).toBe(4.0);
  });

  it('Zone end width minimum 3 ft enforcement', () => {
    // Small building: 20×15, h=10
    // a = min(0.1*15, 0.4*10) = min(1.5, 4) = 1.5
    // aMin = max(0.04*15, 3) = max(0.6, 3) = 3
    // result = max(1.5, 3) = 3 ft
    const a = calculateZoneEndWidth(20, 15, 10);
    expect(a).toBe(3.0);
  });
});
