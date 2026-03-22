/**
 * RallyPoint Database Seed Script
 * Arizona-specific test data — Tempe / Phoenix / Maricopa County
 *
 * Run with: pnpm prisma:seed   or   tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with Arizona test data...')

  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.fraudSignal.deleteMany(),
    prisma.organizerUpdate.deleteMany(),
    prisma.moderationFlag.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.engagementEvent.deleteMany(),
    prisma.aISummary.deleteMany(),
    prisma.sourceDocument.deleteMany(),
    prisma.civicItem.deleteMany(),
    prisma.userInterest.deleteMany(),
    prisma.userAddress.deleteMany(),
    prisma.user.deleteMany(),
  ])
  console.log('✅ Cleaned existing data')

  // ==========================================================================
  // USERS
  // ==========================================================================

  const student = await prisma.user.create({
    data: {
      clerkId: 'user_test_student_001',
      email: 'student@asu.edu',
      displayName: 'Alex Martinez',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      role: 'USER',
      onboardingCompleted: true,
    },
  })

  const organizer = await prisma.user.create({
    data: {
      clerkId: 'user_test_organizer_001',
      email: 'organizer@tempe.org',
      displayName: 'Jordan Chen',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
      role: 'ORGANIZER',
      onboardingCompleted: true,
    },
  })

  const admin = await prisma.user.create({
    data: {
      clerkId: 'user_test_admin_001',
      email: 'admin@rallypoint.local',
      displayName: 'Sam Rivera',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sam',
      role: 'ADMIN',
      onboardingCompleted: true,
    },
  })

  console.log('✅ Created 3 users')

  // ==========================================================================
  // USER ADDRESSES
  // ==========================================================================

  await prisma.userAddress.createMany({
    data: [
      {
        userId: student.id,
        rawAddress: '1151 S Forest Ave, Tempe, AZ 85281',
        normalizedAddress: '1151 S Forest Ave, Tempe, AZ 85281',
        latitude: 33.4152, longitude: -111.9315,
        geocodeConfidence: 0.95, city: 'Tempe', state: 'AZ', zip: '85281', county: 'Maricopa',
        districtIds: JSON.parse('["tempe-council-5","az-ld-26","maricopa-county","az-congressional-4"]'),
        jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona', 'ASU'],
        isPrimary: true,
      },
      {
        userId: organizer.id,
        rawAddress: '31 E 5th St, Tempe, AZ 85281',
        normalizedAddress: '31 E 5th St, Tempe, AZ 85281',
        latitude: 33.4269, longitude: -111.9401,
        geocodeConfidence: 0.92, city: 'Tempe', state: 'AZ', zip: '85281', county: 'Maricopa',
        districtIds: JSON.parse('["tempe-council-3","az-ld-26","maricopa-county","az-congressional-4"]'),
        jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
        isPrimary: true,
      },
      {
        userId: admin.id,
        rawAddress: '120 E 1st St, Tempe, AZ 85281',
        normalizedAddress: '120 E 1st St, Tempe, AZ 85281',
        latitude: 33.4255, longitude: -111.9383,
        geocodeConfidence: 0.98, city: 'Tempe', state: 'AZ', zip: '85281', county: 'Maricopa',
        districtIds: JSON.parse('["tempe-council-2","az-ld-26","maricopa-county","az-congressional-4"]'),
        jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
        isPrimary: true,
      },
    ],
  })

  await prisma.userInterest.createMany({
    data: [
      { userId: student.id, category: 'HOUSING' },
      { userId: student.id, category: 'TRANSIT' },
      { userId: student.id, category: 'EDUCATION' },
      { userId: organizer.id, category: 'ENVIRONMENT' },
      { userId: organizer.id, category: 'ZONING' },
      { userId: admin.id, category: 'CITY_SERVICES' },
      { userId: admin.id, category: 'BUDGET' },
    ],
  })

  console.log('✅ Created addresses + interests')

  // ==========================================================================
  // CIVIC ITEMS — TEMPE (original 8)
  // ==========================================================================

  const rentStabilization = await prisma.civicItem.create({
    data: {
      title: 'Tempe Rent Stabilization Ordinance',
      slug: 'tempe-rent-stabilization-ordinance',
      category: 'HOUSING', categories: ['HOUSING'],
      type: 'ORDINANCE', status: 'ACTIVE',
      jurisdiction: 'Tempe',
      jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["tempe-council-1","tempe-council-2","tempe-council-3","tempe-council-4","tempe-council-5","tempe-council-6"]'),
      summary: 'Proposed ordinance to cap annual rent increases at 3% plus inflation for multifamily properties in Tempe. Includes exemptions for new construction and properties under 4 units.',
      fullDescription: 'This ordinance would establish rent stabilization measures to protect Tempe renters from excessive rent increases. The proposal caps annual rent increases at 3% plus the local Consumer Price Index, with exemptions for new construction (15 years), properties fewer than 4 units, and owner-occupied buildings.',
      sourceUrl: 'https://www.tempe.gov/housing-policy',
      deadline: new Date('2026-04-15'),
      targetSupport: 500, currentSupport: 387,
      allowsOnlineSignature: true,
      organizerId: organizer.id, isVerified: true,
      latitude: 33.4255, longitude: -111.9400,
      tags: ['housing', 'rent control', 'affordability', 'tenants'],
    },
  })

  const asuTransit = await prisma.civicItem.create({
    data: {
      title: 'ASU Campus Transit Expansion Petition',
      slug: 'asu-campus-transit-expansion',
      category: 'TRANSIT', categories: ['TRANSIT', 'EDUCATION'],
      type: 'PETITION', status: 'ACTIVE',
      jurisdiction: 'ASU Tempe Campus',
      jurisdictionTags: ['ASU Tempe Campus', 'Tempe', 'Arizona'],
      jurisdictionLevel: 'CAMPUS',
      districtIds: JSON.parse('["tempe-council-5","az-ld-26"]'),
      summary: 'Student-led petition to expand free shuttle routes to cover off-campus student housing areas south of University Drive.',
      deadline: new Date('2026-03-30'),
      targetSupport: 1000, currentSupport: 743,
      allowsOnlineSignature: true,
      organizerId: student.id, isVerified: false,
      latitude: 33.4167, longitude: -111.9298,
      tags: ['transit', 'students', 'asu', 'shuttles'],
    },
  })

  const waterConservation = await prisma.civicItem.create({
    data: {
      title: 'Maricopa County Water Conservation Initiative',
      slug: 'maricopa-water-conservation-initiative',
      category: 'ENVIRONMENT', categories: ['ENVIRONMENT', 'CITY_SERVICES'],
      type: 'BALLOT_INITIATIVE', status: 'ACTIVE',
      jurisdiction: 'Maricopa County',
      jurisdictionTags: ['Maricopa County', 'Arizona'],
      jurisdictionLevel: 'COUNTY',
      districtIds: JSON.parse('["maricopa-county"]'),
      summary: 'Ballot measure to fund water conservation infrastructure and desert landscaping incentives through a 0.1% sales tax increase.',
      sourceUrl: 'https://recorder.maricopa.gov/elections',
      deadline: new Date('2026-11-03'), effectiveDate: new Date('2027-01-01'),
      currentSupport: 0, allowsOnlineSignature: false,
      officialActionUrl: 'https://recorder.maricopa.gov/voterregistration',
      isVerified: true,
      latitude: 33.4484, longitude: -112.0740,
      tags: ['environment', 'water', 'conservation', 'ballot measure'],
    },
  })

  const townLakeDevelopment = await prisma.civicItem.create({
    data: {
      title: 'Tempe Town Lake Mixed-Use Development Public Hearing',
      slug: 'town-lake-mixed-use-development-hearing',
      category: 'ZONING', categories: ['ZONING', 'HOUSING'],
      type: 'PUBLIC_HEARING', status: 'ACTIVE',
      jurisdiction: 'Tempe',
      jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["tempe-council-1","tempe-council-6"]'),
      summary: 'Public hearing on proposed 12-story mixed-use development at Town Lake waterfront. Includes 200 residential units, retail, and public plaza.',
      sourceUrl: 'https://www.tempe.gov/planning',
      deadline: new Date('2026-04-01'), currentSupport: 45,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://www.tempe.gov/public-comment',
      isVerified: true,
      latitude: 33.4309, longitude: -111.9374,
      tags: ['zoning', 'development', 'housing', 'town lake'],
    },
  })

  const tuitionCap = await prisma.civicItem.create({
    data: {
      title: 'Arizona Public University Tuition Cap Bill (HB 2401)',
      slug: 'az-university-tuition-cap-hb2401',
      category: 'EDUCATION', categories: ['EDUCATION', 'BUDGET'],
      type: 'STATE_BILL', status: 'ACTIVE',
      jurisdiction: 'Arizona',
      jurisdictionTags: ['Arizona'],
      jurisdictionLevel: 'STATE',
      districtIds: JSON.parse('["az-ld-26"]'),
      summary: 'State legislation to cap tuition increases at Arizona public universities at 2% annually and expand need-based financial aid.',
      sourceUrl: 'https://apps.azleg.gov/BillStatus/BillOverview/82471',
      deadline: new Date('2026-05-15'), currentSupport: 1203,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://www.azleg.gov/contact/',
      isVerified: true,
      latitude: 33.4484, longitude: -111.9267,
      tags: ['education', 'tuition', 'financial aid', 'state bill'],
    },
  })

  const mentalHealthResources = await prisma.civicItem.create({
    data: {
      title: 'Tempe Union School District Mental Health Resources Vote',
      slug: 'tuhsd-mental-health-resources',
      category: 'HEALTHCARE', categories: ['HEALTHCARE', 'EDUCATION'],
      type: 'SCHOOL_BOARD', status: 'ACTIVE',
      jurisdiction: 'Tempe Union High School District',
      jurisdictionTags: ['Tempe Union High School District', 'Tempe', 'Arizona'],
      jurisdictionLevel: 'DISTRICT',
      districtIds: JSON.parse('["tuhsd"]'),
      summary: 'School board vote to hire 10 additional counselors and 5 social workers to address student mental health needs.',
      sourceUrl: 'https://www.tuhsd.org/board',
      deadline: new Date('2026-03-22'), currentSupport: 156,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://www.tuhsd.org/public-comment',
      isVerified: true,
      latitude: 33.3833, longitude: -111.9400,
      tags: ['mental health', 'schools', 'education', 'healthcare'],
    },
  })

  const bikeLanes = await prisma.civicItem.create({
    data: {
      title: 'Tempe Protected Bike Lane Network Expansion',
      slug: 'tempe-protected-bike-lane-expansion',
      category: 'TRANSIT', categories: ['TRANSIT', 'ENVIRONMENT'],
      type: 'CITY_POLICY', status: 'ACTIVE',
      jurisdiction: 'Tempe',
      jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["tempe-council-2","tempe-council-3","tempe-council-5"]'),
      summary: 'City policy proposal to add 15 miles of protected bike lanes connecting downtown, ASU campus, and residential neighborhoods.',
      sourceUrl: 'https://www.tempe.gov/bike-plan',
      deadline: new Date('2026-06-01'),
      targetSupport: 300, currentSupport: 214,
      allowsOnlineSignature: true,
      organizerId: organizer.id, isVerified: true,
      latitude: 33.4255, longitude: -111.9400,
      tags: ['bikes', 'transit', 'infrastructure', 'safety'],
    },
  })

  const affordableHousing = await prisma.civicItem.create({
    data: {
      title: 'Petition for Affordable Student Housing Near Campus',
      slug: 'affordable-student-housing-petition',
      category: 'HOUSING', categories: ['HOUSING', 'EDUCATION'],
      type: 'PETITION', status: 'ACTIVE',
      jurisdiction: 'Tempe',
      jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona', 'ASU'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["tempe-council-5"]'),
      summary: 'Community petition urging the city to fast-track approval for a 150-unit affordable housing project on Apache Boulevard.',
      deadline: new Date('2026-04-30'),
      targetSupport: 750, currentSupport: 623,
      allowsOnlineSignature: true,
      organizerId: student.id, isVerified: false,
      latitude: 33.4140, longitude: -111.9280,
      tags: ['housing', 'affordability', 'students', 'petition'],
    },
  })

  console.log('✅ Created 8 original civic items')

  // ==========================================================================
  // CIVIC ITEMS — PHOENIX
  // ==========================================================================

  const phoenixMissingMiddle = await prisma.civicItem.create({
    data: {
      title: 'Phoenix Missing Middle Housing Reform Ordinance',
      slug: 'phoenix-missing-middle-housing-reform',
      category: 'HOUSING', categories: ['HOUSING', 'ZONING'],
      type: 'ORDINANCE', status: 'ACTIVE',
      jurisdiction: 'Phoenix',
      jurisdictionTags: ['Phoenix', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["phoenix-district-4","phoenix-district-6"]'),
      summary: 'Proposed zoning reform to legalize duplexes, triplexes, and small apartment buildings in all residential zones citywide, reducing single-family-only restrictions.',
      fullDescription: 'This ordinance would eliminate single-family-only zoning across Phoenix, allowing duplexes, triplexes, and small apartment buildings by right in all residential areas. The goal is to create more affordable housing options and increase density near transit corridors.',
      sourceUrl: 'https://www.phoenix.gov/pdd/housing-policy',
      deadline: new Date('2026-05-20'),
      targetSupport: 2000, currentSupport: 1456,
      allowsOnlineSignature: true,
      organizerId: organizer.id, isVerified: true,
      latitude: 33.4484, longitude: -112.0740,
      tags: ['housing', 'zoning reform', 'density', 'affordability'],
    },
  })

  const phoenixHeatIsland = await prisma.civicItem.create({
    data: {
      title: 'Phoenix Urban Heat Island Mitigation Plan',
      slug: 'phoenix-urban-heat-island-mitigation',
      category: 'ENVIRONMENT', categories: ['ENVIRONMENT', 'CITY_SERVICES'],
      type: 'CITY_POLICY', status: 'ACTIVE',
      jurisdiction: 'Phoenix',
      jurisdictionTags: ['Phoenix', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["maricopa-county"]'),
      summary: 'Comprehensive city plan to plant 100,000 trees, expand shade structures, and increase cool pavement installations to reduce Phoenix summer temperatures by 4°F.',
      fullDescription: 'Phoenix regularly exceeds 115°F in summer. This plan targets the urban heat island effect through a coordinated 10-year strategy: 100,000 new tree plantings in underserved neighborhoods, cool pavement pilot programs, and cool corridor shade structures at bus stops.',
      sourceUrl: 'https://www.phoenix.gov/sustainability',
      deadline: new Date('2026-07-01'),
      currentSupport: 892, allowsOnlineSignature: false,
      officialActionUrl: 'https://www.phoenix.gov/publiccomment',
      isVerified: true,
      latitude: 33.4484, longitude: -112.0740,
      tags: ['environment', 'heat', 'trees', 'climate', 'sustainability'],
    },
  })

  const phoenixCrisisResponse = await prisma.civicItem.create({
    data: {
      title: 'Phoenix Community Crisis Response Initiative',
      slug: 'phoenix-community-crisis-response',
      category: 'PUBLIC_SAFETY', categories: ['PUBLIC_SAFETY', 'HEALTHCARE'],
      type: 'CITY_POLICY', status: 'ACTIVE',
      jurisdiction: 'Phoenix',
      jurisdictionTags: ['Phoenix', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["phoenix-district-1","phoenix-district-7","phoenix-district-8"]'),
      summary: 'Pilot program deploying mental health co-responders alongside Phoenix Police for non-violent mental health crisis calls, reducing unnecessary arrests and ER visits.',
      sourceUrl: 'https://www.phoenix.gov/police/mental-health',
      deadline: new Date('2026-04-15'), currentSupport: 2341,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://www.phoenix.gov/police/contact',
      isVerified: true,
      latitude: 33.4484, longitude: -112.0740,
      tags: ['mental health', 'police reform', 'crisis response', 'public safety'],
    },
  })

  const phoenixSmallBusiness = await prisma.civicItem.create({
    data: {
      title: 'Phoenix Small Business Recovery Grant Program',
      slug: 'phoenix-small-business-recovery-grant',
      category: 'JOBS', categories: ['JOBS', 'BUDGET'],
      type: 'CITY_POLICY', status: 'ACTIVE',
      jurisdiction: 'Phoenix',
      jurisdictionTags: ['Phoenix', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["phoenix-district-5","phoenix-district-6","phoenix-district-7"]'),
      summary: '$15M grant program providing micro-loans and technical assistance to Phoenix small businesses owned by women, veterans, and people of color.',
      sourceUrl: 'https://www.phoenix.gov/econdev',
      deadline: new Date('2026-06-30'), currentSupport: 678,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://www.phoenix.gov/econdev/small-business',
      isVerified: true,
      latitude: 33.4484, longitude: -112.0740,
      tags: ['small business', 'economic development', 'equity', 'grants'],
    },
  })

  const phoenixAntiDiscrimination = await prisma.civicItem.create({
    data: {
      title: 'Phoenix Anti-Discrimination in Employment Ordinance',
      slug: 'phoenix-employment-anti-discrimination',
      category: 'CIVIL_RIGHTS', categories: ['CIVIL_RIGHTS', 'JOBS'],
      type: 'ORDINANCE', status: 'ACTIVE',
      jurisdiction: 'Phoenix',
      jurisdictionTags: ['Phoenix', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["maricopa-county"]'),
      summary: 'Ordinance expanding protected employment categories in Phoenix to include source of income, hair texture and natural hairstyles, and familial status.',
      sourceUrl: 'https://www.phoenix.gov/eeo',
      deadline: new Date('2026-05-01'), currentSupport: 1102,
      allowsOnlineSignature: true,
      officialActionUrl: 'https://www.phoenix.gov/eeo/contact',
      isVerified: true,
      latitude: 33.4484, longitude: -112.0740,
      tags: ['civil rights', 'employment', 'discrimination', 'equity'],
    },
  })

  const phoenixLightRail = await prisma.civicItem.create({
    data: {
      title: 'Phoenix South Mountain Light Rail Extension Referendum',
      slug: 'phoenix-south-mountain-light-rail',
      category: 'TRANSIT', categories: ['TRANSIT'],
      type: 'BALLOT_INITIATIVE', status: 'ACTIVE',
      jurisdiction: 'Phoenix',
      jurisdictionTags: ['Phoenix', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["phoenix-district-7","phoenix-district-8"]'),
      summary: 'Ballot measure to approve $3.2B funding for a 5.5-mile light rail extension connecting South Mountain communities to downtown Phoenix and Sky Harbor Airport.',
      sourceUrl: 'https://www.valleymetro.org/projects',
      deadline: new Date('2026-11-03'),
      currentSupport: 3892, allowsOnlineSignature: false,
      officialActionUrl: 'https://recorder.maricopa.gov/voterregistration',
      isVerified: true,
      latitude: 33.3500, longitude: -112.0600,
      tags: ['light rail', 'transit', 'infrastructure', 'ballot measure'],
    },
  })

  const phoenixReproductiveHealth = await prisma.civicItem.create({
    data: {
      title: 'Phoenix Reproductive Health Access Resolution',
      slug: 'phoenix-reproductive-health-resolution',
      category: 'HEALTHCARE', categories: ['HEALTHCARE', 'CIVIL_RIGHTS'],
      type: 'COUNCIL_VOTE', status: 'ACTIVE',
      jurisdiction: 'Phoenix',
      jurisdictionTags: ['Phoenix', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["maricopa-county"]'),
      summary: 'City council resolution declaring Phoenix a "Reproductive Health Safe Harbor" and directing city resources toward supporting access to contraception and reproductive care.',
      sourceUrl: 'https://www.phoenix.gov/citycouncil',
      deadline: new Date('2026-04-08'), currentSupport: 4201,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://www.phoenix.gov/citycouncil/contact',
      isVerified: true,
      latitude: 33.4484, longitude: -112.0740,
      tags: ['reproductive health', 'healthcare access', 'civil rights'],
    },
  })

  const phoenixParks = await prisma.civicItem.create({
    data: {
      title: 'Phoenix Parks & Recreation Infrastructure Bond',
      slug: 'phoenix-parks-recreation-bond',
      category: 'CITY_SERVICES', categories: ['CITY_SERVICES', 'BUDGET'],
      type: 'BALLOT_INITIATIVE', status: 'ACTIVE',
      jurisdiction: 'Phoenix',
      jurisdictionTags: ['Phoenix', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["maricopa-county"]'),
      summary: '$400M general obligation bond to renovate 200 neighborhood parks, build 5 new recreation centers, and expand splash pads and shaded play areas throughout Phoenix.',
      sourceUrl: 'https://www.phoenix.gov/parks',
      deadline: new Date('2026-11-03'), currentSupport: 2108,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://recorder.maricopa.gov/voterregistration',
      isVerified: true,
      latitude: 33.4484, longitude: -112.0740,
      tags: ['parks', 'recreation', 'infrastructure', 'bond measure'],
    },
  })

  const phoenixArts = await prisma.civicItem.create({
    data: {
      title: 'Phoenix Union Arts & Music Program Restoration',
      slug: 'phoenix-union-arts-restoration',
      category: 'EDUCATION', categories: ['EDUCATION', 'BUDGET'],
      type: 'SCHOOL_BOARD', status: 'ACTIVE',
      jurisdiction: 'Phoenix Union High School District',
      jurisdictionTags: ['Phoenix Union High School District', 'Phoenix', 'Arizona'],
      jurisdictionLevel: 'DISTRICT',
      districtIds: JSON.parse('["phoenix-district-4","phoenix-district-8"]'),
      summary: 'Petition to restore full arts, music, and theater programs cut from Phoenix Union district high schools, funded through Title IV federal education grants.',
      sourceUrl: 'https://www.phoenixunion.org/board',
      deadline: new Date('2026-04-22'),
      targetSupport: 3000, currentSupport: 2677,
      allowsOnlineSignature: true,
      organizerId: organizer.id, isVerified: true,
      latitude: 33.4484, longitude: -112.0740,
      tags: ['arts', 'music', 'education', 'school budget'],
    },
  })

  const phoenixSTR = await prisma.civicItem.create({
    data: {
      title: 'Phoenix Short-Term Rental Licensing Ordinance',
      slug: 'phoenix-short-term-rental-licensing',
      category: 'HOUSING', categories: ['HOUSING', 'ZONING'],
      type: 'ORDINANCE', status: 'ACTIVE',
      jurisdiction: 'Phoenix',
      jurisdictionTags: ['Phoenix', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["maricopa-county"]'),
      summary: 'Ordinance requiring all Airbnb, VRBO, and short-term rental operators to obtain a city license, maintain insurance, and comply with noise and occupancy limits.',
      sourceUrl: 'https://www.phoenix.gov/pdd/short-term-rentals',
      deadline: new Date('2026-06-15'), currentSupport: 987,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://www.phoenix.gov/pdd/contact',
      isVerified: true,
      latitude: 33.4484, longitude: -112.0740,
      tags: ['short-term rentals', 'airbnb', 'housing', 'neighborhood'],
    },
  })

  console.log('✅ Created 10 Phoenix civic items')

  // ==========================================================================
  // CIVIC ITEMS — SCOTTSDALE
  // ==========================================================================

  const scottsdaleADU = await prisma.civicItem.create({
    data: {
      title: 'Scottsdale Accessory Dwelling Unit Expansion Ordinance',
      slug: 'scottsdale-adu-expansion-ordinance',
      category: 'ZONING', categories: ['ZONING', 'HOUSING'],
      type: 'ORDINANCE', status: 'ACTIVE',
      jurisdiction: 'Scottsdale',
      jurisdictionTags: ['Scottsdale', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["scottsdale-district-1"]'),
      summary: 'Proposed ordinance to allow homeowners to build or convert garage apartments, basement units, and backyard cottages (ADUs) in all residential zones without special permits.',
      sourceUrl: 'https://www.scottsdaleaz.gov/planning',
      deadline: new Date('2026-05-10'), currentSupport: 512,
      allowsOnlineSignature: true,
      isVerified: true,
      latitude: 33.4942, longitude: -111.9261,
      tags: ['ADU', 'zoning', 'housing density', 'garage apartments'],
    },
  })

  const scottsdaleDesert = await prisma.civicItem.create({
    data: {
      title: 'Scottsdale Open Space & Desert Preservation Bond',
      slug: 'scottsdale-desert-preservation-bond',
      category: 'ENVIRONMENT', categories: ['ENVIRONMENT'],
      type: 'BALLOT_INITIATIVE', status: 'ACTIVE',
      jurisdiction: 'Scottsdale',
      jurisdictionTags: ['Scottsdale', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["scottsdale-district-1"]'),
      summary: '$180M bond to permanently preserve 5,000 additional acres of Sonoran Desert, expand McDowell Sonoran Preserve, and restore desert riparian habitats.',
      sourceUrl: 'https://www.scottsdaleaz.gov/McDowell-Sonoran-Preserve',
      deadline: new Date('2026-11-03'), currentSupport: 4302,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://recorder.maricopa.gov/voterregistration',
      isVerified: true,
      latitude: 33.5980, longitude: -111.8550,
      tags: ['desert preservation', 'open space', 'Sonoran desert', 'conservation'],
    },
  })

  console.log('✅ Created 2 Scottsdale civic items')

  // ==========================================================================
  // CIVIC ITEMS — MESA
  // ==========================================================================

  const mesaBRT = await prisma.civicItem.create({
    data: {
      title: 'Mesa Bus Rapid Transit Network Expansion',
      slug: 'mesa-bus-rapid-transit-expansion',
      category: 'TRANSIT', categories: ['TRANSIT'],
      type: 'CITY_POLICY', status: 'ACTIVE',
      jurisdiction: 'Mesa',
      jurisdictionTags: ['Mesa', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["mesa-district-3","mesa-district-5"]'),
      summary: 'Plan to add 3 high-frequency bus rapid transit routes in Mesa connecting Mesa Community College, Banner Health facilities, and downtown Mesa light rail to residential areas.',
      sourceUrl: 'https://www.mesaaz.gov/residents/transportation',
      deadline: new Date('2026-06-01'), currentSupport: 789,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://www.mesaaz.gov/residents/transportation/contact',
      isVerified: true,
      latitude: 33.4152, longitude: -111.8315,
      tags: ['bus rapid transit', 'transit', 'mesa', 'public transportation'],
    },
  })

  const mesaMentalHealth = await prisma.civicItem.create({
    data: {
      title: 'Mesa Mental Health Co-Responder Pilot Program',
      slug: 'mesa-mental-health-co-responder',
      category: 'HEALTHCARE', categories: ['HEALTHCARE', 'PUBLIC_SAFETY'],
      type: 'CITY_POLICY', status: 'ACTIVE',
      jurisdiction: 'Mesa',
      jurisdictionTags: ['Mesa', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["mesa-district-1","mesa-district-4"]'),
      summary: 'Pilot embedding licensed mental health clinicians with Mesa Police Department to respond to behavioral health crises, diverting individuals away from jail toward treatment.',
      sourceUrl: 'https://www.mesaaz.gov/residents/public-safety',
      deadline: new Date('2026-05-01'), currentSupport: 1203,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://www.mesaaz.gov/residents/public-safety/police/contact',
      isVerified: true,
      latitude: 33.4152, longitude: -111.8315,
      tags: ['mental health', 'police', 'crisis response', 'diversion'],
    },
  })

  console.log('✅ Created 2 Mesa civic items')

  // ==========================================================================
  // CIVIC ITEMS — ARIZONA STATE
  // ==========================================================================

  const azCleanEnergy = await prisma.civicItem.create({
    data: {
      title: 'Arizona Renewable Energy Standard Act SB 1312',
      slug: 'arizona-renewable-energy-standard-sb1312',
      category: 'ENVIRONMENT', categories: ['ENVIRONMENT'],
      type: 'STATE_BILL', status: 'ACTIVE',
      jurisdiction: 'Arizona',
      jurisdictionTags: ['Arizona'],
      jurisdictionLevel: 'STATE',
      districtIds: JSON.parse('["az-ld-26","az-ld-14"]'),
      summary: 'State bill requiring Arizona utilities to generate 50% of electricity from renewable sources by 2030 and 100% by 2040, with a just transition fund for fossil fuel workers.',
      fullDescription: 'SB 1312 would establish binding renewable energy mandates for Arizona\'s regulated utilities. The bill creates a $500M just transition fund for workers in coal and natural gas industries and mandates rooftop solar incentives for low-income households.',
      sourceUrl: 'https://apps.azleg.gov/BillStatus/BillOverview/91234',
      deadline: new Date('2026-05-15'), currentSupport: 5621,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://www.azleg.gov/contact/',
      isVerified: true,
      latitude: 33.4484, longitude: -112.0965,
      tags: ['renewable energy', 'climate', 'utilities', 'state bill'],
    },
  })

  const azMinimumWage = await prisma.civicItem.create({
    data: {
      title: 'Arizona Minimum Wage Increase Proposition 218',
      slug: 'arizona-minimum-wage-prop-218',
      category: 'JOBS', categories: ['JOBS'],
      type: 'BALLOT_INITIATIVE', status: 'ACTIVE',
      jurisdiction: 'Arizona',
      jurisdictionTags: ['Arizona'],
      jurisdictionLevel: 'STATE',
      districtIds: JSON.parse('["az-ld-26"]'),
      summary: 'Ballot initiative to raise Arizona\'s minimum wage from $14.35 to $17.00 per hour by 2027, then index it annually to inflation, with provisions for tipped workers.',
      sourceUrl: 'https://recorder.maricopa.gov/elections',
      deadline: new Date('2026-11-03'), currentSupport: 8934,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://recorder.maricopa.gov/voterregistration',
      isVerified: true,
      latitude: 33.4484, longitude: -112.0965,
      tags: ['minimum wage', 'workers rights', 'ballot initiative', 'economy'],
    },
  })

  const azVotingRights = await prisma.civicItem.create({
    data: {
      title: 'Arizona Automatic Voter Registration Act HB 2205',
      slug: 'arizona-automatic-voter-registration-hb2205',
      category: 'CIVIL_RIGHTS', categories: ['CIVIL_RIGHTS'],
      type: 'STATE_BILL', status: 'ACTIVE',
      jurisdiction: 'Arizona',
      jurisdictionTags: ['Arizona'],
      jurisdictionLevel: 'STATE',
      districtIds: JSON.parse('["az-ld-26"]'),
      summary: 'Legislation to automatically register eligible Arizonans to vote when interacting with state agencies like the DMV, AHCCCS, and universities, with opt-out provisions.',
      sourceUrl: 'https://apps.azleg.gov/BillStatus/BillOverview/88901',
      deadline: new Date('2026-04-30'), currentSupport: 6723,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://www.azleg.gov/contact/',
      isVerified: true,
      latitude: 33.4484, longitude: -112.0965,
      tags: ['voting rights', 'voter registration', 'civil rights', 'democracy'],
    },
  })

  const azStudentLoans = await prisma.civicItem.create({
    data: {
      title: 'Arizona Student Loan Relief Fund SB 1891',
      slug: 'arizona-student-loan-relief-fund-sb1891',
      category: 'EDUCATION', categories: ['EDUCATION', 'BUDGET'],
      type: 'STATE_BILL', status: 'ACTIVE',
      jurisdiction: 'Arizona',
      jurisdictionTags: ['Arizona'],
      jurisdictionLevel: 'STATE',
      districtIds: JSON.parse('["az-ld-26"]'),
      summary: 'Creates a $200M state fund to offer income-based loan repayment assistance to Arizona graduates who work in the state for at least 3 years after graduation.',
      sourceUrl: 'https://apps.azleg.gov/BillStatus/BillOverview/90112',
      deadline: new Date('2026-05-15'), currentSupport: 4512,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://www.azleg.gov/contact/',
      isVerified: true,
      latitude: 33.4484, longitude: -112.0965,
      tags: ['student loans', 'higher education', 'debt relief', 'graduates'],
    },
  })

  const azPaidLeave = await prisma.civicItem.create({
    data: {
      title: 'Arizona Paid Family & Medical Leave Initiative',
      slug: 'arizona-paid-family-medical-leave',
      category: 'JOBS', categories: ['JOBS', 'HEALTHCARE'],
      type: 'BALLOT_INITIATIVE', status: 'ACTIVE',
      jurisdiction: 'Arizona',
      jurisdictionTags: ['Arizona'],
      jurisdictionLevel: 'STATE',
      districtIds: JSON.parse('["az-ld-26"]'),
      summary: 'Ballot initiative establishing 12 weeks of paid family and medical leave for Arizona workers, funded by a small payroll contribution split between employers and employees.',
      sourceUrl: 'https://recorder.maricopa.gov/elections',
      deadline: new Date('2026-11-03'), currentSupport: 7231,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://recorder.maricopa.gov/voterregistration',
      isVerified: true,
      latitude: 33.4484, longitude: -112.0965,
      tags: ['paid leave', 'workers rights', 'family leave', 'ballot initiative'],
    },
  })

  console.log('✅ Created 5 Arizona state civic items')

  // ==========================================================================
  // CIVIC ITEMS — MARICOPA COUNTY
  // ==========================================================================

  const maricopaChildcare = await prisma.civicItem.create({
    data: {
      title: 'Maricopa County Affordable Childcare Expansion',
      slug: 'maricopa-affordable-childcare-expansion',
      category: 'JOBS', categories: ['JOBS', 'HEALTHCARE'],
      type: 'BALLOT_INITIATIVE', status: 'ACTIVE',
      jurisdiction: 'Maricopa County',
      jurisdictionTags: ['Maricopa County', 'Arizona'],
      jurisdictionLevel: 'COUNTY',
      districtIds: JSON.parse('["maricopa-county"]'),
      summary: 'County ballot measure to fund 10,000 new childcare slots and childcare worker wage supplements through a 0.2% sales tax, prioritizing low-income families on wait lists.',
      sourceUrl: 'https://recorder.maricopa.gov/elections',
      deadline: new Date('2026-11-03'), currentSupport: 5102,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://recorder.maricopa.gov/voterregistration',
      isVerified: true,
      latitude: 33.4484, longitude: -112.0740,
      tags: ['childcare', 'working families', 'early childhood', 'ballot measure'],
    },
  })

  const maricopaFlood = await prisma.civicItem.create({
    data: {
      title: 'Maricopa County Flood Control Infrastructure Bond',
      slug: 'maricopa-flood-control-infrastructure',
      category: 'ENVIRONMENT', categories: ['ENVIRONMENT', 'CITY_SERVICES'],
      type: 'BALLOT_INITIATIVE', status: 'ACTIVE',
      jurisdiction: 'Maricopa County',
      jurisdictionTags: ['Maricopa County', 'Arizona'],
      jurisdictionLevel: 'COUNTY',
      districtIds: JSON.parse('["maricopa-county"]'),
      summary: '$1.2B bond to upgrade Maricopa County\'s aging flood control infrastructure, including detention basins, channel restoration, and early warning systems ahead of intensifying monsoon seasons.',
      sourceUrl: 'https://www.maricopa.gov/fcd',
      deadline: new Date('2026-11-03'), currentSupport: 3421,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://recorder.maricopa.gov/voterregistration',
      isVerified: true,
      latitude: 33.4484, longitude: -112.0740,
      tags: ['flood control', 'infrastructure', 'monsoon', 'county bond'],
    },
  })

  const maricopaCriminalJustice = await prisma.civicItem.create({
    data: {
      title: 'Maricopa County Criminal Justice Reform Initiative',
      slug: 'maricopa-criminal-justice-reform',
      category: 'PUBLIC_SAFETY', categories: ['PUBLIC_SAFETY', 'CIVIL_RIGHTS'],
      type: 'BALLOT_INITIATIVE', status: 'ACTIVE',
      jurisdiction: 'Maricopa County',
      jurisdictionTags: ['Maricopa County', 'Arizona'],
      jurisdictionLevel: 'COUNTY',
      districtIds: JSON.parse('["maricopa-county"]'),
      summary: 'County ballot measure establishing independent oversight of the Maricopa County Sheriff\'s Office, pre-arrest diversion programs, and legal representation funding for low-income defendants.',
      sourceUrl: 'https://recorder.maricopa.gov/elections',
      deadline: new Date('2026-11-03'), currentSupport: 4891,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://recorder.maricopa.gov/voterregistration',
      isVerified: true,
      latitude: 33.4484, longitude: -112.0740,
      tags: ['criminal justice', 'sheriff oversight', 'civil rights', 'diversion'],
    },
  })

  console.log('✅ Created 3 Maricopa County civic items')

  // ==========================================================================
  // CIVIC ITEMS — MORE TEMPE
  // ==========================================================================

  const tempeRevitalization = await prisma.civicItem.create({
    data: {
      title: 'Tempe Downtown Business District Revitalization Plan',
      slug: 'tempe-downtown-revitalization',
      category: 'JOBS', categories: ['JOBS', 'ZONING'],
      type: 'CITY_POLICY', status: 'ACTIVE',
      jurisdiction: 'Tempe',
      jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["tempe-council-3","tempe-council-6"]'),
      summary: 'Multi-year plan to activate vacant storefronts on Mill Avenue, offer rent subsidies for local independent businesses, and create a permanent outdoor market on 5th Street.',
      sourceUrl: 'https://www.tempe.gov/econdev',
      deadline: new Date('2026-06-15'), currentSupport: 445,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://www.tempe.gov/econdev/contact',
      isVerified: true,
      latitude: 33.4270, longitude: -111.9400,
      tags: ['downtown', 'economic development', 'small business', 'Mill Avenue'],
    },
  })

  const tempeBroadband = await prisma.civicItem.create({
    data: {
      title: 'Tempe Universal Broadband Access Initiative',
      slug: 'tempe-universal-broadband',
      category: 'CITY_SERVICES', categories: ['CITY_SERVICES'],
      type: 'CITY_POLICY', status: 'ACTIVE',
      jurisdiction: 'Tempe',
      jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["tempe-council-4","tempe-council-5"]'),
      summary: 'City proposal to build a public fiber internet network in underserved Tempe neighborhoods, offering affordable $30/month service to households earning below 80% AMI.',
      sourceUrl: 'https://www.tempe.gov/technology',
      deadline: new Date('2026-07-01'), currentSupport: 678,
      allowsOnlineSignature: true,
      officialActionUrl: 'https://www.tempe.gov/technology/contact',
      isVerified: true,
      latitude: 33.4255, longitude: -111.9400,
      tags: ['broadband', 'digital equity', 'internet access', 'technology'],
    },
  })

  const tempeParticipatory = await prisma.civicItem.create({
    data: {
      title: 'Tempe Participatory Budgeting Pilot Program',
      slug: 'tempe-participatory-budgeting',
      category: 'BUDGET', categories: ['BUDGET'],
      type: 'CITY_POLICY', status: 'ACTIVE',
      jurisdiction: 'Tempe',
      jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["tempe-council-1","tempe-council-2","tempe-council-3","tempe-council-4","tempe-council-5","tempe-council-6"]'),
      summary: 'Pilot giving Tempe residents direct control over $2M of the city budget, allowing community members to propose and vote on local improvement projects.',
      sourceUrl: 'https://www.tempe.gov/budget',
      deadline: new Date('2026-05-30'), currentSupport: 891,
      allowsOnlineSignature: true,
      officialActionUrl: 'https://www.tempe.gov/budget/participatory',
      isVerified: true,
      latitude: 33.4255, longitude: -111.9400,
      tags: ['participatory budgeting', 'civic engagement', 'democracy', 'community'],
    },
  })

  const tempeSafetyReview = await prisma.civicItem.create({
    data: {
      title: 'Tempe Public Safety Review Board Initiative',
      slug: 'tempe-public-safety-review-board',
      category: 'PUBLIC_SAFETY', categories: ['PUBLIC_SAFETY', 'CIVIL_RIGHTS'],
      type: 'CITY_POLICY', status: 'ACTIVE',
      jurisdiction: 'Tempe',
      jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["tempe-council-1","tempe-council-2","tempe-council-3","tempe-council-4","tempe-council-5","tempe-council-6"]'),
      summary: 'Petition to establish an independent, civilian-led Public Safety Review Board with subpoena power to investigate Tempe Police Department misconduct complaints.',
      deadline: new Date('2026-04-20'),
      targetSupport: 1000, currentSupport: 834,
      allowsOnlineSignature: true,
      organizerId: organizer.id, isVerified: false,
      latitude: 33.4255, longitude: -111.9400,
      tags: ['police accountability', 'oversight', 'civil rights', 'transparency'],
    },
  })

  console.log('✅ Created 4 additional Tempe civic items')
  console.log('✅ Total: 34 civic items created')

  // ==========================================================================
  // AI SUMMARIES
  // ==========================================================================

  await prisma.aISummary.createMany({
    data: [
      {
        civicItemId: rentStabilization.id,
        modelVersion: 'claude-3-5-sonnet-20241022',
        plainSummary: 'This ordinance would limit how much landlords can raise rent each year in Tempe. Under the proposal, rent could only go up by 3% plus the rate of inflation — so if inflation is 2%, rents could increase by a maximum of 5% in one year. The rule would apply to apartment buildings with 4 or more units, but not to new buildings (for their first 15 years). Landlords would have to give tenants 90 days notice before raising rent.',
        whoAffected: 'Tempe renters in apartment complexes and multifamily housing, especially students and working families near ASU. Also impacts landlords and property management companies owning buildings with 4+ units.',
        whatChanges: 'Landlords could no longer raise rent by large amounts in a single year. Renters would get more predictability in housing costs. The city would create an enforcement mechanism to handle violations.',
        whyItMatters: 'Housing costs in Tempe have risen dramatically, outpacing wage growth. Many students and working families struggle to afford rent near ASU and downtown.',
        argumentsFor: JSON.parse('["Protects renters from sudden, unaffordable rent spikes","Provides housing cost stability for students on fixed financial aid","Landlords can still raise rents annually at a predictable rate","90-day notice gives tenants time to plan and budget"]'),
        argumentsAgainst: JSON.parse('["May discourage new apartment construction","Landlords might reduce maintenance if unable to raise rents for repairs","Could reduce rental housing quality over time"]'),
        importantDates: JSON.parse('[{"date":"2026-04-01","description":"Public hearing at Tempe City Hall"},{"date":"2026-04-15","description":"City Council final vote"}]'),
        nextActions: JSON.parse('["Submit public comment online or attend the April 1 hearing","Contact your City Council representative","Sign the online petition to show support"]'),
        categories: ['HOUSING'],
        affectedJurisdictions: ['Tempe', 'Maricopa County'],
      },
      {
        civicItemId: asuTransit.id,
        modelVersion: 'claude-3-5-sonnet-20241022',
        plainSummary: 'This student petition asks ASU to extend free shuttle bus routes to reach more off-campus apartments south of campus. Currently, the Gold and Maroon shuttles stop at the edge of campus, leaving students in apartments along Apache Boulevard without direct access. The petition proposes adding 3 new stops and increasing bus frequency during peak class hours.',
        whoAffected: 'Primarily ASU students living in off-campus apartments south of University Drive — several thousand students who currently walk 15-20 minutes to the nearest shuttle stop.',
        whatChanges: 'ASU Transportation would reroute the Gold and Maroon lines to include three additional stops in the off-campus housing corridor, with more frequent service during peak times.',
        whyItMatters: 'Many students choose off-campus housing for affordability but face transportation challenges. Walking to campus in Arizona summer heat (110°F+) can be dangerous.',
        argumentsFor: JSON.parse('["Improves safety for students walking in extreme heat","Reduces costs for students currently driving or using rideshares","Decreases campus parking demand"]'),
        argumentsAgainst: JSON.parse('["May increase ASU Transportation operating costs","Could slow down routes for students closer to campus","May require additional buses and drivers"]'),
        importantDates: JSON.parse('[{"date":"2026-03-30","description":"Petition delivery deadline to ASU Transportation"}]'),
        nextActions: JSON.parse('["Sign the online petition","Share with students in off-campus housing","Email ASU Transportation to share your transportation challenges"]'),
        categories: ['TRANSIT', 'EDUCATION'],
        affectedJurisdictions: ['ASU Tempe Campus', 'Tempe'],
      },
      {
        civicItemId: waterConservation.id,
        modelVersion: 'claude-3-5-sonnet-20241022',
        plainSummary: 'This ballot measure asks Maricopa County voters to approve a small sales tax increase to fund water conservation programs. If passed, the county sales tax would increase by 0.1% for ten years. The money would fund rainwater collection systems, desert landscaping rebates up to $3,000, and upgraded irrigation at parks. The tax automatically ends after 10 years.',
        whoAffected: 'All Maricopa County residents who pay sales tax. Homeowners and businesses that participate in landscaping rebates benefit directly. Everyone benefits indirectly through improved long-term water security.',
        whatChanges: 'The county would collect an extra one cent on every $10 purchase and fund water efficiency projects. Homeowners could receive rebates for converting grass lawns to desert-friendly plants.',
        whyItMatters: 'Arizona is in a decades-long drought and Colorado River allocations are being cut. Proactive conservation now can prevent a crisis later.',
        argumentsFor: JSON.parse('["Addresses urgent water shortage threatening long-term sustainability","Provides financial help for homeowners wanting to conserve","Tax sunsets automatically in 10 years","Annual public reporting ensures accountability"]'),
        argumentsAgainst: JSON.parse('["Adds cost burden during economic uncertainty","Benefits homeowners more than renters","Some argue agriculture should bear more of the conservation burden"]'),
        importantDates: JSON.parse('[{"date":"2026-08-01","description":"Last day to register to vote"},{"date":"2026-11-03","description":"Election Day"}]'),
        nextActions: JSON.parse('["Register to vote at recorder.maricopa.gov","Attend public information sessions","Vote in the November 2026 election"]'),
        categories: ['ENVIRONMENT', 'CITY_SERVICES'],
        affectedJurisdictions: ['Maricopa County', 'Arizona'],
      },
      {
        civicItemId: tuitionCap.id,
        modelVersion: 'claude-3-5-sonnet-20241022',
        plainSummary: 'This state bill would cap how much ASU, UArizona, and NAU can raise tuition each year. Under HB 2401, universities could only increase annual tuition and fees by 2% — well below recent increases of 5-8%. The bill also creates a $50 million fund for need-based grants and requires universities to maintain current resident admission rates.',
        whoAffected: 'All current and future students at Arizona\'s three public universities. Families planning for college costs. University administrations managing budgets. State taxpayers who fund higher education.',
        whatChanges: 'Annual tuition increases would be legally capped at 2%. Need-based grant funding would expand by $50M. Universities would be required to protect in-state admission slots.',
        whyItMatters: 'Arizona tuition has increased faster than inflation for over a decade. Many qualified students are priced out of public university education or graduate with crippling debt.',
        argumentsFor: JSON.parse('["Makes Arizona universities more affordable for all residents","Protects students on fixed financial aid from sudden tuition spikes","Encourages qualified students to stay in Arizona for college"]'),
        argumentsAgainst: JSON.parse('["Could strain university budgets and affect program quality","Universities may cut financial aid to offset the cap","Could reduce investment in campus infrastructure"]'),
        importantDates: JSON.parse('[{"date":"2026-05-15","description":"Arizona Legislature final vote deadline"}]'),
        nextActions: JSON.parse('["Contact your Arizona state representative and senator","Attend legislative committee hearings","Sign petitions showing student support","Share your personal tuition burden story with legislators"]'),
        categories: ['EDUCATION', 'BUDGET'],
        affectedJurisdictions: ['Arizona'],
      },
      {
        civicItemId: phoenixMissingMiddle.id,
        modelVersion: 'claude-3-5-sonnet-20241022',
        plainSummary: 'This Phoenix ordinance would allow duplexes, triplexes, and small apartment buildings to be built in neighborhoods currently zoned for single-family homes only. Right now, most Phoenix neighborhoods legally forbid anything other than a single house on each lot. This change would let property owners build or convert to housing for 2-4 families — sometimes called "missing middle" housing because it fills the gap between single-family homes and large apartment complexes.',
        whoAffected: 'Phoenix homeowners who could build additional units on their property. Renters seeking more affordable options in well-connected neighborhoods. Developers and contractors who build housing. Current neighborhood residents concerned about density and parking.',
        whatChanges: 'Property owners in previously single-family zones could build duplexes or small apartment buildings by-right, without needing a special variance. This would apply citywide across Phoenix.',
        whyItMatters: 'Phoenix has a severe housing shortage driving up rents. Single-family zoning on 75% of residential land limits the supply of affordable homes. Similar reforms in Minneapolis and Auckland reduced housing costs significantly.',
        argumentsFor: JSON.parse('["Increases housing supply to address critical shortage","Creates more affordable options in walkable, connected areas","Allows multi-generational families to live together","Reduces car dependency by enabling density near transit"]'),
        argumentsAgainst: JSON.parse('["May change neighborhood character residents value","Could increase parking and traffic pressure","Construction noise and disruption during building","May not guarantee affordable pricing without additional subsidies"]'),
        importantDates: JSON.parse('[{"date":"2026-05-20","description":"Phoenix City Council vote deadline"}]'),
        nextActions: JSON.parse('["Attend Phoenix City Council public comment sessions","Contact your Phoenix council representative","Share how housing costs have affected you"]'),
        categories: ['HOUSING', 'ZONING'],
        affectedJurisdictions: ['Phoenix', 'Maricopa County'],
      },
      {
        civicItemId: azMinimumWage.id,
        modelVersion: 'claude-3-5-sonnet-20241022',
        plainSummary: 'This ballot initiative would raise Arizona\'s minimum wage from its current $14.35 per hour to $17.00 per hour by 2027. After reaching $17, the wage would automatically go up each year to keep pace with inflation. The measure also improves protections for tipped workers. Arizona voters would decide this in November 2026.',
        whoAffected: 'Approximately 400,000 low-wage workers in Arizona who earn near minimum wage — including retail, food service, childcare, and gig economy workers. Also affects employers who pay minimum wage, particularly small businesses in the restaurant and service industries.',
        whatChanges: 'The minimum wage increases from $14.35 to $17.00 by 2027. After that, it rises automatically with inflation. Tipped workers would receive stronger protections ensuring they reach the full minimum wage including tips.',
        whyItMatters: 'A full-time worker earning Arizona\'s current minimum wage earns about $29,000 annually — well below the living wage for a single adult in Maricopa County ($42,000). Many minimum wage workers hold multiple jobs to survive.',
        argumentsFor: JSON.parse('["Lifts 400,000+ workers closer to a living wage","Reduces reliance on public assistance programs","Inflation indexing prevents wage erosion over time","Arizona\'s economy can absorb higher wages — similar increases elsewhere showed minimal job loss"]'),
        argumentsAgainst: JSON.parse('["Small businesses, especially restaurants, may cut hours or jobs","Could accelerate automation replacing low-wage workers","May cause price increases for consumers","Statewide floor may be too high for rural Arizona economies"]'),
        importantDates: JSON.parse('[{"date":"2026-10-01","description":"Last day to register to vote"},{"date":"2026-11-03","description":"Election Day"}]'),
        nextActions: JSON.parse('["Register to vote or verify registration","Talk to friends and family about the measure","Attend public forums on minimum wage economics","Volunteer with organizing campaigns if you support it"]'),
        categories: ['JOBS'],
        affectedJurisdictions: ['Arizona'],
      },
      {
        civicItemId: azVotingRights.id,
        modelVersion: 'claude-3-5-sonnet-20241022',
        plainSummary: 'This bill would automatically sign eligible Arizonans up to vote when they interact with state agencies — like the DMV when they get a driver\'s license, or AHCCCS when they apply for health coverage. If you don\'t want to be registered, you can opt out. Currently, Arizonans must actively register to vote; this reverses the default.',
        whoAffected: 'Unregistered eligible voters in Arizona — an estimated 600,000+ people. Particularly impacts young adults, people who recently moved, and communities historically underrepresented in voter rolls. Also affects state agencies required to implement the system.',
        whatChanges: 'State agencies would automatically submit voter registration data to the Secretary of State for eligible applicants. Individuals could opt out. The state would fund a portal for Arizonans to manage their registration status.',
        whyItMatters: 'Arizona has one of the lowest voter registration rates in the country. Automatic registration has increased registration and turnout in 20+ other states without evidence of fraud.',
        argumentsFor: JSON.parse('["Removes bureaucratic barriers to voting for eligible citizens","States with AVR have seen measurable registration and turnout increases","Reduces administrative burden by centralizing voter data","Opt-out protects individual choice"]'),
        argumentsAgainst: JSON.parse('["Some object to government automatically enrolling citizens without explicit consent","Implementation costs for state agencies","Concerns about data accuracy and list maintenance","Some argue the current opt-in system ensures only motivated voters register"]'),
        importantDates: JSON.parse('[{"date":"2026-04-30","description":"Arizona Legislature vote deadline"}]'),
        nextActions: JSON.parse('["Contact your Arizona legislator to express support or opposition","Check your own voter registration status at servicearizona.com","Encourage unregistered friends and family to get registered now"]'),
        categories: ['CIVIL_RIGHTS'],
        affectedJurisdictions: ['Arizona'],
      },
      {
        civicItemId: phoenixCrisisResponse.id,
        modelVersion: 'claude-3-5-sonnet-20241022',
        plainSummary: 'This Phoenix program would send a mental health clinician alongside police officers when responding to calls involving mental health crises — like someone experiencing a breakdown or suicidal thoughts — instead of sending only armed officers. The clinician handles the mental health component while the officer provides safety backup. This is called a "co-responder" model.',
        whoAffected: 'Phoenix residents experiencing mental health crises or addiction struggles. Family members who call 911 for loved ones in mental health emergencies. Phoenix Police officers who currently handle crisis calls without mental health training. Taxpayers who fund emergency services.',
        whatChanges: 'A dedicated team of licensed mental health clinicians would be deployed alongside police for behavioral health calls. Over time, some low-risk mental health calls could be handled by clinicians only, without police.',
        whyItMatters: 'Nearly 1 in 5 police calls in Phoenix involve mental illness. Nationally, people with mental illness are 16x more likely to be killed during a police encounter. Co-responder programs in Eugene, OR and Denver have dramatically reduced arrests and ER visits.',
        argumentsFor: JSON.parse('["Reduces unnecessary criminalization of mental illness","Clinicians better equipped than officers to de-escalate crises","Frees police for violent crime response","Saves money by diverting people from expensive ER and jail stays"]'),
        argumentsAgainst: JSON.parse('["Clinicians may face safety risks in volatile situations","Additional staffing costs for specialized teams","Coordination between mental health and police systems is complex","Some situations may be misclassified as non-violent"]'),
        importantDates: JSON.parse('[{"date":"2026-04-15","description":"Phoenix City Council vote on pilot funding"}]'),
        nextActions: JSON.parse('["Contact your Phoenix city council representative","Attend council public comment on the pilot budget","Share experiences with mental health crisis response in your community"]'),
        categories: ['PUBLIC_SAFETY', 'HEALTHCARE'],
        affectedJurisdictions: ['Phoenix', 'Maricopa County'],
      },
      {
        civicItemId: scottsdaleDesert.id,
        modelVersion: 'claude-3-5-sonnet-20241022',
        plainSummary: 'Scottsdale is asking voters to approve $180 million to permanently protect 5,000 more acres of Sonoran Desert from development. This would expand the McDowell Sonoran Preserve — the largest urban preserve in the United States — and restore desert stream habitats. The money would come from a bond, repaid over 20 years.',
        whoAffected: 'Scottsdale residents who value open space and outdoor recreation. Wildlife depending on connected desert habitat. Hikers, bikers, and equestrians who use the preserve. Future Scottsdale residents who will inherit either developed land or preserved desert.',
        whatChanges: 'The county would acquire 5,000 acres of privately-owned desert land adjacent to the preserve, permanently removing it from development. Stream restoration would improve native wildlife habitat and reduce flooding risk.',
        whyItMatters: 'The Sonoran Desert is one of the most biodiverse deserts on Earth. Metro Phoenix loses 2 acres of desert per hour to development. Once paved, desert ecosystems cannot be restored.',
        argumentsFor: JSON.parse('["Permanently protects irreplaceable Sonoran Desert ecosystem","Expands recreation access for a growing population","Increases property values near preserved open space","Desert preservation attracts tourism and quality employers"]'),
        argumentsAgainst: JSON.parse('["Removes land from the tax base and development potential","Bond debt adds long-term fiscal obligations","Private landowners lose development rights","Some argue private conservation deals are more efficient"]'),
        importantDates: JSON.parse('[{"date":"2026-11-03","description":"Scottsdale election day"}]'),
        nextActions: JSON.parse('["Register to vote in Scottsdale","Visit McDowell Sonoran Preserve to see what you\'re voting on","Attend public presentations on the bond measure"]'),
        categories: ['ENVIRONMENT'],
        affectedJurisdictions: ['Scottsdale', 'Maricopa County'],
      },
      {
        civicItemId: azCleanEnergy.id,
        modelVersion: 'claude-3-5-sonnet-20241022',
        plainSummary: 'This Arizona state bill would require utility companies like APS and SRP to get 50% of their electricity from renewable sources like solar and wind by 2030, and 100% by 2040. Arizona is one of the sunniest states in the country but currently gets most of its electricity from natural gas and nuclear power. The bill also creates a fund to help workers who lose fossil fuel industry jobs.',
        whoAffected: 'All Arizona utility customers who get electricity from regulated companies. Workers in the natural gas and coal industries who face job displacement. Solar and wind energy companies that would benefit from new demand. Future Arizonans who will live with the climate consequences of today\'s energy choices.',
        whatChanges: 'Utilities would be legally required to shift their energy mix to 50% renewables by 2030 and 100% by 2040. A $500M just transition fund would provide retraining and income support for displaced fossil fuel workers. Low-income households would get solar incentives.',
        whyItMatters: 'Arizona\'s electricity sector is the second-largest source of greenhouse gas emissions in the state. Solar power is now cheaper than natural gas in Arizona. Transitioning creates tens of thousands of clean energy jobs.',
        argumentsFor: JSON.parse('["Reduces carbon emissions driving extreme heat in Arizona","Solar is Arizona\'s most abundant natural resource — it makes economic sense","Creates more Arizona jobs than fossil fuels per dollar invested","Just transition fund protects workers during the shift"]'),
        argumentsAgainst: JSON.parse('["Utilities warn of higher electricity costs during transition","100% renewable by 2040 may be technically challenging for grid reliability","Natural gas provides reliable backup that solar and wind cannot always match","Rural Arizona may lack transmission infrastructure for renewables"]'),
        importantDates: JSON.parse('[{"date":"2026-05-15","description":"Arizona Legislature session deadline"}]'),
        nextActions: JSON.parse('["Contact your Arizona state legislators","Attend public utility commission hearings","Calculate your household\'s electricity carbon footprint","Research rooftop solar options if you are a homeowner"]'),
        categories: ['ENVIRONMENT'],
        affectedJurisdictions: ['Arizona'],
      },
      {
        civicItemId: maricopaChildcare.id,
        modelVersion: 'claude-3-5-sonnet-20241022',
        plainSummary: 'This Maricopa County ballot measure would use a small sales tax to fund 10,000 new affordable childcare spots and raise wages for childcare workers. The 0.2% sales tax — two cents on a $10 purchase — would run for 10 years. Families earning below 150% of the federal poverty line ($45,000 for a family of four) would get subsidized slots.',
        whoAffected: 'Families on the 50,000-person waitlist for subsidized childcare in Maricopa County. Childcare workers who earn an average of $13/hour — less than parking lot attendants. Employers who lose workers unable to find affordable childcare. All Maricopa County residents who pay sales tax.',
        whatChanges: 'The county would create 10,000 new subsidized childcare slots over 5 years. Childcare worker wages would increase with new state supplements. A new county office would coordinate provider licensing and quality.',
        whyItMatters: 'Maricopa County has the worst childcare shortage in Arizona. Lack of childcare is cited as the #1 reason parents (especially mothers) cannot work full-time. Childcare costs often exceed rent for families with young children.',
        argumentsFor: JSON.parse('["Enables parents — especially mothers — to re-enter the workforce","Stimulates the economy: every $1 in childcare investment generates $2 in economic activity","Improves early childhood brain development outcomes","Childcare worker wages have been poverty-level for decades"]'),
        argumentsAgainst: JSON.parse('["Additional sales tax is regressive — hits lower-income people harder","Government childcare expansion may disadvantage private providers","10-year tax commitment is a long obligation","Some argue this should be a state or federal responsibility"]'),
        importantDates: JSON.parse('[{"date":"2026-11-03","description":"Maricopa County election day"}]'),
        nextActions: JSON.parse('["Register to vote in Maricopa County","Research your current childcare cost burden","Contact county supervisors to share your experiences","Vote in the November 2026 election"]'),
        categories: ['JOBS', 'HEALTHCARE'],
        affectedJurisdictions: ['Maricopa County', 'Arizona'],
      },
      {
        civicItemId: bikeLanes.id,
        modelVersion: 'claude-3-5-sonnet-20241022',
        plainSummary: 'Tempe is proposing to add 15 miles of protected bike lanes — with physical barriers separating cyclists from car traffic — on major streets connecting ASU, downtown, and residential neighborhoods. These would replace the painted bike lanes that currently exist on some streets. The plan would also add bike signal priority and better connections to the Valley Metro light rail.',
        whoAffected: 'Cyclists who currently avoid Tempe streets due to safety concerns. Students commuting to ASU without a car. Drivers who may experience temporary lane reductions. Local businesses along the planned routes. Tempe residents seeking sustainable transportation options.',
        whatChanges: 'Physical barriers would be installed along University Drive, Mill Avenue, and Rural Road. Cycling signals would be added at key intersections. New connections would link to the Tempe Orbit bus and light rail stations.',
        whyItMatters: 'Cyclist fatalities on Arizona roads have increased 40% since 2018. Protected lanes reduce cycling injuries by up to 90% compared to painted lanes. Tempe has pledged to be carbon neutral by 2035.',
        argumentsFor: JSON.parse('["Protected lanes dramatically reduce cycling injuries and fatalities","Creates a viable car-free commuting option for students and workers","Reduces campus parking demand and traffic congestion","Connects to existing transit for first/last mile trips"]'),
        argumentsAgainst: JSON.parse('["Reduces vehicle lanes which may increase car congestion","Some businesses fear reduced customer access during construction","Maintenance costs for barriers and signals","Low cycling rates in hot climates may not justify the investment"]'),
        importantDates: JSON.parse('[{"date":"2026-06-01","description":"Tempe City Council vote on the bike plan"}]'),
        nextActions: JSON.parse('["Sign the online petition to show support","Attend city council meetings on transportation","Try commuting by bike to experience current conditions","Contact Tempe council members to share your transportation needs"]'),
        categories: ['TRANSIT', 'ENVIRONMENT'],
        affectedJurisdictions: ['Tempe', 'Maricopa County'],
      },
    ],
  })

  console.log('✅ Created 12 AI summaries')

  // ==========================================================================
  // ENGAGEMENT EVENTS
  // ==========================================================================

  await prisma.engagementEvent.createMany({
    data: [
      // Student only has VIEW/SHARE events — no SAVE/SUPPORT so the IS_LOCAL_DEV
      // user (Alex Martinez) starts with a fully-populated swipe queue.
      { userId: student.id, civicItemId: rentStabilization.id, action: 'VIEW', timestamp: new Date('2026-03-01') },
      { userId: student.id, civicItemId: asuTransit.id, action: 'VIEW', timestamp: new Date('2026-03-05') },
      { userId: student.id, civicItemId: asuTransit.id, action: 'SHARE', timestamp: new Date('2026-03-06') },
      { userId: student.id, civicItemId: affordableHousing.id, action: 'VIEW', timestamp: new Date('2026-03-08') },
      { userId: student.id, civicItemId: tuitionCap.id, action: 'VIEW', timestamp: new Date('2026-03-10') },
      { userId: student.id, civicItemId: azStudentLoans.id, action: 'VIEW', timestamp: new Date('2026-03-12') },
      { userId: student.id, civicItemId: azMinimumWage.id, action: 'VIEW', timestamp: new Date('2026-03-13') },
      { userId: student.id, civicItemId: phoenixArts.id, action: 'VIEW', timestamp: new Date('2026-03-14') },

      { userId: organizer.id, civicItemId: waterConservation.id, action: 'VIEW', timestamp: new Date('2026-03-03') },
      { userId: organizer.id, civicItemId: waterConservation.id, action: 'SAVE', timestamp: new Date('2026-03-03') },
      { userId: organizer.id, civicItemId: bikeLanes.id, action: 'VIEW', timestamp: new Date('2026-03-04') },
      { userId: organizer.id, civicItemId: bikeLanes.id, action: 'SUPPORT', timestamp: new Date('2026-03-04') },
      { userId: organizer.id, civicItemId: townLakeDevelopment.id, action: 'VIEW', timestamp: new Date('2026-03-07') },
      { userId: organizer.id, civicItemId: phoenixHeatIsland.id, action: 'VIEW', timestamp: new Date('2026-03-09') },
      { userId: organizer.id, civicItemId: phoenixHeatIsland.id, action: 'SUPPORT', timestamp: new Date('2026-03-09') },
      { userId: organizer.id, civicItemId: scottsdaleDesert.id, action: 'VIEW', timestamp: new Date('2026-03-11') },
      { userId: organizer.id, civicItemId: scottsdaleDesert.id, action: 'SUPPORT', timestamp: new Date('2026-03-12') },
      { userId: organizer.id, civicItemId: azCleanEnergy.id, action: 'VIEW', timestamp: new Date('2026-03-13') },
      { userId: organizer.id, civicItemId: azCleanEnergy.id, action: 'SAVE', timestamp: new Date('2026-03-13') },
      { userId: organizer.id, civicItemId: tempeParticipatory.id, action: 'VIEW', timestamp: new Date('2026-03-15') },
      { userId: organizer.id, civicItemId: tempeParticipatory.id, action: 'SUPPORT', timestamp: new Date('2026-03-15') },

      { userId: admin.id, civicItemId: rentStabilization.id, action: 'VIEW', timestamp: new Date('2026-03-02') },
      { userId: admin.id, civicItemId: mentalHealthResources.id, action: 'VIEW', timestamp: new Date('2026-03-05') },
      { userId: admin.id, civicItemId: mentalHealthResources.id, action: 'SUPPORT', timestamp: new Date('2026-03-05') },
      { userId: admin.id, civicItemId: tuitionCap.id, action: 'VIEW', timestamp: new Date('2026-03-09') },
      { userId: admin.id, civicItemId: tuitionCap.id, action: 'SAVE', timestamp: new Date('2026-03-09') },
      { userId: admin.id, civicItemId: phoenixCrisisResponse.id, action: 'VIEW', timestamp: new Date('2026-03-10') },
      { userId: admin.id, civicItemId: phoenixCrisisResponse.id, action: 'SUPPORT', timestamp: new Date('2026-03-10') },
      { userId: admin.id, civicItemId: maricopaChildcare.id, action: 'VIEW', timestamp: new Date('2026-03-14') },
      { userId: admin.id, civicItemId: maricopaChildcare.id, action: 'SAVE', timestamp: new Date('2026-03-14') },
      { userId: admin.id, civicItemId: azVotingRights.id, action: 'VIEW', timestamp: new Date('2026-03-15') },
      { userId: admin.id, civicItemId: azVotingRights.id, action: 'SUPPORT', timestamp: new Date('2026-03-16') },
    ],
  })

  console.log('✅ Created 38 engagement events')

  // ==========================================================================
  // COMMENTS
  // ==========================================================================

  const c1 = await prisma.comment.create({
    data: {
      authorId: student.id, civicItemId: rentStabilization.id,
      threadType: 'SUPPORT',
      body: 'My rent went up $300/month this year and I almost had to drop out. This ordinance is desperately needed!',
      sanitizedBody: 'My rent went up $300/month this year and I almost had to drop out. This ordinance is desperately needed!',
      status: 'VISIBLE', moderationScore: 0.1, createdAt: new Date('2026-03-02'),
    },
  })
  await prisma.comment.create({
    data: {
      authorId: organizer.id, civicItemId: rentStabilization.id, parentId: c1.id,
      threadType: 'SUPPORT',
      body: 'Thank you for sharing your story. This is exactly why we need these protections.',
      sanitizedBody: 'Thank you for sharing your story. This is exactly why we need these protections.',
      status: 'VISIBLE', moderationScore: 0.05, createdAt: new Date('2026-03-03'),
    },
  })
  await prisma.comment.create({
    data: {
      authorId: admin.id, civicItemId: rentStabilization.id,
      threadType: 'QUESTION',
      body: 'How does this interact with existing lease agreements? Would it apply to renewals only?',
      sanitizedBody: 'How does this interact with existing lease agreements? Would it apply to renewals only?',
      status: 'VISIBLE', moderationScore: 0.02, createdAt: new Date('2026-03-04'),
    },
  })
  await prisma.comment.create({
    data: {
      authorId: student.id, civicItemId: asuTransit.id,
      threadType: 'SUPPORT',
      body: 'This would make a huge difference! I walk 20 minutes to catch the shuttle every day.',
      sanitizedBody: 'This would make a huge difference! I walk 20 minutes to catch the shuttle every day.',
      status: 'VISIBLE', moderationScore: 0.08, createdAt: new Date('2026-03-06'),
    },
  })
  await prisma.comment.create({
    data: {
      authorId: organizer.id, civicItemId: bikeLanes.id,
      threadType: 'EVIDENCE',
      body: 'Studies show protected bike lanes reduce cyclist injuries by 90% vs painted lanes. Tempe needs this.',
      sanitizedBody: 'Studies show protected bike lanes reduce cyclist injuries by 90% vs painted lanes. Tempe needs this.',
      status: 'VISIBLE', moderationScore: 0.01, createdAt: new Date('2026-03-07'),
    },
  })
  await prisma.comment.create({
    data: {
      authorId: admin.id, civicItemId: waterConservation.id,
      threadType: 'CONCERN',
      body: 'I support conservation but am concerned about the tax burden. Can we explore existing budget sources first?',
      sanitizedBody: 'I support conservation but am concerned about the tax burden. Can we explore existing budget sources first?',
      status: 'VISIBLE', moderationScore: 0.15, createdAt: new Date('2026-03-08'),
    },
  })
  await prisma.comment.create({
    data: {
      authorId: student.id, civicItemId: phoenixMissingMiddle.id,
      threadType: 'SUPPORT',
      body: 'As someone who can\'t afford Phoenix rents, more housing options near transit is exactly what this city needs.',
      sanitizedBody: 'As someone who can\'t afford Phoenix rents, more housing options near transit is exactly what this city needs.',
      status: 'VISIBLE', moderationScore: 0.05, createdAt: new Date('2026-03-10'),
    },
  })
  const c8 = await prisma.comment.create({
    data: {
      authorId: organizer.id, civicItemId: azCleanEnergy.id,
      threadType: 'EVIDENCE',
      body: 'Arizona averages 300 sunny days a year. We have more solar potential than almost any state. SB 1312 is a no-brainer.',
      sanitizedBody: 'Arizona averages 300 sunny days a year. We have more solar potential than almost any state. SB 1312 is a no-brainer.',
      status: 'VISIBLE', moderationScore: 0.02, createdAt: new Date('2026-03-12'),
    },
  })
  await prisma.comment.create({
    data: {
      authorId: admin.id, civicItemId: azCleanEnergy.id, parentId: c8.id,
      threadType: 'QUESTION',
      body: 'What happens on cloudy days and nights? Is there a plan for grid storage and backup power?',
      sanitizedBody: 'What happens on cloudy days and nights? Is there a plan for grid storage and backup power?',
      status: 'VISIBLE', moderationScore: 0.04, createdAt: new Date('2026-03-13'),
    },
  })
  await prisma.comment.create({
    data: {
      authorId: student.id, civicItemId: maricopaChildcare.id,
      threadType: 'SUPPORT',
      body: 'My mom had to quit her job because she couldn\'t afford daycare for my little brother. This measure is critical.',
      sanitizedBody: 'My mom had to quit her job because she couldn\'t afford daycare for my little brother. This measure is critical.',
      status: 'VISIBLE', moderationScore: 0.03, createdAt: new Date('2026-03-14'),
    },
  })

  console.log('✅ Created 10 comments')

  // ==========================================================================
  // ORGANIZER UPDATES
  // ==========================================================================

  await prisma.organizerUpdate.create({
    data: {
      civicItemId: rentStabilization.id,
      authorId: organizer.id,
      title: 'City Council Schedules Public Hearing — April 1st',
      body: 'Great news! Tempe City Council has officially scheduled a public hearing for the Rent Stabilization Ordinance on April 1st at 6pm. This is our chance to show up and voice support. The hearing will be held at Tempe City Hall with an option to join virtually. Please mark your calendars and share this update!',
      isVerified: true,
      createdAt: new Date('2026-03-10'),
    },
  })

  await prisma.organizerUpdate.create({
    data: {
      civicItemId: bikeLanes.id,
      authorId: organizer.id,
      title: 'We hit 200 signatures — help us reach 300',
      body: 'We crossed 200 signatures on the protected bike lane petition. The council needs to see 300+ to take this seriously before the June 1 vote. Share with friends, coworkers, and neighbors. Every signature shows Tempe leadership that residents want safer streets.',
      isVerified: true,
      createdAt: new Date('2026-03-12'),
    },
  })

  await prisma.organizerUpdate.create({
    data: {
      civicItemId: phoenixArts.id,
      authorId: organizer.id,
      title: 'Phoenix Union Board Meeting — Come Testify',
      body: 'The Phoenix Union school board meets April 22. We need 50+ people to testify in support of restoring arts programs. Sign up to testify at phoenixunion.org/board — testimony is 2 minutes per person and makes a real difference. Our students deserve arts education.',
      isVerified: true,
      createdAt: new Date('2026-03-15'),
    },
  })

  console.log('✅ Created 3 organizer updates')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📊 Summary:')
  console.log('   - 3 users (student, organizer, admin)')
  console.log('   - 34 civic items across all categories and jurisdictions')
  console.log('   - 12 detailed AI summaries')
  console.log('   - 38 engagement events')
  console.log('   - 10 comments (with nested replies)')
  console.log('   - 3 organizer updates')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
