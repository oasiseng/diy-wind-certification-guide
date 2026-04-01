import { describe, it, expect } from 'vitest';
import {
  calculate,
  generateReport,
  isHVHZCounty,
  normalizeCounty,
  getHVHZConfig,
  validateInput,
  calculateVelocityPressure,
} from '../src/index';

// ============================================================
// HVHZ County Normalization Tests
// ============================================================

describe('HVHZ County Normalization', () => {
  it('normalizes "Miami-Dade" (canonical)', () => {
    expect(normalizeCounty('Miami-Dade')).toBe('Miami-Dade');
  });

  it('normalizes "miami-dade" (lowercase)', () => {
    expect(normalizeCounty('miami-dade')).toBe('Miami-Dade');
  });

  it('normalizes "Miami Dade" (space instead of hyphen)', () => {
    expect(normalizeCounty('Miami Dade')).toBe('Miami-Dade');
  });

  it('normalizes "MIAMI-DADE" (uppercase)', () => {
    expect(normalizeCounty('MIAMI-DADE')).toBe('Miami-Dade');
  });

  it('normalizes "Miami-Dade County" (trailing County)', () => {
    expect(normalizeCounty('Miami-Dade County')).toBe('Miami-Dade');
  });

  it('normalizes "dade" (alias)', () => {
    expect(normalizeCounty('dade')).toBe('Miami-Dade');
  });

  it('normalizes "miami" (alias)', () => {
    expect(normalizeCounty('miami')).toBe('Miami-Dade');
  });

  it('normalizes "Broward" (canonical)', () => {
    expect(normalizeCounty('Broward')).toBe('Broward');
  });

  it('normalizes "broward" (lowercase)', () => {
    expect(normalizeCounty('broward')).toBe('Broward');
  });

  it('normalizes "BROWARD COUNTY" (uppercase + trailing)', () => {
    expect(normalizeCounty('BROWARD COUNTY')).toBe('Broward');
  });

  it('normalizes "  Broward  " (whitespace)', () => {
    expect(normalizeCounty('  Broward  ')).toBe('Broward');
  });

  it('returns null for non-HVHZ counties', () => {
    expect(normalizeCounty('Orange')).toBeNull();
    expect(normalizeCounty('Hillsborough')).toBeNull();
    expect(normalizeCounty('Duval')).toBeNull();
  });

  it('isHVHZCounty returns true for all Miami-Dade variants', () => {
    expect(isHVHZCounty('Miami-Dade')).toBe(true);
    expect(isHVHZCounty('miami dade')).toBe(true);
    expect(isHVHZCounty('Miami-Dade County')).toBe(true);
    expect(isHVHZCounty('dade')).toBe(true);
  });

  it('isHVHZCounty returns false for non-HVHZ', () => {
    expect(isHVHZCounty('Orange')).toBe(false);
    expect(isHVHZCounty('Palm Beach')).toBe(false);
  });

  it('getHVHZConfig works with normalized names', () => {
    const config = getHVHZConfig('miami dade county');
    expect(config).not.toBeNull();
    expect(config!.county).toBe('Miami-Dade');
    expect(config!.minimumWindSpeeds[2]).toBe(175);
  });
});

// ============================================================
// HVHZ Auto-Detection in calculate()
// ============================================================

