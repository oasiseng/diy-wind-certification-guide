/**
 * @oasis/schemas
 *
 * JSON schemas for LLM integration with ASCE 7-22 wind pressure calculator.
 * Provides detailed schemas with descriptions suitable for large language model guidance.
 */

export { calculatorInputSchema } from './calculator-input.schema';
export { calculatorOutputSchema } from './calculator-output.schema';

/**
 * Current schema version
 * Increment this when making breaking changes to schema structure
 */
export const SCHEMA_VERSION = '1.0.0';

/**
 * ASCE 7-22 Chapter 30 standard version
 */
export const ASCE7_VERSION = '7-22';

/**
 * Florida Building Code version
 */
export const FBC_VERSION = '2023 FBC';

/**
 * Schema metadata
 */
export const schemaMetadata = {
  name: '@oasis/schemas',
  version: SCHEMA_VERSION,
  description: 'JSON schemas for ASCE 7-22 wind pressure calculator',
  asce7Version: ASCE7_VERSION,
  fbcVersion: FBC_VERSION,
  updatedAt: new Date().toISOString(),
} as const;
