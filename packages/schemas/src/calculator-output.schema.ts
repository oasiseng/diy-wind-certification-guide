/**
 * JSON Schema (Draft-07) for ASCE 7-22 Calculator Output
 *
 * This schema defines the structure for wind pressure calculator results.
 * Includes intermediate values, zone pressures, critical pressures, and warnings.
 */

export const calculatorOutputSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ASCE 7-22 Wind Pressure Calculator Output',
  description:
    'Complete results from the ASCE 7-22 Chapter 30 wind pressure calculation, including intermediate calculation values, zone pressures, and critical design values for product selection.',
  type: 'object',
  required: [
    'input',
    'intermediate',
    'zone4',
    'zone5',
    'criticalPressure',
    'asce7Version',
    'floridaBuildingCodeVersion',
    'calculatedAt',
    'warnings',
  ],
  additionalProperties: false,
  properties: {
    input: {
      type: 'object',
      description: 'Snapshot of the input parameters used for this calculation. Stored for record-keeping and audit trail purposes.',
      required: [
        'county',
        'isHVHZ',
        'ultimateWindSpeed',
        'exposureCategory',
        'meanRoofHeight',
        'buildingLength',
        'buildingWidth',
        'effectiveWindArea',
      ],
      properties: {
        county: {
          type: 'string',
          description: 'Florida county where building is located',
        },
        isHVHZ: {
          type: 'boolean',
          description: 'Whether location is in High-Velocity Hurricane Zone',
        },
        ultimateWindSpeed: {
          type: 'number',
          description: 'Ultimate wind speed in mph used for calculation',
        },
        exposureCategory: {
          type: 'string',
          enum: ['B', 'C', 'D'],
          description: 'Exposure category (B/C/D)',
        },
        meanRoofHeight: {
          type: 'number',
          description: 'Mean roof height in feet',
        },
        buildingLength: {
          type: 'number',
          description: 'Building length (longest horizontal dimension) in feet',
        },
        buildingWidth: {
          type: 'number',
          description: 'Building width (shortest horizontal dimension) in feet',
        },
        effectiveWindArea: {
          type: 'number',
          description: 'Effective wind area in square feet',
        },
        topographicFactor: {
          type: 'number',
          description: 'Topographic factor (Kzt), default 1.0',
        },
        riskCategory: {
          type: 'integer',
          enum: [1, 2, 3, 4],
          description: 'Risk category (1/2/3/4), default 2',
        },
        address: {
          type: ['string', 'null'],
          description: 'Project address for record-keeping',
        },
      },
    },

    intermediate: {
      type: 'object',
      description:
        'Intermediate calculation values showing key steps in the computation. These values are used to calculate final pressures and help verify correct application of ASCE 7-22 formulas.',
      required: [
        'zoneEndWidth',
        'velocityPressure',
        'exposureCoefficient',
        'directionalityFactor',
        'groundElevationFactor',
      ],
      properties: {
        zoneEndWidth: {
          type: 'number',
          description:
            'Zone end width "a" in feet. Per ASCE 7-22 Section 30.3: a = min(0.1 × least horizontal dimension, 0.4 × mean roof height) but not less than 4% of least dimension or 3 feet. Used to define the width of the end zone (Zone 5) along the edges and corners of the building.',
        },

        velocityPressure: {
          type: 'number',
          description:
            'Velocity pressure (qh) in pounds per square foot at mean roof height. Calculated as qh = 0.613 × Kz × Kzt × Kd × V² × I per ASCE 7-22 Section 26.10. This is the base pressure used to determine all component pressures.',
        },

        exposureCoefficient: {
          type: 'number',
          description:
            'Exposure coefficient (Kz) at mean roof height. Depends on exposure category (B/C/D) per ASCE 7-22 Table 26.8-1. Accounts for how wind speed varies with height based on terrain roughness. Higher values for less obstructed terrain.',
        },

        directionalityFactor: {
          type: 'number',
          description:
            'Wind directionality factor (Kd). Per ASCE 7-22 Table 26.6-1. Typically 0.85 for buildings. Accounts for the probability of maximum wind speeds coming from any direction.',
        },

        groundElevationFactor: {
          type: 'number',
          description:
            'Ground elevation factor (Ke). Per ASCE 7-22 Section 26.9. Accounts for elevation above sea level. Used in standard calculations. Value of 1.0 for elevations below 2,000 feet; increases slightly at higher elevations.',
        },
      },
    },

    zone4: {
      type: 'object',
      description:
        'Wind pressures and loads for Zone 4 (interior zone). This is the pressure on internal or middle portions of the building facade, away from edges and corners. Zone 4 typically experiences lower suction than Zone 5.',
      required: ['positive', 'negative', 'loads'],
      properties: {
        positive: {
          type: 'number',
          description:
            'Zone 4 positive (inward) pressure in pounds per square foot (psf). This is the inward pressure that tends to push on the building surface. Used for design of windows, doors, and cladding on the windward side.',
        },

        negative: {
          type: 'number',
          description:
            'Zone 4 negative (outward/suction) pressure in pounds per square foot (psf). This is the outward suction that tends to pull on the building surface. Used for design of windows, doors, and cladding on the leeward side and roof edges.',
        },

        loads: {
          type: 'object',
          description:
            'Actual wind loads in pounds-force (lbf) for Zone 4, calculated as pressure × effective wind area. These are the total forces that components must resist.',
          properties: {
            positive: {
              type: 'number',
              description:
                'Zone 4 positive load in pounds-force (lbf). Calculated as positive pressure × effective wind area. Total inward force the component must resist.',
            },

            negative: {
              type: 'number',
              description:
                'Zone 4 negative load in pounds-force (lbf). Calculated as negative pressure × effective wind area. Total outward suction force the component must resist.',
            },
          },
        },
      },
    },

    zone5: {
      type: 'object',
      description:
        'Wind pressures and loads for Zone 5 (corner/edge zone). This is the pressure on areas within distance "a" (zone end width) from corners and edges. Zone 5 typically experiences higher suction than Zone 4 due to flow separation effects.',
      required: ['positive', 'negative', 'loads'],
      properties: {
        positive: {
          type: 'number',
          description:
            'Zone 5 positive (inward) pressure in pounds per square foot (psf). Inward pressure near building edges and corners.',
        },

        negative: {
          type: 'number',
          description:
            'Zone 5 negative (outward/suction) pressure in pounds per square foot (psf). Outward suction near building edges and corners, typically higher than Zone 4.',
        },

        loads: {
          type: 'object',
          description: 'Actual wind loads in pounds-force (lbf) for Zone 5 components.',
          properties: {
            positive: {
              type: 'number',
              description:
                'Zone 5 positive load in pounds-force (lbf). Total inward force the component must resist at edges/corners.',
            },

            negative: {
              type: 'number',
              description:
                'Zone 5 negative load in pounds-force (lbf). Total outward suction force the component must resist at edges/corners.',
            },
          },
        },
      },
    },

    criticalPressure: {
      type: 'object',
      description:
        'Critical design pressures for product selection. These are the maximum pressures across all zones that the product must meet or exceed. Products selected for the component must have ratings at least equal to these critical values.',
      required: ['positive', 'negative'],
      properties: {
        positive: {
          type: 'number',
          description:
            'Maximum positive (inward) pressure in psf across all zones. The product must have a positive pressure rating >= this value to pass design.',
        },

        negative: {
          type: 'number',
          description:
            'Maximum negative (suction/outward) pressure magnitude in psf across all zones. The product must have a negative pressure rating >= this value to pass design.',
        },
      },
    },

    asce7Version: {
      type: 'string',
      description:
        'ASCE 7 standard version used for calculations. Currently "7-22" for ASCE/SEI 7-22, Minimum Design Loads and Associated Criteria for Buildings and Other Structures.',
      examples: ['7-22', '7-16'],
    },

    floridaBuildingCodeVersion: {
      type: 'string',
      description:
        'Florida Building Code version applied. Florida often adopts ASCE 7 with specific amendments. Common versions include "2023 FBC" (based on ASCE 7-22) and "2020 FBC" (based on ASCE 7-16).',
      examples: ['2023 FBC', '2020 FBC'],
    },

    calculatedAt: {
      type: 'string',
      format: 'date-time',
      description:
        'ISO 8601 timestamp indicating when the calculation was performed. Useful for audit trails and verification purposes.',
      examples: ['2024-03-15T14:30:00Z', '2024-03-15T10:15:30.123Z'],
    },

    warnings: {
      type: 'array',
      description:
        'Array of warning messages from the calculation. Warnings indicate conditions that may require special attention or verification, such as non-standard input combinations or code-specific considerations. An empty array indicates no warnings.',
      items: {
        type: 'string',
      },
      examples: [
        ['Building is in HVHZ - ensure products have NOA approval'],
        [
          'Risk category set to 3 - verify with local building department',
          'Topographic factor > 1.0 - ensure terrain analysis documentation',
        ],
      ],
    },
  },

  examples: [
    {
      input: {
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
      },
      intermediate: {
        zoneEndWidth: 8,
        velocityPressure: 52.3,
        exposureCoefficient: 0.95,
        directionalityFactor: 0.85,
        groundElevationFactor: 1.0,
      },
      zone4: {
        positive: 28.6,
        negative: -42.9,
        loads: {
          positive: 686.4,
          negative: -1029.6,
        },
      },
      zone5: {
        positive: 31.5,
        negative: -50.2,
        loads: {
          positive: 756,
          negative: -1204.8,
        },
      },
      criticalPressure: {
        positive: 31.5,
        negative: 50.2,
      },
      asce7Version: '7-22',
      floridaBuildingCodeVersion: '2023 FBC',
      calculatedAt: '2024-03-15T14:30:00Z',
      warnings: [
        'Building is in HVHZ - ensure products have NOA (Notice of Acceptance) approval',
        'High wind speed (140 mph) - verify ultimate wind speed from current ASCE 7-22 Figure 26.5-1 and HVHZ map',
      ],
    },
  ],
} as const;
