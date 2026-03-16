/**
 * GET /api/llm-context
 *
 * LLM Integration Context Endpoint
 *
 * Returns comprehensive, structured context about wind certification
 * that enables LLMs to guide users through the entire process.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculatorInputSchema, calculatorOutputSchema } from '@oasis/schemas';
import type { CalculatorInput, CalculatorOutput } from '@oasis/asce7-calculator';
import { calculate } from '@oasis/asce7-calculator';

export async function GET(request: NextRequest) {
  // Add CORS headers for external access
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // Generate example outputs by running calculations
    const hvhzExample: CalculatorInput = {
      county: 'Broward',
      isHVHZ: true,
      ultimateWindSpeed: 140,
      exposureCategory: 'B',
      meanRoofHeight: 20,
      buildingLength: 60,
      buildingWidth: 40,
      effectiveWindArea: 24,
      topographicFactor: 1.0,
      riskCategory: 2,
      address: '123 Main St, Fort Lauderdale, FL 33301',
    };

    const nonHVHZExample: CalculatorInput = {
      county: 'Hillsborough',
      isHVHZ: false,
      ultimateWindSpeed: 115,
      exposureCategory: 'C',
      meanRoofHeight: 25,
      buildingLength: 80,
      buildingWidth: 50,
      effectiveWindArea: 6,
      topographicFactor: 1.0,
      riskCategory: 2,
      address: '456 Oak Ave, Tampa, FL 33602',
    };

    const hvhzOutput = calculate(hvhzExample);
    const nonHVHZOutput = calculate(nonHVHZExample);

    const contextData = {
      // Metadata
      platform: 'Oasis Engineering Wind Certification Platform',
      version: '1.0.0',
      description:
        'Comprehensive context for LLM-guided wind load certification for Florida homeowners.',
      lastUpdated: new Date().toISOString(),

      // Standards and versions
      standards: {
        asce7Version: '7-22',
        floridaBuildingCodeVersion: '2023 FBC',
      },

      // JSON Schemas
      schemas: {
        input: calculatorInputSchema,
        output: calculatorOutputSchema,
      },

      // API endpoint information
      endpoints: {
        calculate: {
          method: 'POST',
          path: '/api/calculate',
          description: 'Calculate wind pressures for a given location and building parameters',
          inputSchema: 'schemas.input',
          outputSchema: 'schemas.output',
        },
        llmContext: {
          method: 'GET',
          path: '/api/llm-context',
          description: 'Get comprehensive context and examples for LLM integration',
        },
      },

      // Example inputs for LLM reference
      example_inputs: [
        {
          name: 'HVHZ Example (High-Velocity Hurricane Zone)',
          description: 'Example from Broward County with HVHZ conditions',
          input: hvhzExample,
        },
        {
          name: 'Non-HVHZ Example',
          description: 'Example from Hillsborough County without HVHZ',
          input: nonHVHZExample,
        },
      ],

      // Example outputs from running calculations
      example_outputs: [
        {
          name: 'HVHZ Example Output',
          description: 'Calculation result for Broward County (HVHZ)',
          output: hvhzOutput,
        },
        {
          name: 'Non-HVHZ Example Output',
          description: 'Calculation result for Hillsborough County (non-HVHZ)',
          output: nonHVHZOutput,
        },
      ],

      // Key terminology glossary
      glossary: {
        Vult: 'Ultimate wind speed in mph. The 700-year return period wind speed from ASCE 7-22 Figure 26.5-1. This is the design wind speed for components and cladding.',
        Kz: 'Exposure coefficient at mean roof height. Depends on exposure category (B/C/D) per ASCE 7-22 Table 26.8-1. Accounts for how wind speed varies with terrain roughness.',
        qh: 'Velocity pressure in psf at mean roof height. Calculated as qh = 0.613 × Kz × Kzt × Kd × Ke × V². Base pressure for all component pressures.',
        'Zone 4':
          'Interior zone pressure on building facades, away from edges and corners. Zone 4 typically experiences lower suction pressure than Zone 5.',
        'Zone 5':
          'Corner/edge zone pressure near building edges and corners. Zone 5 experiences higher suction due to flow separation. This is the governing (most critical) case.',
        HVHZ: 'High-Velocity Hurricane Zone per Florida Administrative Code 62-6.002. Areas near Florida coasts subject to higher wind speeds and stricter requirements.',
        GCp: 'External pressure coefficient for components and cladding per ASCE 7-22 Figure 30.4-1 and 30.4-2. Depends on effective wind area and zone.',
        GCpi: 'Internal pressure coefficient per ASCE 7-22 Section 26.13. For enclosed buildings, typically ±0.18.',
        'Design pressure': 'Final pressure on component = qh × GCp (or qh × GCp + GCpi for enclosed buildings).',
        'Effective wind area':
          'Tributary area for the component being analyzed. For doors/windows = width × height. Determines which GCp curve applies.',
        'Exposure category':
          'B = urban/suburban (obstructed); C = open terrain; D = coastal/flat open water. Determines exposure coefficient Kz.',
        Kzt: 'Topographic factor per ASCE 7-22 Section 26.8. Default 1.0 for flat terrain. Higher on hills/ridges (max 1.2).',
        'Risk category':
          'Building importance per ASCE 7-22 Table 1.5-1. Default 2 for residential. Higher categories (3, 4) have higher importance factors.',
        'Florida Product Approval': 'Number (e.g., FL12345-R3) indicating door/window is tested and approved for use in Florida per FBC.',
        NOA: 'Notice of Acceptance. Miami-Dade County approval for products in HVHZ. Some HVHZ locations require both Florida Product Approval AND Miami-Dade NOA.',
      },

      // Wind certification workflow
      workflow_steps: [
        {
          step: 1,
          title: 'Find Your Wind Speed',
          description:
            'Use ASCE 7 Hazard Tool to get the ultimate wind speed (Vult) for your location.',
          details: [
            'Visit https://asce7hazardtool.online',
            'Enter your full project address',
            'Use Risk Category II',
            'Note the Ultimate Wind Speed (Vult) in mph',
          ],
          inputs: ['projectAddress', 'riskCategory'],
          outputs: ['ultimateWindSpeed'],
        },
        {
          step: 2,
          title: 'Determine Exposure Category',
          description:
            'Classify your property based on surrounding terrain and obstructions.',
          details: [
            'B = Urban/suburban with buildings and trees (most common)',
            'C = Open terrain with scattered obstructions (rural areas)',
            'D = Coastal/open water areas (beaches, waterfront)',
            'Check ASCE 7-22 Section 26.7 for detailed guidance',
          ],
          inputs: ['surroundingTerrain', 'landUse'],
          outputs: ['exposureCategory'],
        },
        {
          step: 3,
          title: 'Measure Door/Window Dimensions',
          description: 'Get exact dimensions of the product being analyzed.',
          details: [
            'Width in feet (decimal format)',
            'Height in feet (decimal format)',
            'Effective wind area = width × height',
            'Small components (< 10 sqft) may have different GCp curves',
          ],
          inputs: ['doorWidth', 'doorHeight'],
          outputs: ['effectiveWindArea'],
        },
        {
          step: 4,
          title: 'Calculate Wind Pressures',
          description:
            'Use the calculator to determine required pressure ratings for your location and component.',
          details: [
            'POST to /api/calculate with CalculatorInput',
            'Receives CalculatorOutput with zone pressures',
            'Zone 5 (corners) is governing case',
            'Critical pressure is the maximum across all zones',
          ],
          inputs: [
            'ultimateWindSpeed',
            'exposureCategory',
            'effectiveWindArea',
            'buildingDimensions',
          ],
          outputs: ['zone4Pressure', 'zone5Pressure', 'criticalPressure'],
        },
        {
          step: 5,
          title: "Look Up Product's Florida Approval",
          description:
            'Find the product approval number and review rated pressures.',
          details: [
            'Go to https://www.floridabuilding.org/pri/Pages/FloridaProductApprovalSearch.aspx',
            'Search by approval number (e.g., FL12345-R3)',
            'Download the approval PDF',
            'Locate tested pressures (e.g., +65 psf / –70 psf)',
            'Note if product has Miami-Dade NOA for HVHZ',
          ],
          inputs: ['productApprovalNumber'],
          outputs: ['ratedPositivePressure', 'ratedNegativePressure', 'hvhzApproved'],
        },
        {
          step: 6,
          title: 'Compare Required vs Rated Pressures',
          description:
            'Verify that product ratings meet or exceed calculated requirements.',
          details: [
            'For all zones (4 and 5):',
            'Rated positive ≥ required positive?',
            'Rated negative ≥ required negative?',
            'If yes to all → PASS → Product suitable for location',
            'If no to any → FAIL → Product not suitable',
            'Zone 5 is most critical for edge/corner components',
          ],
          inputs: [
            'requiredPositivePressure',
            'requiredNegativePressure',
            'ratedPositivePressure',
            'ratedNegativePressure',
          ],
          outputs: ['comparisonResult', 'passFailStatus', 'margin'],
        },
        {
          step: 7,
          title: 'Prepare Certification Package',
          description:
            'Compile documentation for your building department submission.',
          details: [
            'Generate homeowner certification letter',
            'Include: address, product info, wind speed source, calculation result, product approval',
            'Attach screenshots or PDFs of:',
            '  - ASCE 7 Hazard Tool result (wind speed)',
            '  - Wind pressure calculator output',
            '  - Florida Product Approval PDF',
            'Optional: Diameter verification photos, product spec sheets',
          ],
          inputs: ['projectAddress', 'productName', 'calculatorOutput', 'approvalPDF'],
          outputs: ['certificationPackage', 'PDF'],
        },
      ],

      // HVHZ-specific rules
      hvhz_rules: {
        description:
          'Special requirements for High-Velocity Hurricane Zone (HVHZ) areas in Florida',
        hvhzCounties: [
          'Miami-Dade',
          'Broward',
          'Monroe',
          'Collier (parts)',
          'Lee (parts)',
        ],
        requirements: [
          'Buildings in HVHZ subject to higher wind speeds than non-HVHZ areas',
          'Wind speeds typically 140+ mph in HVHZ vs 115-125 mph elsewhere',
          'Products may require Miami-Dade NOA (Notice of Acceptance) in addition to Florida Product Approval',
          'Some products are Florida-approved but not Miami-Dade NOA approved',
          'Always check HVHZ status and product approvals carefully',
        ],
        miamidadeDade: {
          description: 'Miami-Dade County HVHZ overrides',
          windSpeedOverride:
            'Uses higher of map wind speed or 140 mph for Exposure B, 160 mph for Exposure C/D',
          requiresNOA: 'Products typically require Miami-Dade NOA for any exterior element',
        },
        broward: {
          description: 'Broward County HVHZ overrides',
          windSpeedOverride: 'Uses higher of map wind speed or 140 mph for Exposure B',
          requiresNOA:
            'Check current Broward requirements; NOA may be required for some elements',
        },
      },

      // Product comparison instructions
      product_comparison_instructions: {
        overview:
          'To determine if a product is suitable for a location, compare calculated required pressures against product rated pressures.',
        steps: [
          {
            step: 1,
            description: 'Get required pressures from calculator output (critical pressure)',
            detail: 'critical_pressure.positive and critical_pressure.negative',
          },
          {
            step: 2,
            description: 'Get product rated pressures from Florida Product Approval',
            detail:
              'Usually shown as "+XX psf / −YY psf" (positive / negative, with negative as positive number)',
          },
          {
            step: 3,
            description: 'Compare for BOTH positive and negative pressure',
            detail:
              'Product must meet or exceed BOTH to pass. Zone 5 (corners) is the critical case.',
          },
          {
            step: 4,
            description: 'Calculate margins (optional, for reference)',
            detail: 'Positive margin = rated - required. Negative = deficient.',
          },
          {
            step: 5,
            description: 'Check HVHZ requirements if applicable',
            detail:
              'If location is HVHZ, verify product has appropriate Miami-Dade NOA or equivalent approval',
          },
        ],
        passFailCriteria: {
          pass: 'Product rated positive ≥ required positive AND product rated negative ≥ required negative (for all zones)',
          fail: 'If any condition fails, product does not meet requirements',
        },
        exampleComparison: {
          location: 'Broward County (HVHZ)',
          requiredPositive: '+31.5 psf',
          requiredNegative: '−50.2 psf (shown as 50.2)',
          productRated: '+65 psf / −70 psf',
          result: 'PASS (65 ≥ 31.5 and 70 ≥ 50.2)',
          margin: '+33.5 psf positive, +19.8 psf negative',
        },
      },

      // Example prompts for users
      conversation_prompts: [
        {
          prompt:
            'I want to replace my front door in Miami-Dade County. Help me find the right product.',
          guidance:
            'Ask for: address, current door dimensions, product name/number. Then use the calculator to determine required pressures.',
        },
        {
          prompt: 'Is my window rated for my location?',
          guidance:
            'Ask for: location (address or county), window approval number. Get required pressures from calculator, lookup product ratings, compare.',
        },
        {
          prompt: 'What does "Zone 5" mean?',
          guidance:
            'Explain: Zone 5 is the corner/edge zone (within distance "a" of corners). It experiences higher suction. This is the governing case for most doors and windows.',
        },
        {
          prompt: 'Do I need Miami-Dade approval?',
          guidance:
            'Check if location is in HVHZ (Broward, Miami-Dade, Monroe, etc.). If yes, product may need NOA in addition to Florida Product Approval.',
        },
        {
          prompt: 'How do I prepare my submission package?',
          guidance:
            'Walk through steps 1-7 of the workflow. Help generate certification letter, gather screenshots, organize PDFs.',
        },
        {
          prompt: 'What is the exposure category?',
          guidance:
            'Describe the three categories: B (urban/suburban), C (open terrain), D (coastal/open water). Ask about surrounding terrain and land use.',
        },
        {
          prompt:
            'My product has a margin of 20 psf. Is that good?',
          guidance:
            'Explain: Margin = rated - required. Positive margin is good (excess capacity). 10-20 psf is typical. Higher margins provide more safety factor.',
        },
      ],

      // Helpful links and resources
      links: {
        'ASCE 7 Hazard Tool': 'https://asce7hazardtool.online',
        'Florida Product Approval Database':
          'https://www.floridabuilding.org/pri/Pages/FloridaProductApprovalSearch.aspx',
        'Wind Calculations Free Tools': 'https://windcalculations.com/free-wind-calculators',
        'ASCE 7-22 Standard': 'https://www.asce.org/publications-and-resources/standards/asce-7-22',
        'Florida Building Code 2023 FBC': 'https://www.floridabuilding.org/',
        'Miami-Dade Product Approval':
          'https://www.miamidade.gov/business/library/emergency-management/product-approval-search.html',
      },
    };

    return NextResponse.json(contextData, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to generate context',
        details: errorMessage,
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  return NextResponse.json({}, { headers: corsHeaders });
}
