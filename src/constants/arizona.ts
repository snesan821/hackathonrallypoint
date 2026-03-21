/**
 * Arizona-specific constants for RallyPoint
 * Tempe/Phoenix/Maricopa County deployment
 */

// ============================================================================
// GEOGRAPHIC DEFAULTS
// ============================================================================

/**
 * Default map center (Tempe, AZ)
 */
export const DEFAULT_CENTER = {
  lat: 33.4255,
  lng: -111.9400,
}

/**
 * Map bounds for Tempe/Phoenix metro area
 */
export const METRO_BOUNDS = {
  north: 33.7,
  south: 33.3,
  east: -111.6,
  west: -112.3,
}

// ============================================================================
// JURISDICTIONS
// ============================================================================

export interface Jurisdiction {
  id: string
  name: string
  type: 'city' | 'county' | 'state' | 'district' | 'campus'
  population?: number
  website?: string
}

export const AZ_JURISDICTIONS: Jurisdiction[] = [
  // Cities
  {
    id: 'tempe',
    name: 'Tempe',
    type: 'city',
    population: 180000,
    website: 'https://www.tempe.gov',
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    type: 'city',
    population: 1600000,
    website: 'https://www.phoenix.gov',
  },
  {
    id: 'mesa',
    name: 'Mesa',
    type: 'city',
    population: 500000,
    website: 'https://www.mesaaz.gov',
  },
  {
    id: 'scottsdale',
    name: 'Scottsdale',
    type: 'city',
    population: 250000,
    website: 'https://www.scottsdaleaz.gov',
  },
  {
    id: 'chandler',
    name: 'Chandler',
    type: 'city',
    population: 280000,
    website: 'https://www.chandleraz.gov',
  },

  // County
  {
    id: 'maricopa-county',
    name: 'Maricopa County',
    type: 'county',
    population: 4500000,
    website: 'https://www.maricopa.gov',
  },

  // State
  {
    id: 'arizona',
    name: 'Arizona',
    type: 'state',
    population: 7200000,
    website: 'https://az.gov',
  },

  // Campus
  {
    id: 'asu-tempe',
    name: 'ASU Tempe Campus',
    type: 'campus',
    population: 65000,
    website: 'https://www.asu.edu',
  },

  // School Districts
  {
    id: 'tuhsd',
    name: 'Tempe Union High School District',
    type: 'district',
    website: 'https://www.tuhsd.org',
  },
  {
    id: 'tempe-elementary',
    name: 'Tempe Elementary School District',
    type: 'district',
    website: 'https://www.tempeschools.org',
  },
]

// ============================================================================
// DISTRICTS
// ============================================================================

export interface District {
  id: string
  name: string
  level: 'city-council' | 'state-legislature' | 'congressional' | 'county' | 'school'
  jurisdiction: string
  description?: string
  representative?: string
  boundaries?: string // Description of geographic boundaries
}

export const AZ_DISTRICTS: District[] = [
  // Tempe City Council Districts
  {
    id: 'tempe-council-1',
    name: 'Tempe City Council District 1',
    level: 'city-council',
    jurisdiction: 'tempe',
    description: 'Northwest Tempe',
  },
  {
    id: 'tempe-council-2',
    name: 'Tempe City Council District 2',
    level: 'city-council',
    jurisdiction: 'tempe',
    description: 'Downtown Tempe and Town Lake area',
  },
  {
    id: 'tempe-council-3',
    name: 'Tempe City Council District 3',
    level: 'city-council',
    jurisdiction: 'tempe',
    description: 'North Tempe',
  },
  {
    id: 'tempe-council-4',
    name: 'Tempe City Council District 4',
    level: 'city-council',
    jurisdiction: 'tempe',
    description: 'East Tempe',
  },
  {
    id: 'tempe-council-5',
    name: 'Tempe City Council District 5',
    level: 'city-council',
    jurisdiction: 'tempe',
    description: 'ASU campus area and South Tempe',
  },
  {
    id: 'tempe-council-6',
    name: 'Tempe City Council District 6',
    level: 'city-council',
    jurisdiction: 'tempe',
    description: 'Southwest Tempe',
  },

  // Arizona State Legislative Districts (covering Tempe area)
  {
    id: 'az-ld-26',
    name: 'Arizona Legislative District 26',
    level: 'state-legislature',
    jurisdiction: 'arizona',
    description: 'Covers most of Tempe and parts of Mesa',
  },
  {
    id: 'az-ld-18',
    name: 'Arizona Legislative District 18',
    level: 'state-legislature',
    jurisdiction: 'arizona',
    description: 'Covers parts of Tempe and Chandler',
  },

  // Congressional Districts
  {
    id: 'az-congressional-4',
    name: 'Arizona 4th Congressional District',
    level: 'congressional',
    jurisdiction: 'arizona',
    description: 'Covers Tempe, parts of Phoenix, and surrounding areas',
  },
  {
    id: 'az-congressional-5',
    name: 'Arizona 5th Congressional District',
    level: 'congressional',
    jurisdiction: 'arizona',
    description: 'Covers parts of Phoenix and Scottsdale',
  },

  // County Supervisor Districts
  {
    id: 'maricopa-district-5',
    name: 'Maricopa County Supervisor District 5',
    level: 'county',
    jurisdiction: 'maricopa-county',
    description: 'Covers Tempe and South Scottsdale',
  },

  // School Districts
  {
    id: 'tuhsd',
    name: 'Tempe Union High School District',
    level: 'school',
    jurisdiction: 'tempe',
    description: 'Serves high school students in Tempe',
  },
]

