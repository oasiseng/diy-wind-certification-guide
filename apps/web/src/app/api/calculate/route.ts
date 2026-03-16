/**
 * POST /api/calculate
 *
 * ASCE 7-22 Wind Pressure Calculator API Endpoint
 *
 * Accepts a calculator input JSON body and returns wind pressure calculations
 * for components and cladding per ASCE 7-22 Chapter 30.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculate, validateInput } from '@oasis/asce7-calculator';
import type {
  CalculatorInput,
  CalculatorOutput,
  ValidationError,
} from '@oasis/asce7-calculator';

/**
 * POST endpoint for ASCE 7-22 calculations
 *
 * Request body: CalculatorInput JSON
 * Response: 200 with CalculatorOutput, or 400 with validation errors
 */
export async function POST(request: NextRequest) {
  // Add CORS headers for external access
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-RateLimit-Info': 'Standard rate limit: 100 requests per minute',
  };

  try {
    // Parse JSON body
    let input: CalculatorInput;
    try {
      input = (await request.json()) as CalculatorInput;
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : 'Unknown error',
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate input
    const validationErrors: ValidationError[] = validateInput(input);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          validationErrors: validationErrors.map((e) => ({
            field: e.field,
            message: e.message,
            value: e.value,
          })),
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Perform calculation
    const result: CalculatorOutput = calculate(input);

    // Return successful result
    return NextResponse.json(result, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    // Handle calculation errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Calculation failed',
        details: errorMessage,
      },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }
}

/**
 * OPTIONS endpoint for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  return NextResponse.json({}, { headers: corsHeaders });
}
