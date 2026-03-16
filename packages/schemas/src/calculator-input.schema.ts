/**
 * JSON Schema (Draft-07) for ASCE 7-22 Calculator Input
 *
 * This schema defines the structure and constraints for wind pressure calculator inputs.
 * Designed for LLM integration to guide users in providing accurate building and site data.
 */

export const calculatorInputSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ASCE 7-22 Wind Pressure Calculator Input',
  description:
    'Input parameters for calculating wind pressures on building components and cladding using ASCE 7-22 Chapter 30. All values must comply with ASCE 7-22 and Florida Building Code requirements.',
  type: 'object',
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
  additionalProperties: false,
  properties: {
    county: {
      type: 'string',
      description:
        'Florida county name where the building is located. Examples: "Broward", "Miami-Dade", "Hillsborough", "Orange", "Palm Beach". This is used to determine applicable wind speed maps and HVHZ boundaries per ASCE 7-22 Figure 26.5-1 and Florida Administrative Code 62-6.002.',
      minLength: 1,
      maxLength: 50,
      examples: ['Broward', 'Hillsborough', 'Miami-Dade'],
    },

    isHVHZ: {
      type: 'boolean',
      description:
        'Indicates whether the building location is within a High-Velocity Hurricane Zone (HVHZ). HVHZ areas in Florida are subject to higher wind speeds and stricter building requirements per Florida Administrative Code 62-6.002. Check the current HVHZ boundary map from your county or Florida Division of Emergency Management. HVHZ locations require special wind products with NOA (Notice of Acceptance) approval.',
      examples: [true, false],
    },

    ultimateWindSpeed: {
      type: 'number',
      description:
        'Ultimate wind speed (Vult) in miles per hour for the building location. This is obtained from ASCE 7-22 Figure 26.5-1 (Risk Category II locations) or adjusted for your risk category. For HVHZ locations in Florida, use the HVHZ map wind speeds (typically 140+ mph). For non-HVHZ locations, use the standard ASCE 7-22 Figure 26.5-1. The ultimate wind speed is the 700-year return period wind speed used for components and cladding design.',
      minimum: 85,
      maximum: 300,
      examples: [140, 120, 115],
    },

    exposureCategory: {
      type: 'string',
      enum: ['B', 'C', 'D'],
      description:
        'Exposure category per ASCE 7-22 Section 26.7. Determines how wind speed varies with height based on surrounding terrain. ' +
        '- "B": Urban and suburban areas, wooded areas. Most common for residential buildings in populated areas. ' +
        '- "C": Open terrain with scattered obstructions (grassland, scattered trees). Typical for rural areas. ' +
        '- "D": Flat, open water areas (coastal zones without topographic features). Used for buildings near open water or coastal areas. ' +
        'Check local land use and terrain characteristics within 0.5 miles upwind of the building.',
      examples: ['B', 'C', 'D'],
    },

    meanRoofHeight: {
      type: 'number',
      description:
        'Mean roof height in feet. This is the height to the eave (lower edge) of the roof or the average of the roof ridge heights. Measured from the lowest point of the building at grade to the eave or roof ridge. For pitched roofs, use the average height at the eave. For flat roofs, use the height to the roof edge. Minimum 5 feet, maximum 200 feet. Used to determine velocity pressure (qh) per ASCE 7-22 Section 26.10.',
      minimum: 5,
      maximum: 200,
      examples: [20, 30, 45],
    },

    buildingLength: {
      type: 'number',
      description:
        'Building length in feet, defined as the longest horizontal dimension. This is the distance measured parallel to the dominant wind direction. For rectangular buildings, this is the longer of the two horizontal dimensions. Used to calculate zone end width "a" per ASCE 7-22 Figure 30.3-1. Minimum 5 feet, maximum 1000 feet.',
      minimum: 5,
      maximum: 1000,
      examples: [60, 100, 150],
    },

    buildingWidth: {
      type: 'number',
      description:
        'Building width in feet, defined as the shortest horizontal dimension. This is the distance perpendicular to the dominant wind direction. For rectangular buildings, this is the shorter of the two horizontal dimensions. Also used to calculate zone end width "a" per ASCE 7-22 Figure 30.3-1. Minimum 5 feet, maximum 1000 feet.',
      minimum: 5,
      maximum: 1000,
      examples: [40, 60, 80],
    },

    effectiveWindArea: {
      type: 'number',
      description:
        'Effective wind area in square feet for the component being analyzed. This is the product of the tributary width and height for the element. For doors, this is width × height. For windows, this is the glass area or frame opening area. For wall panels or roof areas, this is the area of the panel. Minimum 1 sq ft (small component), maximum 1000 sq ft (large panel or component). Used to convert pressure to actual wind loads in pounds-force.',
      minimum: 1,
      maximum: 1000,
      examples: [6, 24, 100],
    },

    topographicFactor: {
      type: 'number',
      description:
        'Topographic factor (Kzt) per ASCE 7-22 Section 26.8. Accounts for wind speed-up over hills, ridges, and escarpments. Default value is 1.0 for flat terrain. Use Kzt > 1.0 only if the building is located on the summit or upper half of an isolated hill, ridge, or escarpment where the slope exceeds certain thresholds. Values typically range from 1.0 (no effect) to 1.2 (maximum wind speed-up). Most locations use 1.0. Consult ASCE 7-22 Section 26.8 for detailed guidance.',
      default: 1.0,
      minimum: 0.8,
      maximum: 1.2,
      examples: [1.0, 1.05, 1.1],
    },

    riskCategory: {
      type: 'integer',
      enum: [1, 2, 3, 4],
      description:
        'Risk category per ASCE 7-22 Table 1.5-1. Determines the importance factor (I) for the building. Default is 2 (residential buildings, office buildings, other buildings). ' +
        '- 1: Buildings with low hazard to human life (agricultural buildings, temporary structures). ' +
        '- 2: All buildings except those in categories 1, 3, or 4 (most residential and commercial buildings). ' +
        '- 3: Buildings with substantial hazard to human life (assembly occupancies, schools, hospitals). ' +
        '- 4: Buildings critical for emergency response (fire stations, emergency operations centers, power plants). ' +
        'Default: 2 for typical residential buildings.',
      default: 2,
      examples: [1, 2, 3, 4],
    },

    address: {
      type: 'string',
      description:
        'Project street address or location description for record-keeping and documentation purposes. Not used in calculations but helps track project context. Example: "123 Main St, Orlando, FL 32801".',
      minLength: 0,
      maxLength: 200,
      examples: ['123 Main St, Orlando, FL 32801', '456 Oak Ave, Tampa, FL 33602'],
    },
  },

  examples: [
    {
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

    {
      county: 'Hillsborough',
      isHVHZ: false,
      ultimateWindSpeed: 115,
      exposureCategory: 'C',
      meanRoofHeight: 25,
      buildingLength: 80,
      buildingWidth: 50,
      effectiveWindArea: 6,
      riskCategory: 2,
      address: '456 Oak Ave, Tampa, FL 33602',
    },
  ],
} as const;