// Helper function to get districts by jurisdiction
export function getDistrictsByJurisdiction(jurisdictionId: string): District[] {
  return AZ_DISTRICTS.filter((d) => d.jurisdiction === jurisdictionId)
}

// Helper function to get district by ID
export function getDistrictById(districtId: string): District | undefined {
  return AZ_DISTRICTS.find((d) => d.id === districtId)
}

// ============================================================================
// ZIP CODE TO DISTRICT MAPPING
// ============================================================================

/**
 * Simplified ZIP code to district mapping for MVP
 * In production, this would be replaced with PostGIS spatial queries
 */
export const ZIP_TO_DISTRICTS: Record<string, string[]> = {
  // Tempe ZIP codes
  '85281': ['tempe-council-5', 'az-ld-26', 'maricopa-district-5', 'az-congressional-4', 'tuhsd'],
  '85282': ['tempe-council-2', 'tempe-council-3', 'az-ld-26', 'maricopa-district-5', 'az-congressional-4'],
  '85283': ['tempe-council-1', 'tempe-council-6', 'az-ld-26', 'maricopa-district-5', 'az-congressional-4'],
  '85284': ['tempe-council-4', 'az-ld-18', 'maricopa-district-5', 'az-congressional-4'],
  '85285': ['tempe-council-5', 'az-ld-26', 'maricopa-district-5', 'az-congressional-4'],

  // Phoenix ZIP codes (partial - near Tempe)
  '85008': ['az-ld-26', 'maricopa-district-5', 'az-congressional-4'],
  '85006': ['az-ld-26', 'maricopa-district-5', 'az-congressional-5'],

  // Mesa ZIP codes (partial - near Tempe)
  '85201': ['az-ld-26', 'maricopa-district-5', 'az-congressional-4'],
  '85204': ['az-ld-26', 'maricopa-district-5', 'az-congressional-4'],
}

/**
 * Look up districts by ZIP code
 */
export function getDistrictsByZip(zipCode: string): string[] {
  return ZIP_TO_DISTRICTS[zipCode] || []
}

// ============================================================================
// REPRESENTATIVES
// ============================================================================

export interface Representative {
  id: string
  name: string
  title: string
  office: string
  districtId?: string
  email?: string
  phone?: string
  website?: string
  photoUrl?: string
}

export const AZ_REPRESENTATIVES: Representative[] = [
  // Tempe City Council (sample)
  {
    id: 'rep-tempe-mayor',
    name: 'Mayor of Tempe',
    title: 'Mayor',
    office: 'Tempe City Hall',
    email: 'mayor@tempe.gov',
    phone: '(480) 350-8110',
    website: 'https://www.tempe.gov/mayor',
  },

  // State Legislature (sample)
  {
    id: 'rep-az-ld26-senator',
    name: 'State Senator - LD 26',
    title: 'State Senator',
    office: 'Arizona State Senate',
    districtId: 'az-ld-26',
    website: 'https://www.azleg.gov',
  },

  // Congressional (sample)
  {
    id: 'rep-az-cd4',
    name: 'U.S. Representative - District 4',
    title: 'U.S. Representative',
    office: 'U.S. House of Representatives',
    districtId: 'az-congressional-4',
  },
]

/**
 * Get representatives for specific district IDs
 */
export function getRepresentativesByDistricts(districtIds: string[]): Representative[] {
  return AZ_REPRESENTATIVES.filter((rep) =>
    rep.districtId ? districtIds.includes(rep.districtId) : false
  )
}

// ============================================================================
// HELPFUL LINKS
// ============================================================================

export const AZ_RESOURCES = {
  voterRegistration: 'https://servicearizona.com/voterRegistration',
  clerkRecorder: 'https://recorder.maricopa.gov',
  legislature: 'https://www.azleg.gov',
  tempeGov: 'https://www.tempe.gov',
  asuGov: 'https://eoss.asu.edu/USG',
}
