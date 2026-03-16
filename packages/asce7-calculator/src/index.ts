/**
 * @oasis/asce7-calculator
 *
 * ASCE 7-22 Wind Pressure Calculator for Components and Cladding.
 * Pure TypeScript, zero dependencies.
 *
 * @example
 * ```typescript
 * import { calculate, compareProduct } from '@oasis/asce7-calculator';
 *
 * const result = calculate({
 *   county: 'Broward',
 *   isHVHZ: true,
 *   ultimateWindSpeed: 170,
 *   exposureCategory: 'C',
 *   meanRoofHeight: 12,
 *   buildingLength: 50,
 *   buildingWidth: 50,
 *   effectiveWindArea: 20,
 * });
 *
 * console.log(result.criticalPressure);
 * // { positive: 54.2, negative: -81.0 }
 *
 * const comparison = compareProduct(result, {
 *   name: 'MasterCraft Impact Door',
 *   ratedPositive: 55,
 *   ratedNegative: 90,
 * });
 *
 * console.log(comparison.overallPass); // true
 * ```
 *
 * @packageDocumentation
 */

// Main calculator functions
export { calculate, compareProduct } from './calculator';

// Individual formulas (for advanced users / LLM integration)
export {
  calculateKz,
  calculateVelocityPressure,
  calculateZoneEndWidth,
  getGCp,
  calculateDesignPressure,
  calculateWindLoad,
  KD_COMPONENTS_CLADDING,
  KE_SEA_LEVEL,
  GCPI_ENCLOSED,
} from './formulas';

// HVHZ overrides
export {
  isHVHZCounty,
  getHVHZConfig,
  applyHVHZOverrides,
  HVHZ_COUNTIES,
} from './hvhz-overrides';
export type { HVHZCountyConfig } from './hvhz-overrides';

// Validation
export { validateInput } from './validations';

// All types
export type {
  CalculatorInput,
  CalculatorOutput,
  ZonePressure,
  IntermediateValues,
  ExposureCategory,
  RiskCategory,
  WindZone,
  ProductRating,
  ProductComparison,
  ValidationError,
  CountyInfo,
} from './types';