describe('HVHZ Auto-Detection', () => {
  const baseInput = {
    county: 'Broward',
    ultimateWindSpeed: 140,
    exposureCategory: 'B' as const,
    meanRoofHeight: 15,
    buildingLength: 50,
    buildingWidth: 40,
    effectiveWindArea: 20,
    riskCategory: 2 as const,
  };

  it('auto-detects HVHZ for Broward even when isHVHZ=false', () => {
    const result = calculate({ ...baseInput, isHVHZ: false });
    // Should have applied HVHZ overrides automatically
    expect(result.input.isHVHZ).toBe(true);
    expect(result.input.ultimateWindSpeed).toBe(170); // Broward Cat II minimum
    expect(result.input.exposureCategory).toBe('C'); // HVHZ minimum
    expect(result.warnings.some(w => w.includes('HVHZ Auto-Detected'))).toBe(true);
  });

  it('auto-detects HVHZ for "miami dade" with isHVHZ=false', () => {
    const result = calculate({ ...baseInput, county: 'miami dade', isHVHZ: false });
    expect(result.input.isHVHZ).toBe(true);
    expect(result.input.ultimateWindSpeed).toBe(175); // Miami-Dade Cat II
  });

  it('does not auto-detect for non-HVHZ counties', () => {
    const result = calculate({ ...baseInput, county: 'Orange', isHVHZ: false, ultimateWindSpeed: 150 });
    expect(result.input.isHVHZ).toBe(false);
    expect(result.warnings.every(w => !w.includes('HVHZ Auto-Detected'))).toBe(true);
  });
});

// ============================================================
// HVHZ Auto-Detection in generateReport()
// ============================================================

describe('Report HVHZ Auto-Detection', () => {
  it('auto-applies HVHZ for Broward county in report', () => {
    const report = generateReport({
      projectName: 'HVHZ Test',
      address: '123 Test',
      state: 'FL',
      county: 'broward county',
      isHVHZ: false, // Not checked, but should auto-detect
      ultimateWindSpeed: 140,
      exposureCategory: 'B',
      meanRoofHeight: 15,
      buildingLength: 50,
      buildingWidth: 40,
      enclosureType: 'Enclosed',
      riskCategory: 2,
      openings: [{ markId: 'W-1', type: 'Window', widthInches: 36, heightInches: 48, floorLevel: 1, zone: 4 }],
    });

    expect(report.warnings.some(w => w.includes('HVHZ Auto-Detected'))).toBe(true);
    // Wind speed should be bumped to Broward Cat II minimum (170)
    expect(report.project.ultimateWindSpeed).toBe(170);
  });
});

// ============================================================
// NaN / Validation Guards
// ============================================================

describe('NaN Validation Guards', () => {
  it('validateInput rejects NaN wind speed', () => {
    const errors = validateInput({
      county: 'Orange',
      isHVHZ: false,
      ultimateWindSpeed: NaN,
      exposureCategory: 'C',
      meanRoofHeight: 15,
      buildingLength: 50,
      buildingWidth: 40,
      effectiveWindArea: 20,
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.field === 'ultimateWindSpeed')).toBe(true);
  });

  it('validateInput rejects Infinity roof height', () => {
    const errors = validateInput({
      county: 'Orange',
      isHVHZ: false,
      ultimateWindSpeed: 150,
      exposureCategory: 'C',
      meanRoofHeight: Infinity,
      buildingLength: 50,
      buildingWidth: 40,
      effectiveWindArea: 20,
    });
    expect(errors.some(e => e.field === 'meanRoofHeight')).toBe(true);
  });

  it('validateInput rejects NaN building dimensions', () => {
    const errors = validateInput({
      county: 'Orange',
      isHVHZ: false,
      ultimateWindSpeed: 150,
      exposureCategory: 'C',
      meanRoofHeight: 15,
      buildingLength: NaN,
      buildingWidth: NaN,
      effectiveWindArea: 20,
    });
    expect(errors.some(e => e.field === 'buildingLength')).toBe(true);
    expect(errors.some(e => e.field === 'buildingWidth')).toBe(true);
  });

  it('validateInput rejects NaN effective wind area', () => {
    const errors = validateInput({
      county: 'Orange',
      isHVHZ: false,
      ultimateWindSpeed: 150,
      exposureCategory: 'C',
      meanRoofHeight: 15,
      buildingLength: 50,
      buildingWidth: 40,
      effectiveWindArea: NaN,
    });
    expect(errors.some(e => e.field === 'effectiveWindArea')).toBe(true);
  });

  it('generateReport throws on NaN numeric inputs', () => {
    expect(() =>
      generateReport({
        projectName: 'Test',
        address: '123 Test',
        state: 'FL',
        county: 'Orange',
        isHVHZ: false,
        ultimateWindSpeed: NaN,
        exposureCategory: 'C',
        meanRoofHeight: 15,
        buildingLength: 50,
        buildingWidth: 40,
        enclosureType: 'Enclosed',
        openings: [{ markId: 'W-1', type: 'Window', widthInches: 36, heightInches: 48, floorLevel: 1, zone: 4 }],
      })
    ).toThrow('Invalid numeric input');
  });

  it('generateReport throws on NaN opening dimensions', () => {
    expect(() =>
      generateReport({
        projectName: 'Test',
        address: '123 Test',
        state: 'FL',
        county: 'Orange',
        isHVHZ: false,
        ultimateWindSpeed: 150,
        exposureCategory: 'C',
        meanRoofHeight: 15,
        buildingLength: 50,
        buildingWidth: 40,
        enclosureType: 'Enclosed',
        openings: [{ markId: 'W-1', type: 'Window', widthInches: NaN, heightInches: 48, floorLevel: 1, zone: 4 }],
      })
    ).toThrow('Opening "W-1" has invalid dimensions');
  });
});

