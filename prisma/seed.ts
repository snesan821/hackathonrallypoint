/**
 * RallyPoint Database Seed Script
 * Arizona-specific test data for Tempe/Phoenix/Maricopa County deployment
 *
 * Run with: pnpm prisma:seed or tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with Arizona test data...')

  // Clean existing data
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

  // ===========================================================================
  // USERS
  // ===========================================================================

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

  // ===========================================================================
  // USER ADDRESSES
  // ===========================================================================

  await prisma.userAddress.create({
    data: {
      userId: student.id,
      rawAddress: '1151 S Forest Ave, Tempe, AZ 85281',
      normalizedAddress: '1151 S Forest Ave, Tempe, AZ 85281',
      latitude: 33.4152,
      longitude: -111.9315,
      geocodeConfidence: 0.95,
      city: 'Tempe',
      state: 'AZ',
      zip: '85281',
      county: 'Maricopa',
      districtIds: JSON.parse('["tempe-council-5", "az-ld-26", "maricopa-county", "az-congressional-4"]'),
      jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona', 'ASU'],
      isPrimary: true,
    },
  })

  await prisma.userAddress.create({
    data: {
      userId: organizer.id,
      rawAddress: '31 E 5th St, Tempe, AZ 85281',
      normalizedAddress: '31 E 5th St, Tempe, AZ 85281',
      latitude: 33.4269,
      longitude: -111.9401,
      geocodeConfidence: 0.92,
      city: 'Tempe',
      state: 'AZ',
      zip: '85281',
      county: 'Maricopa',
      districtIds: JSON.parse('["tempe-council-3", "az-ld-26", "maricopa-county", "az-congressional-4"]'),
      jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
      isPrimary: true,
    },
  })

  await prisma.userAddress.create({
    data: {
      userId: admin.id,
      rawAddress: '120 E 1st St, Tempe, AZ 85281',
      normalizedAddress: '120 E 1st St, Tempe, AZ 85281',
      latitude: 33.4255,
      longitude: -111.9383,
      geocodeConfidence: 0.98,
      city: 'Tempe',
      state: 'AZ',
      zip: '85281',
      county: 'Maricopa',
      districtIds: JSON.parse('["tempe-council-2", "az-ld-26", "maricopa-county", "az-congressional-4"]'),
      jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
      isPrimary: true,
    },
  })

  console.log('✅ Created 3 user addresses')

  // ===========================================================================
  // USER INTERESTS
  // ===========================================================================

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

  console.log('✅ Created user interests')

  // ===========================================================================
  // CIVIC ITEMS
  // ===========================================================================

  const rentStabilization = await prisma.civicItem.create({
    data: {
      title: 'Tempe Rent Stabilization Ordinance',
      slug: 'tempe-rent-stabilization-ordinance',
      category: 'HOUSING',
      categories: ['HOUSING'],
      type: 'ORDINANCE',
      status: 'ACTIVE',
      jurisdiction: 'Tempe',
      jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["tempe-council-1", "tempe-council-2", "tempe-council-3", "tempe-council-4", "tempe-council-5", "tempe-council-6"]'),
      summary: 'Proposed ordinance to cap annual rent increases at 3% plus inflation for multifamily properties in Tempe. Includes exemptions for new construction and properties under 4 units.',
      fullDescription: 'This ordinance would establish rent stabilization measures to protect Tempe renters from excessive rent increases. The proposal caps annual rent increases at 3% plus the local Consumer Price Index, with exemptions for new construction (15 years), properties with fewer than 4 units, and owner-occupied buildings. Landlords would be required to provide 90-day notice of rent increases and justification for increases above 5%.',
      sourceUrl: 'https://www.tempe.gov/housing-policy',
      deadline: new Date('2026-04-15'),
      targetSupport: 500,
      currentSupport: 387,
      allowsOnlineSignature: true,
      organizerId: organizer.id,
      isVerified: true,
      latitude: 33.4255,
      longitude: -111.9400,
      tags: ['housing', 'rent control', 'affordability', 'tenants'],
    },
  })

  const asuTransit = await prisma.civicItem.create({
    data: {
      title: 'ASU Campus Transit Expansion Petition',
      slug: 'asu-campus-transit-expansion',
      category: 'TRANSIT',
      categories: ['TRANSIT', 'EDUCATION'],
      type: 'PETITION',
      status: 'ACTIVE',
      jurisdiction: 'ASU Tempe Campus',
      jurisdictionTags: ['ASU Tempe Campus', 'Tempe', 'Arizona'],
      jurisdictionLevel: 'CAMPUS',
      districtIds: JSON.parse('["tempe-council-5", "az-ld-26"]'),
      summary: 'Student-led petition to expand free shuttle routes to cover off-campus student housing areas south of University Drive.',
      fullDescription: 'This petition calls on ASU Transportation to extend the Gold and Maroon shuttle routes to serve the high-density student housing corridor along Apache Boulevard and Rural Road. The proposed expansion would add 3 stops and reduce wait times during peak hours.',
      deadline: new Date('2026-03-30'),
      targetSupport: 1000,
      currentSupport: 743,
      allowsOnlineSignature: true,
      organizerId: student.id,
      isVerified: false,
      latitude: 33.4167,
      longitude: -111.9298,
      tags: ['transit', 'students', 'asu', 'shuttles'],
    },
  })

  const waterConservation = await prisma.civicItem.create({
    data: {
      title: 'Maricopa County Water Conservation Initiative',
      slug: 'maricopa-water-conservation-initiative',
      category: 'ENVIRONMENT',
      categories: ['ENVIRONMENT', 'CITY_SERVICES'],
      type: 'BALLOT_INITIATIVE',
      status: 'ACTIVE',
      jurisdiction: 'Maricopa County',
      jurisdictionTags: ['Maricopa County', 'Arizona'],
      jurisdictionLevel: 'COUNTY',
      districtIds: JSON.parse('["maricopa-county"]'),
      summary: 'Ballot measure to fund water conservation infrastructure and desert landscaping incentives through a 0.1% sales tax increase.',
      fullDescription: 'Proposition 101 would establish a dedicated fund for water conservation projects including rainwater harvesting systems, efficient irrigation infrastructure, and rebates for homeowners converting to drought-resistant landscaping. The measure includes sunset provisions after 10 years and annual public reporting requirements.',
      sourceUrl: 'https://recorder.maricopa.gov/elections',
      deadline: new Date('2026-11-03'),
      effectiveDate: new Date('2027-01-01'),
      targetSupport: null,
      currentSupport: 0,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://recorder.maricopa.gov/voterregistration',
      isVerified: true,
      latitude: 33.4484,
      longitude: -112.0740,
      tags: ['environment', 'water', 'conservation', 'ballot measure'],
    },
  })

  const townLakeDevelopment = await prisma.civicItem.create({
    data: {
      title: 'Tempe Town Lake Mixed-Use Development Public Hearing',
      slug: 'town-lake-mixed-use-development-hearing',
      category: 'ZONING',
      categories: ['ZONING', 'HOUSING'],
      type: 'PUBLIC_HEARING',
      status: 'ACTIVE',
      jurisdiction: 'Tempe',
      jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["tempe-council-1", "tempe-council-6"]'),
      summary: 'Public hearing on proposed 12-story mixed-use development at Town Lake waterfront. Includes 200 residential units, retail, and public plaza.',
      fullDescription: 'Developer proposes a 12-story building with 200 residential units (20% affordable), ground-floor retail, and a half-acre public plaza. The hearing will address height variance requests, parking requirements, and public access to the waterfront.',
      sourceUrl: 'https://www.tempe.gov/planning',
      deadline: new Date('2026-04-01'),
      targetSupport: null,
      currentSupport: 45,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://www.tempe.gov/public-comment',
      isVerified: true,
      latitude: 33.4309,
      longitude: -111.9374,
      tags: ['zoning', 'development', 'housing', 'town lake'],
    },
  })

  const tuitionCap = await prisma.civicItem.create({
    data: {
      title: 'Arizona Public University Tuition Cap Bill (HB 2401)',
      slug: 'az-university-tuition-cap-hb2401',
      category: 'EDUCATION',
      categories: ['EDUCATION', 'BUDGET'],
      type: 'STATE_BILL',
      status: 'ACTIVE',
      jurisdiction: 'Arizona',
      jurisdictionTags: ['Arizona'],
      jurisdictionLevel: 'STATE',
      districtIds: JSON.parse('["az-ld-26"]'),
      summary: 'State legislation to cap tuition increases at Arizona public universities at 2% annually and expand need-based financial aid.',
      fullDescription: 'House Bill 2401 would limit annual tuition and fee increases to 2% at ASU, UArizona, and NAU. The bill also establishes a $50 million fund for need-based grants and requires universities to maintain current resident admission rates.',
      sourceUrl: 'https://apps.azleg.gov/BillStatus/BillOverview/82471',
      deadline: new Date('2026-05-15'),
      targetSupport: null,
      currentSupport: 1203,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://www.azleg.gov/contact/',
      isVerified: true,
      latitude: 33.4484,
      longitude: -111.9267,
      tags: ['education', 'tuition', 'financial aid', 'state bill'],
    },
  })

  const mentalHealthResources = await prisma.civicItem.create({
    data: {
      title: 'Tempe Union School District Mental Health Resources Vote',
      slug: 'tuhsd-mental-health-resources',
      category: 'HEALTHCARE',
      categories: ['HEALTHCARE', 'EDUCATION'],
      type: 'SCHOOL_BOARD',
      status: 'ACTIVE',
      jurisdiction: 'Tempe Union High School District',
      jurisdictionTags: ['Tempe Union High School District', 'Tempe', 'Arizona'],
      jurisdictionLevel: 'DISTRICT',
      districtIds: JSON.parse('["tuhsd"]'),
      summary: 'School board vote to hire 10 additional counselors and 5 social workers to address student mental health needs.',
      fullDescription: 'The Tempe Union High School District board will vote on expanding mental health support staff. The proposal allocates $1.2M from the district reserve to hire 10 counselors and 5 licensed social workers, reducing the student-to-counselor ratio from 450:1 to 300:1.',
      sourceUrl: 'https://www.tuhsd.org/board',
      deadline: new Date('2026-03-22'),
      targetSupport: null,
      currentSupport: 156,
      allowsOnlineSignature: false,
      officialActionUrl: 'https://www.tuhsd.org/public-comment',
      isVerified: true,
      latitude: 33.3833,
      longitude: -111.9400,
      tags: ['mental health', 'schools', 'education', 'healthcare'],
    },
  })

  const bikeLanes = await prisma.civicItem.create({
    data: {
      title: 'Tempe Protected Bike Lane Network Expansion',
      slug: 'tempe-protected-bike-lane-expansion',
      category: 'TRANSIT',
      categories: ['TRANSIT', 'ENVIRONMENT'],
      type: 'CITY_POLICY',
      status: 'ACTIVE',
      jurisdiction: 'Tempe',
      jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["tempe-council-2", "tempe-council-3", "tempe-council-5"]'),
      summary: 'City policy proposal to add 15 miles of protected bike lanes connecting downtown, ASU campus, and residential neighborhoods.',
      fullDescription: 'Comprehensive bike infrastructure plan to install protected bike lanes on University Drive, Mill Avenue, and Rural Road. Includes bike signal priority, dedicated intersection crossings, and connections to the Tempe Orbit and Valley Metro light rail.',
      sourceUrl: 'https://www.tempe.gov/bike-plan',
      deadline: new Date('2026-06-01'),
      targetSupport: 300,
      currentSupport: 214,
      allowsOnlineSignature: true,
      organizerId: organizer.id,
      isVerified: true,
      latitude: 33.4255,
      longitude: -111.9400,
      tags: ['bikes', 'transit', 'infrastructure', 'safety'],
    },
  })

  const affordableHousing = await prisma.civicItem.create({
    data: {
      title: 'Petition for Affordable Student Housing Near Campus',
      slug: 'affordable-student-housing-petition',
      category: 'HOUSING',
      categories: ['HOUSING', 'EDUCATION'],
      type: 'PETITION',
      status: 'ACTIVE',
      jurisdiction: 'Tempe',
      jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona', 'ASU'],
      jurisdictionLevel: 'CITY',
      districtIds: JSON.parse('["tempe-council-5"]'),
      summary: 'Community petition urging the city to fast-track approval for a 150-unit affordable housing project on Apache Boulevard.',
      fullDescription: 'Student advocacy groups are petitioning Tempe City Council to expedite zoning approval for a proposed 150-unit affordable housing development. The project would provide units at 60% of area median income for students and working families.',
      deadline: new Date('2026-04-30'),
      targetSupport: 750,
      currentSupport: 623,
      allowsOnlineSignature: true,
      organizerId: student.id,
      isVerified: false,
      latitude: 33.4140,
      longitude: -111.9280,
      tags: ['housing', 'affordability', 'students', 'petition'],
    },
  })

  console.log('✅ Created 8 civic items')

  // ===========================================================================
  // AI SUMMARIES (for 3 items)
  // ===========================================================================

  await prisma.aISummary.create({
    data: {
      civicItemId: rentStabilization.id,
      modelVersion: 'claude-3-5-sonnet-20241022',
      plainSummary: 'This ordinance would limit how much landlords can raise rent each year in Tempe. Under the proposal, rent could only go up by 3% plus the rate of inflation. This means if inflation is 2%, rents could increase by a maximum of 5% in one year. The rule would apply to apartment buildings with 4 or more units, but not to new buildings (for their first 15 years) or smaller properties. Landlords would have to give tenants 90 days notice before raising rent and explain why if the increase is more than 5%.',
      whoAffected: 'This primarily affects Tempe renters in apartment complexes and multifamily housing, especially students and working families. It also impacts landlords and property management companies who own buildings with 4+ units. ASU students living off-campus would be significantly affected, as many live in the covered apartment complexes near campus.',
      whatChanges: 'If passed, landlords could no longer raise rent by large amounts in a single year. Renters would get more predictability in their housing costs. Landlords would need to provide earlier notice and justification for rent increases. The city would create an enforcement mechanism to handle complaints about violations.',
      whyItMatters: 'Housing costs in Tempe have risen dramatically in recent years, outpacing wage growth. Many students and working families struggle to afford rent near ASU and downtown. Opponents argue rent control could discourage new housing development and property maintenance. Supporters say it protects vulnerable renters from displacement.',
      argumentsFor: JSON.parse('["Protects renters from sudden, unaffordable rent spikes that force displacement", "Provides housing cost stability for students on fixed financial aid budgets", "Similar policies in other cities have prevented mass displacement during housing crises", "Landlords can still raise rents annually, just at a more predictable rate", "90-day notice requirement gives tenants time to plan and budget"]'),
      argumentsAgainst: JSON.parse('["May discourage new apartment construction in Tempe", "Landlords might reduce property maintenance if unable to raise rents for repairs", "Could create rental market distortions and reduce housing quality", "Exemptions for small landlords create unequal treatment", "May not address root cause of housing shortage - need more supply"]'),
      importantDates: JSON.parse('[{"date":"2026-03-15","description":"City Council public comment period opens"},{"date":"2026-04-01","description":"Public hearing at Tempe City Hall"},{"date":"2026-04-15","description":"City Council final vote"}]'),
      nextActions: JSON.parse('["Submit public comment online or attend the April 1 hearing", "Contact your City Council representative about your position", "Sign the online petition to show support or opposition", "Share factual information about the ordinance with neighbors", "Attend community forums to learn more about housing policy"]'),
      categories: ['HOUSING'],
      affectedJurisdictions: ['Tempe', 'Maricopa County', 'Arizona'],
    },
  })

  await prisma.aISummary.create({
    data: {
      civicItemId: asuTransit.id,
      modelVersion: 'claude-3-5-sonnet-20241022',
      plainSummary: 'This student petition asks ASU to extend free shuttle bus routes to reach more off-campus apartments south of campus. Currently, the Gold and Maroon shuttle routes stop at the edge of campus, leaving students in apartments along Apache Boulevard and Rural Road without direct shuttle access. The petition proposes adding 3 new stops and increasing bus frequency during busy times of day when students are traveling to class.',
      whoAffected: 'Primarily affects ASU students living in off-campus apartments south of University Drive, especially in the high-density housing area near Rural Road and Apache Boulevard. This includes several thousand students who currently walk 15-20 minutes to catch a shuttle or pay for alternative transportation.',
      whatChanges: 'If approved, ASU Transportation would reroute the Gold and Maroon lines to include three additional stops in the off-campus housing corridor. Buses would run more frequently during peak class times (7-10am and 4-7pm). Students in these apartments would gain direct shuttle access instead of walking to campus first.',
      whyItMatters: 'Many students choose off-campus housing for affordability but then face transportation challenges. The walk to campus can be difficult in Arizona summer heat (110°F+). Some students miss classes due to long walking times. Better transit access could reduce car traffic and parking demand on campus.',
      argumentsFor: JSON.parse('["Improves safety for students walking in extreme heat and after dark", "Reduces transportation costs for students who currently drive or use rideshares", "Decreases campus parking demand and traffic congestion", "Similar extensions at other university campuses have proven successful", "Shuttle infrastructure already exists, just needs route modification"]'),
      argumentsAgainst: JSON.parse('["May increase ASU Transportation operating costs significantly", "Could slow down routes for students living closer to campus", "Some apartment complexes might benefit more than others", "ASU might argue off-campus transit is a city responsibility", "May require additional buses and drivers to maintain frequency"]'),
      importantDates: JSON.parse('[{"date":"2026-03-30","description":"Petition delivery deadline to ASU Transportation"},{"date":"2026-04-15","description":"Expected response from ASU Transportation"}]'),
      nextActions: JSON.parse('["Sign the online petition if you support the expansion", "Share the petition with students in off-campus housing", "Attend the ASU Undergraduate Student Government meeting to voice support", "Email ASU Transportation directly to share your transportation challenges", "Join student transit advocacy group meetings"]'),
      categories: ['TRANSIT', 'EDUCATION'],
      affectedJurisdictions: ['ASU Tempe Campus', 'Tempe', 'Arizona'],
    },
  })

  await prisma.aISummary.create({
    data: {
      civicItemId: waterConservation.id,
      modelVersion: 'claude-3-5-sonnet-20241022',
      plainSummary: 'This ballot measure asks Maricopa County voters to approve a small sales tax increase to fund water conservation programs. If passed, the county sales tax would increase by 0.1% (one-tenth of one percent) for ten years. The money raised would pay for projects like rainwater collection systems, more efficient irrigation for parks and landscaping, and cash rebates for homeowners who replace grass lawns with desert-friendly plants. The tax would automatically end after 10 years unless voters renew it.',
      whoAffected: 'All Maricopa County residents would pay the small sales tax increase when making purchases. Homeowners and businesses that participate in the landscaping rebate program would directly benefit. Everyone benefits indirectly through improved water security and lower long-term water costs.',
      whatChanges: 'If approved, the county would collect an additional one cent on every $10 purchase. This revenue would fund: rebates up to $3,000 for desert landscaping conversions, rainwater harvesting system installations at public buildings and schools, upgraded irrigation systems in county parks, and grants for community water conservation projects. The county would publish an annual report showing how the money was spent.',
      whyItMatters: 'Arizona is in a decades-long drought and Colorado River water allocations are being cut. Maricopa County needs to reduce water usage to ensure long-term water security. Traditional grass lawns use enormous amounts of water in the desert climate. This measure aims to proactively address water scarcity before it becomes a crisis.',
      argumentsFor: JSON.parse('["Addresses urgent water shortage threatening long-term regional sustainability", "Provides financial help for homeowners who want to conserve but can\'t afford conversion costs", "Creates green jobs in landscaping and water infrastructure", "Tax sunsets automatically in 10 years, not permanent", "Annual public reporting ensures accountability and transparency"]'),
      argumentsAgainst: JSON.parse('["Adds to cost burden during times of economic uncertainty", "Some residents may never use the rebate programs but still pay the tax", "Could be seen as government overreach into private landscaping choices", "Benefits homeowners more than renters who can\'t make landscaping decisions", "Some argue water conservation should come from large agriculture users, not residents"]'),
      importantDates: JSON.parse('[{"date":"2026-08-01","description":"Last day to register to vote for November election"},{"date":"2026-10-28","description":"Early voting begins"},{"date":"2026-11-03","description":"Election Day"}]'),
      nextActions: JSON.parse('["Register to vote or verify registration at recorder.maricopa.gov", "Research water usage statistics and drought projections for Arizona", "Attend public information sessions about the measure", "Calculate how the 0.1% tax would affect your personal budget", "Vote in the November 2026 election"]'),
      categories: ['ENVIRONMENT', 'CITY_SERVICES'],
      affectedJurisdictions: ['Maricopa County', 'Arizona'],
    },
  })

  console.log('✅ Created 3 AI summaries')

  // ===========================================================================
  // ENGAGEMENT EVENTS
  // ===========================================================================

  await prisma.engagementEvent.createMany({
    data: [
      // Student engagements
      { userId: student.id, civicItemId: rentStabilization.id, action: 'VIEW', timestamp: new Date('2026-03-01') },
      { userId: student.id, civicItemId: rentStabilization.id, action: 'SAVE', timestamp: new Date('2026-03-01') },
      { userId: student.id, civicItemId: rentStabilization.id, action: 'SUPPORT', timestamp: new Date('2026-03-02') },
      { userId: student.id, civicItemId: asuTransit.id, action: 'VIEW', timestamp: new Date('2026-03-05') },
      { userId: student.id, civicItemId: asuTransit.id, action: 'SUPPORT', timestamp: new Date('2026-03-05') },
      { userId: student.id, civicItemId: asuTransit.id, action: 'SHARE', timestamp: new Date('2026-03-06') },
      { userId: student.id, civicItemId: affordableHousing.id, action: 'VIEW', timestamp: new Date('2026-03-08') },
      { userId: student.id, civicItemId: affordableHousing.id, action: 'SUPPORT', timestamp: new Date('2026-03-08') },

      // Organizer engagements
      { userId: organizer.id, civicItemId: waterConservation.id, action: 'VIEW', timestamp: new Date('2026-03-03') },
      { userId: organizer.id, civicItemId: waterConservation.id, action: 'SAVE', timestamp: new Date('2026-03-03') },
      { userId: organizer.id, civicItemId: bikeLanes.id, action: 'VIEW', timestamp: new Date('2026-03-04') },
      { userId: organizer.id, civicItemId: bikeLanes.id, action: 'SUPPORT', timestamp: new Date('2026-03-04') },
      { userId: organizer.id, civicItemId: townLakeDevelopment.id, action: 'VIEW', timestamp: new Date('2026-03-07') },

      // Admin engagements
      { userId: admin.id, civicItemId: rentStabilization.id, action: 'VIEW', timestamp: new Date('2026-03-02') },
      { userId: admin.id, civicItemId: mentalHealthResources.id, action: 'VIEW', timestamp: new Date('2026-03-05') },
      { userId: admin.id, civicItemId: mentalHealthResources.id, action: 'SUPPORT', timestamp: new Date('2026-03-05') },
      { userId: admin.id, civicItemId: tuitionCap.id, action: 'VIEW', timestamp: new Date('2026-03-09') },
      { userId: admin.id, civicItemId: tuitionCap.id, action: 'SAVE', timestamp: new Date('2026-03-09') },
    ],
  })

  console.log('✅ Created 18 engagement events')

  // ===========================================================================
  // COMMENTS
  // ===========================================================================

  const comment1 = await prisma.comment.create({
    data: {
      authorId: student.id,
      civicItemId: rentStabilization.id,
      threadType: 'SUPPORT',
      body: 'My rent went up $300/month this year and I almost had to drop out of school. This ordinance is desperately needed!',
      sanitizedBody: 'My rent went up $300/month this year and I almost had to drop out of school. This ordinance is desperately needed!',
      status: 'VISIBLE',
      moderationScore: 0.1,
      createdAt: new Date('2026-03-02'),
    },
  })

  await prisma.comment.create({
    data: {
      authorId: organizer.id,
      civicItemId: rentStabilization.id,
      parentId: comment1.id,
      threadType: 'SUPPORT',
      body: 'Thank you for sharing your story. This is exactly why we need these protections.',
      sanitizedBody: 'Thank you for sharing your story. This is exactly why we need these protections.',
      status: 'VISIBLE',
      moderationScore: 0.05,
      createdAt: new Date('2026-03-03'),
    },
  })

  const comment3 = await prisma.comment.create({
    data: {
      authorId: admin.id,
      civicItemId: rentStabilization.id,
      threadType: 'QUESTION',
      body: 'How does this interact with existing lease agreements? Would it apply to renewals only?',
      sanitizedBody: 'How does this interact with existing lease agreements? Would it apply to renewals only?',
      status: 'VISIBLE',
      moderationScore: 0.02,
      createdAt: new Date('2026-03-04'),
    },
  })

  await prisma.comment.create({
    data: {
      authorId: student.id,
      civicItemId: asuTransit.id,
      threadType: 'SUPPORT',
      body: 'This would make a huge difference! I walk 20 minutes to catch the shuttle every day.',
      sanitizedBody: 'This would make a huge difference! I walk 20 minutes to catch the shuttle every day.',
      status: 'VISIBLE',
      moderationScore: 0.08,
      createdAt: new Date('2026-03-06'),
    },
  })

  await prisma.comment.create({
    data: {
      authorId: organizer.id,
      civicItemId: bikeLanes.id,
      threadType: 'EVIDENCE',
      body: 'Studies show protected bike lanes reduce cyclist injuries by 90% compared to painted lanes. Source: https://www.sciencedirect.com/science/article/pii/S2214140518301488',
      sanitizedBody: 'Studies show protected bike lanes reduce cyclist injuries by 90% compared to painted lanes. Source: https://www.sciencedirect.com/science/article/pii/S2214140518301488',
      status: 'VISIBLE',
      moderationScore: 0.01,
      createdAt: new Date('2026-03-07'),
    },
  })

  await prisma.comment.create({
    data: {
      authorId: admin.id,
      civicItemId: waterConservation.id,
      threadType: 'CONCERN',
      body: 'I support conservation but am concerned about the tax burden. Can we explore funding from existing budgets first?',
      sanitizedBody: 'I support conservation but am concerned about the tax burden. Can we explore funding from existing budgets first?',
      status: 'VISIBLE',
      moderationScore: 0.15,
      createdAt: new Date('2026-03-08'),
    },
  })

  console.log('✅ Created 6 comments with replies')

  // ===========================================================================
  // ORGANIZER UPDATE
  // ===========================================================================

  await prisma.organizerUpdate.create({
    data: {
      civicItemId: rentStabilization.id,
      authorId: organizer.id,
      title: 'City Council Schedules Public Hearing',
      body: 'Great news! The Tempe City Council has officially scheduled a public hearing for the Rent Stabilization Ordinance on April 1st at 6pm. This is our chance to show up and voice support. The hearing will be held at Tempe City Hall with an option to join virtually. We need a strong showing to demonstrate community support. Please mark your calendars and share this update!',
      isVerified: true,
      createdAt: new Date('2026-03-10'),
    },
  })

  console.log('✅ Created 1 organizer update')

  // ===========================================================================
  // AUDIT LOGS
  // ===========================================================================

  await prisma.auditLog.createMany({
    data: [
      {
        userId: student.id,
        action: 'SUPPORT_CIVIC_ITEM',
        entityType: 'CivicItem',
        entityId: rentStabilization.id,
        metadata: JSON.parse('{"action":"SUPPORT","civicItemSlug":"tempe-rent-stabilization-ordinance"}'),
        ipHash: 'hash_abc123',
        createdAt: new Date('2026-03-02'),
      },
      {
        userId: student.id,
        action: 'SUPPORT_CIVIC_ITEM',
        entityType: 'CivicItem',
        entityId: asuTransit.id,
        metadata: JSON.parse('{"action":"SUPPORT","civicItemSlug":"asu-campus-transit-expansion"}'),
        ipHash: 'hash_abc123',
        createdAt: new Date('2026-03-05'),
      },
      {
        userId: organizer.id,
        action: 'SUPPORT_CIVIC_ITEM',
        entityType: 'CivicItem',
        entityId: bikeLanes.id,
        metadata: JSON.parse('{"action":"SUPPORT","civicItemSlug":"tempe-protected-bike-lane-expansion"}'),
        ipHash: 'hash_def456',
        createdAt: new Date('2026-03-04'),
      },
    ],
  })

  console.log('✅ Created audit log entries')

  console.log('\\n🎉 Database seeded successfully!')
  console.log('\\n📊 Summary:')
  console.log('   - 3 users (student, organizer, admin)')
  console.log('   - 3 user addresses (Tempe, AZ)')
  console.log('   - 7 user interests')
  console.log('   - 8 civic items (diverse types and categories)')
  console.log('   - 3 AI summaries')
  console.log('   - 18 engagement events')
  console.log('   - 6 comments (with nested replies)')
  console.log('   - 1 organizer update')
  console.log('   - 3 audit log entries')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
