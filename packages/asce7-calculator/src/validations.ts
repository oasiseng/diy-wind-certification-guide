/**
 * Input Validation for ASCE 7-22 Calculator
 *
 * Validates all input parameters against reasonable engineering bounds.
 */

import type { CalculatorInput, ValidationError } from './types';

/**
 * Validate calculator inputs and return any errors.
 * Returns an empty array if all inputs are valid.
 */
export function validateInput(input: CalculatorInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // Wind speed: ASCE 7-22 maps range from ~95 mph to ~200+ mph for Risk Cat II
  if (
    input.ultimateWindSpeed == null ||
    input.ultimateWindSpeed < 85 ||
    input.ultimateWindSpeed > 300
  ) {
    errors.push({
      field: 'ultimateWindSpeed',
      message:
        'Ultimate wind speed must be between 85 and 300 mph. Check the ASCE 7 Hazard Tool for your location.',
      value: input.ultimateWindSpeed,
    });
  }

  // Exposure category
  if (!['B', 'C', 'D'].includes(input.exposureCategory)) {
    errors.push({
      field: 'exposureCategory',
      message: 'Exposure category must be B, C, or D.',
      value: input.exposureCategory,
    });
  }

  // Mean roof height: reasonable range for residential/commercial
  if (
    input.meanRoofHeight == null ||
    input.meanRoofHeight < 5 ||
    input.meanRoofHeight > 200
  ) {
    errors.push({
      field: 'meanRoofHeight',
      message: 'Mean roof height must be between 5 and 200 feet.',
      value: input.meanRoofHeight,
    });
  }

  // Building dimensions
  if (
    input.buildingLength == null ||
    input.buildingLength < 5 ||
    input.buildingLength > 1000
  ) {
    errors.push({
      field: 'buildingLength',
      message: 'Building length must be between 5 and 1000 feet.',
      value: input.buildingLength,
    });
  }

  if (
    input.buildingWidth == null ||
    input.buildingWidth < 5 ||
    input.buildingWidth > 1000
  ) {
    errors.push({
      field: 'buildingWidth',
      message: 'Building width must be between 5 and 1000 feet.',
      value: input.buildingWidth,
    });
  }

  // Effective wind area
  if (
    input.effectiveWindArea == null ||
    input.effectiveWindArea < 1 ||
    input.effectiveWindArea > 1000
  ) {
    errors.push({
      field: 'effectiveWindArea',
      message:
        'Effective wind area must be between 1 and 1000 sq ft. For doors/windows, this is width × height.',
      value: input.effectiveWindArea,
    });
  }

  // Topographic factor
  const kzt = input.topographicFactor ?? 1.0;
  if (kzt < 1.0 || kzt > 3.0) {
    errors.push({
      field: 'topographicFactor',
      message:
        'Topographic factor (Kzt) must be between 1.0 and 3.0. Use 1.0 for flat terrain.',
      value: kzt,
    });
  }

  // Risk category
  const rc = input.riskCategory ?? 2;
  if (![1, 2, 3, 4].includes(rc)) {
    errors.push({
      field: 'riskCategory',
      message: 'Risk category must be 1, 2, 3, or 4.',
      value: rc,
    });
  }

  // County
  if (!input.county || input.county.trim().length === 0) {
    errors.push({
      field: 'county',
      message: 'County is required.',
      value: input.county,
    });
  }

  return errors;
}