// ============================================================
// Ke (Ground Elevation Factor) Wiring
// ============================================================

describe('Ground Elevation Factor (Ke)', () => {
  it('calculateVelocityPressure scales with Ke', () => {
    const qhKe1 = calculateVelocityPressure(0.85, 1.0, 150, 0.85, 1.0);
    const qhKe09 = calculateVelocityPressure(0.85, 1.0, 150, 0.85, 0.9);
    // qh with Ke=0.9 should be 90% of qh with Ke=1.0
    expect(qhKe09).toBeCloseTo(qhKe1 * 0.9, 0);
  });

  it('generateReport uses Ke in qh calculation', () => {
    const reportKe1 = generateReport({
      projectName: 'Ke Test 1.0',
      address: '123 Test',
      state: 'FL',
      county: 'Orange',
      isHVHZ: false,
      ultimateWindSpeed: 150,
      exposureCategory: 'C',
      meanRoofHeight: 15,
      buildingLength: 50,
      buildingWidth: 40,
      enclosureType: 'Enclosed',
      groundElevationFactor: 1.0,
      openings: [{ markId: 'W-1', type: 'Window', widthInches: 36, heightInches: 48, floorLevel: 1, zone: 4 }],
    });

    const reportKe09 = generateReport({
      projectName: 'Ke Test 0.9',
      address: '123 Test',
      state: 'FL',
      county: 'Orange',
      isHVHZ: false,
      ultimateWindSpeed: 150,
      exposureCategory: 'C',
      meanRoofHeight: 15,
      buildingLength: 50,
      buildingWidth: 40,
      enclosureType: 'Enclosed',
      groundElevationFactor: 0.9,
      openings: [{ markId: 'W-1', type: 'Window', widthInches: 36, heightInches: 48, floorLevel: 1, zone: 4 }],
    });

    // qh with Ke=0.9 should be ~90% of qh with Ke=1.0
    expect(reportKe09.commonFactors.qh).toBeCloseTo(reportKe1.commonFactors.qh * 0.9, 0);
    expect(reportKe09.commonFactors.ke).toBe(0.9);
    expect(reportKe1.commonFactors.ke).toBe(1.0);
  });
});

// ============================================================
// Output Snapshot Returns Adjusted Values
// ============================================================

describe('calculate() Output Snapshot', () => {
  it('returns adjusted HVHZ values in output, not originals', () => {
    const result = calculate({
      county: 'Broward',
      isHVHZ: true,
      ultimateWindSpeed: 140, // Below Broward minimum
      exposureCategory: 'B', // Below HVHZ minimum
      meanRoofHeight: 15,
      buildingLength: 50,
      buildingWidth: 40,
      effectiveWindArea: 20,
      riskCategory: 2,
    });

    // Output should reflect the ADJUSTED values used in calculation
    expect(result.input.ultimateWindSpeed).toBe(170); // Broward Cat II min
    expect(result.input.exposureCategory).toBe('C'); // HVHZ min
    expect(result.input.isHVHZ).toBe(true);
  });
});
