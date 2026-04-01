import { describe, it, expect } from 'vitest';
import {
  calculate,
  compareProduct,
  calculateKz,
  calculateVelocityPressure,
  calculateZoneEndWidth,
  getGCp,
  calculateDesignPressure,
  calculateWindLoad,
  applyHVHZOverrides,
  isHVHZCounty,
  validateInput,
} from '../src/index';

// ============================================================
// Known Example: Fort Lauderdale, FL (from repo docs)
//
// Input:
//   Address: 123 Palm Ave, Fort Lauderdale, FL (Broward)
//   Vult: 175 mph, Exposure C, Roof Height: 12 ft
//   Building: 50×50 ft, Effective Area: 20 sq ft, Kzt: 1.0
//
// Expected Output (from calculation-summary.md):
//   Zone End Width (a): 4.8 ft
//   Velocity Pressure (qh): 45.9 psf
//   Kz: 0.59
//   Zone 4: +54.2 psf / -52.2 psf  (Note: intermediate values from existing calc)
//   Zone 5: +54.2 psf / -81.0 psf
// ============================================================

describe('ASCE 7-22 Calculator', () => {
  const FORT_LAUDERDALE_INPUT = {
    county: 'Broward',
    isHVHZ: true,
    ultimateWindSpeed: 175,
    exposureCategory: 'C' as const,
    meanRoofHeight: 12,
    buildingLength: 50,
    buildingWidth: 50,
    effectiveWindArea: 20,
    topographicFactor: 1.0,
    riskCategory: 2 as const,
  };

  describe('Individual Formulas', () => {
    it('calculates Kz for Exposure C at 12 ft (uses 15 ft minimum)', () => {
      const kz = calculateKz(12, 'C');
      expect(kz).toBe(0.85); // Table value for 15 ft, Exposure C
    });

    it('calculates Kz for Exposure B at 20 ft', () => {
      const kz = calculateKz(20, 'B');
      expect(kz).toBe(0.62);
    });

    it('calculates Kz for Exposure D at 30 ft', () => {
      const kz = calculateKz(30, 'D');
      expect(kz).toBe(1.16);
    });

    it('interpolates Kz between table entries', () => {
      const kz = calculateKz(35, 'C');
      // Between 30 (0.98) and 40 (1.04): 0.98 + 0.5*(1.04-0.98) = 1.01
      expect(kz).toBe(1.01);
    });

    it('calculates velocity pressure (qh)', () => {
      // qh = 0.00256 * Kz * Kzt * Kd * Ke * V^2
      // With Kz=0.85, Kzt=1.0, Kd=0.85, Ke=1.0, V=175
      const qh = calculateVelocityPressure(0.85, 1.0, 175);
      // 0.00256 * 0.85 * 1.0 * 0.85 * 1.0 * 175^2 = 56.6
      expect(qh).toBeGreaterThan(50);
      expect(qh).toBeLessThan(70);
    });

    it('calculates zone end width (a)', () => {
      const a = calculateZoneEndWidth(50, 50, 12);
      // min(0.1*50, 0.4*12) = min(5, 4.8) = 4.8
      // max(4.8, max(0.04*50, 3)) = max(4.8, max(2, 3)) = max(4.8, 3) = 4.8
      expect(a).toBe(4.8);
    });

    it('enforces minimum zone end width of 3 ft', () => {
      // Very small building: min(0.1*10, 0.4*8) = min(1, 3.2) = 1
      // max(1, max(0.04*10, 3)) = max(1, 3) = 3
      const a = calculateZoneEndWidth(10, 10, 8);
      expect(a).toBeGreaterThanOrEqual(3);
    });

    it('gets GCp coefficients for Zone 4 at 20 sq ft', () => {
      const gcp = getGCp(20, 4);
      expect(gcp.positive).toBeGreaterThan(0);
      expect(gcp.negative).toBeLessThan(0);
    });

    it('Zone 5 has higher suction than Zone 4', () => {
      const gcp4 = getGCp(20, 4);
      const gcp5 = getGCp(20, 5);
      expect(Math.abs(gcp5.negative)).toBeGreaterThan(Math.abs(gcp4.negative));
    });

    it('calculates design pressure correctly', () => {
      const p = calculateDesignPressure(50, 1.0, -1.4);
      // Positive: 50 * (1.0 + 0.18) = 59.0
      // Negative: 50 * (-1.4 - 0.18) = -79.0
      expect(p.positive).toBe(59);
      expect(p.negative).toBe(-79);
    });

    it('calculates wind load (force)', () => {
      const load = calculateWindLoad(54.2, 20);
      expect(load).toBe(1084);
    });
  });

  describe('HVHZ Overrides', () => {
    it('identifies Miami-Dade as HVHZ', () => {
      expect(isHVHZCounty('Miami-Dade')).toBe(true);
    });

    it('identifies Broward as HVHZ', () => {
      expect(isHVHZCounty('Broward')).toBe(true);
    });

    it('identifies Hillsborough as non-HVHZ', () => {
      expect(isHVHZCounty('Hillsborough')).toBe(false);
    });

    it('overrides wind speed for Miami-Dade Risk Cat II', () => {
      const result = applyHVHZOverrides('Miami-Dade', 160, 'C', 2);
      expect(result.windSpeed).toBe(175); // FBC 2023 Section 1620.2
    });

    it('overrides wind speed for Miami-Dade Risk Cat I to 165 mph', () => {
      const result = applyHVHZOverrides('Miami-Dade', 100, 'C', 1);
      expect(result.windSpeed).toBe(165); // FBC 2023 Section 1620.2
    });

    it('overrides wind speed for Miami-Dade Risk Cat III to 186 mph', () => {
      const result = applyHVHZOverrides('Miami-Dade', 100, 'C', 3);
      expect(result.windSpeed).toBe(186); // FBC 2023 Section 1620.2
    });

    it('overrides wind speed for Broward Risk Cat I to 156 mph', () => {
      const result = applyHVHZOverrides('Broward', 100, 'C', 1);
      expect(result.windSpeed).toBe(156); // FBC 2023 Section 1620.2
    });

    it('overrides wind speed for Broward Risk Cat IV to 185 mph', () => {
      const result = applyHVHZOverrides('Broward', 100, 'C', 4);
      expect(result.windSpeed).toBe(185); // FBC 2023 Section 1620.2
    });

    it('overrides exposure B to C for Broward', () => {
      const result = applyHVHZOverrides('Broward', 170, 'B', 2);
      expect(result.exposureCategory).toBe('C');
    });

    it('does not downgrade higher exposure', () => {
      const result = applyHVHZOverrides('Miami-Dade', 175, 'D', 2);
      expect(result.exposureCategory).toBe('D'); // D stays D
    });

    it('does not override non-HVHZ counties', () => {
      const result = applyHVHZOverrides('Hillsborough', 130, 'B', 2);
      expect(result.windSpeed).toBe(130);
      expect(result.exposureCategory).toBe('B');
    });
  });

  describe('Full Calculation - Fort Lauderdale Example', () => {
    const result = calculate(FORT_LAUDERDALE_INPUT);

    it('returns correct zone end width', () => {
      expect(result.intermediate.zoneEndWidth).toBe(4.8);
    });

    it('returns reasonable velocity pressure', () => {
      // Should be in the ballpark of 45-60 psf for 175mph, Exposure C, 12ft
      expect(result.intermediate.velocityPressure).toBeGreaterThan(40);
      expect(result.intermediate.velocityPressure).toBeLessThan(70);
    });

    it('Zone 5 negative pressure is more severe than Zone 4', () => {
      expect(Math.abs(result.zone5.negative)).toBeGreaterThan(
        Math.abs(result.zone4.negative)
      );
    });

    it('Zone 5 governs the critical negative pressure', () => {
      expect(result.criticalPressure.negative).toBe(result.zone5.negative);
    });

    it('generates HVHZ warnings for Broward', () => {
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(
        result.warnings.some((w) => w.includes('HVHZ'))
      ).toBe(true);
    });

    it('includes all required output fields', () => {
      expect(result.asce7Version).toBe('7-22');
      expect(result.floridaBuildingCodeVersion).toBe('2023');
      expect(result.calculatedAt).toBeTruthy();
      expect(result.input).toBeTruthy();
      expect(result.intermediate).toBeTruthy();
      expect(result.zone4).toBeTruthy();
      expect(result.zone5).toBeTruthy();
      expect(result.criticalPressure).toBeTruthy();
    });

    it('positive pressures are positive numbers', () => {
      expect(result.zone4.positive).toBeGreaterThan(0);
      expect(result.zone5.positive).toBeGreaterThan(0);
    });

    it('negative pressures are negative numbers', () => {
      expect(result.zone4.negative).toBeLessThan(0);
      expect(result.zone5.negative).toBeLessThan(0);
    });

    it('loads are pressure × area', () => {
      const area = FORT_LAUDERDALE_INPUT.effectiveWindArea;
      expect(result.zone4.loads.positive).toBeCloseTo(
        result.zone4.positive * area,
        0
      );
      expect(result.zone5.loads.negative).toBeCloseTo(
        result.zone5.negative * area,
        0
      );
    });
  });

  describe('Product Comparison', () => {
    const result = calculate(FORT_LAUDERDALE_INPUT);

    it('passes a product that exceeds requirements', () => {
      const comparison = compareProduct(result, {
        name: 'MasterCraft Impact Door',
        ratedPositive: 80,
        ratedNegative: 100,
      });
      expect(comparison.overallPass).toBe(true);
      expect(comparison.margin.positive).toBeGreaterThan(0);
      expect(comparison.margin.negative).toBeGreaterThan(0);
    });

    it('fails a product with insufficient suction rating', () => {
      const comparison = compareProduct(result, {
        name: 'Budget Window',
        ratedPositive: 80,
        ratedNegative: 40, // Way too low
      });
      expect(comparison.overallPass).toBe(false);
      expect(comparison.zone5.negativePass).toBe(false);
      expect(comparison.warnings.some((w) => w.includes('FAIL'))).toBe(true);
    });

    it('warns about HVHZ for non-NOA products', () => {
      const comparison = compareProduct(result, {
        name: 'Some Door',
        ratedPositive: 100,
        ratedNegative: 100,
        isHVHZApproved: false,
      });
      expect(
        comparison.warnings.some((w) => w.includes('HVHZ'))
      ).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('rejects wind speed below 85 mph', () => {
      const errors = validateInput({
        ...FORT_LAUDERDALE_INPUT,
        ultimateWindSpeed: 50,
      });
      expect(errors.some((e) => e.field === 'ultimateWindSpeed')).toBe(true);
    });

    it('rejects negative effective wind area', () => {
      const errors = validateInput({
        ...FORT_LAUDERDALE_INPUT,
        effectiveWindArea: -5,
      });
      expect(errors.some((e) => e.field === 'effectiveWindArea')).toBe(true);
    });

    it('rejects missing county', () => {
      const errors = validateInput({
        ...FORT_LAUDERDALE_INPUT,
        county: '',
      });
      expect(errors.some((e) => e.field === 'county')).toBe(true);
    });

    it('accepts valid input with no errors', () => {
      const errors = validateInput(FORT_LAUDERDALE_INPUT);
      expect(errors).toHaveLength(0);
    });

    it('throws on invalid input when calculate() is called', () => {
      expect(() =>
        calculate({ ...FORT_LAUDERDALE_INPUT, ultimateWindSpeed: 0 })
      ).toThrow('Invalid input');
    });
  });

  describe('Non-HVHZ Calculation', () => {
    it('calculates without HVHZ overrides for Hillsborough', () => {
      const result = calculate({
        county: 'Hillsborough',
        isHVHZ: false,
        ultimateWindSpeed: 150,
        exposureCategory: 'B',
        meanRoofHeight: 18,
        buildingLength: 40,
        buildingWidth: 30,
        effectiveWindArea: 15,
      });

      expect(result.intermediate.velocityPressure).toBeGreaterThan(0);
      expect(result.zone4.positive).toBeGreaterThan(0);
      expect(result.zone5.negative).toBeLessThan(0);
      expect(
        result.warnings.every((w) => !w.includes('HVHZ Override'))
      ).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles minimum building dimensions', () => {
      const result = calculate({
        county: 'Orange',
        isHVHZ: false,
        ultimateWindSpeed: 150,
        exposureCategory: 'C',
        meanRoofHeight: 10,
        buildingLength: 10,
        buildingWidth: 10,
        effectiveWindArea: 5,
      });
      expect(result.intermediate.zoneEndWidth).toBeGreaterThanOrEqual(3);
    });

    it('handles large effective wind area', () => {
      const result = calculate({
        county: 'Duval',
        isHVHZ: false,
        ultimateWindSpeed: 140,
        exposureCategory: 'C',
        meanRoofHeight: 30,
        buildingLength: 100,
        buildingWidth: 60,
        effectiveWindArea: 200,
      });
      // Large area = lower GCp coefficients
      expect(result.zone4.positive).toBeGreaterThan(0);
    });

    it('handles Exposure D', () => {
      const result = calculate({
        county: 'Monroe',
        isHVHZ: false,
        ultimateWindSpeed: 180,
        exposureCategory: 'D',
        meanRoofHeight: 15,
        buildingLength: 50,
        buildingWidth: 50,
        effectiveWindArea: 20,
      });
      // Exposure D = highest Kz
      expect(result.intermediate.exposureCoefficient).toBeGreaterThan(0.85);
    });
  });
});
