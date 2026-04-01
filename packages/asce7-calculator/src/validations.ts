// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025 Oasis Engineering — windcalculations.com
// This file is part of @oasis/asce7-calculator.
// Commercial license: info@oasisengineering.com

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
    !Number.isFinite(input.ultimateWindSpeed) ||
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

  // Mean roof height: Part 1 C&C (Figure 30.3-1) is limited to h ≤ 60 ft.
  // Buildings taller than 60 ft require Part 3 (Eq. 30.4-1) and a PE seal.
  if (
    input.meanRoofHeight == null ||
    !Number.isFinite(input.meanRoofHeight) ||
    input.meanRoofHeight < 5 ||
    input.meanRoofHeight > 60
  ) {
    errors.push({
      field: 'meanRoofHeight',
      message:
        'Mean roof height must be between 5 and 60 feet. This calculator uses ASCE 7-22 Chapter 30 Part 1 (low-rise buildings, h ≤ 60 ft). Buildings taller than 60 ft require Part 3 methods and a PE seal.',
      value: input.meanRoofHeight,
    });
  }

  // Building dimensions
  if (
    input.buildingLength == null ||
    !Number.isFinite(input.buildingLength) ||
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
    !Number.isFinite(input.buildingWidth) ||
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
    !Number.isFinite(input.effectiveWindArea) ||
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
  if (!Number.isFinite(kzt) || kzt < 1.0 || kzt > 3.0) {
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
