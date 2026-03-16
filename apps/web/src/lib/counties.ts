import floridaCounties from '../data/florida-counties.json';

/**
 * Interface for Florida county data
 */
export interface FloridaCounty {
  name: string;
  fipsCode: string;
  isHVHZ: boolean;
  hvhzMinimumWindSpeeds: Record<string, number> | null;
  minimumExposureCategory: string | null;
  acceptsDIYPackages: boolean;
  requiresEngineerStamp: boolean;
  buildingDeptPhone: string;
  buildingDeptUrl: string;
  notes: string;
  region: string;
}

/**
 * Get a county by name (case-insensitive)
 * @param name - County name to search for
 * @returns The county object or undefined if not found
 */
export function getCounty(name: string): FloridaCounty | undefined {
  const normalizedName = name.toLowerCase().trim();
  return floridaCounties.find(
    (county) => county.name.toLowerCase() === normalizedName
  );
}

/**
 * Get all HVHZ (High-Velocity Hurricane Zone) counties
 * @returns Array of HVHZ counties
 */
export function getHVHZCounties(): FloridaCounty[] {
  return floridaCounties.filter((county) => county.isHVHZ);
}

/**
 * Get all Florida counties sorted alphabetically by name
 * @returns Array of all counties sorted alphabetically
 */
export function getAllCounties(): FloridaCounty[] {
  return [...floridaCounties].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

/**
 * Check if a county is in the HVHZ
 * @param countyName - Name of the county to check
 * @returns true if the county is in HVHZ, false otherwise
 */
export function isHVHZ(countyName: string): boolean {
  const county = getCounty(countyName);
  return county ? county.isHVHZ : false;
}

/**
 * Get counties by region
 * @param region - Region name (Central, Southeast, Southwest, Northeast, Northwest, Keys, North Central, West Central)
 * @returns Array of counties in the specified region
 */
export function getCountiesByRegion(region: string): FloridaCounty[] {
  const normalizedRegion = region.toLowerCase().trim();
  return floridaCounties.filter(
    (county) => county.region.toLowerCase() === normalizedRegion
  );
}

/**
 * Get counties that accept DIY packages
 * @returns Array of counties that accept DIY packages
 */
export function getDIYAcceptingCounties(): FloridaCounty[] {
  return floridaCounties.filter((county) => county.acceptsDIYPackages);
}

/**
 * Get counties that require engineer stamps
 * @returns Array of counties that require engineer stamps
 */
export function getEngineerStampCounties(): FloridaCounty[] {
  return floridaCounties.filter((county) => county.requiresEngineerStamp);
}

/**
 * Get the total number of Florida counties
 * @returns Number of counties (should be 67)
 */
export function getCountyCount(): number {
  return floridaCounties.length;
}

/**
 * Get counties by FIPS code
 * @param fipsCode - FIPS code to search for
 * @returns The county object or undefined if not found
 */
export function getCountyByFipsCode(fipsCode: string): FloridaCounty | undefined {
  return floridaCounties.find((county) => county.fipsCode === fipsCode);
}

/**
 * Search counties by partial name match
 * @param searchTerm - Partial or full county name to search for
 * @returns Array of matching counties
 */
export function searchCounties(searchTerm: string): FloridaCounty[] {
  const normalizedTerm = searchTerm.toLowerCase().trim();
  return floridaCounties.filter((county) =>
    county.name.toLowerCase().includes(normalizedTerm)
  );
}

/**
 * Get the minimum wind speed for a county at a specific exposure category
 * @param countyName - Name of the county
 * @param exposureCategory - Exposure category (1, 2, 3, or 4)
 * @returns Minimum wind speed or undefined if not applicable
 */
export function getMinimumWindSpeed(
  countyName: string,
  exposureCategory: string
): number | undefined {
  const county = getCounty(countyName);
  if (!county || !county.hvhzMinimumWindSpeeds) {
    return undefined;
  }
  return county.hvhzMinimumWindSpeeds[exposureCategory];
}

/**
 * Get focus counties (6 major counties: Miami-Dade, Broward, Hillsborough, Palm Beach, Orange, Duval)
 * @returns Array of focus counties
 */
export function getFocusCounties(): FloridaCounty[] {
  const focusCountyNames = [
    'Miami-Dade',
    'Broward',
    'Hillsborough',
    'Palm Beach',
    'Orange',
    'Duval'
  ];
  return floridaCounties.filter((county) =>
    focusCountyNames.includes(county.name)
  );
}

/**
 * Get all unique regions in Florida
 * @returns Array of unique region names
 */
export function getRegions(): string[] {
  const regions = new Set(floridaCounties.map((county) => county.region));
  return Array.from(regions).sort();
}

export default floridaCounties;
