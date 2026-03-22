/**
 * Create Test Users in Clerk
 * 
 * This script creates test users in Clerk that can be used across different machines.
 * Since RallyPoint uses Clerk for authentication, users must be created through Clerk's API.
 * 
 * Prerequisites:
 * 1. Set CLERK_SECRET_KEY in your .env file
 * 2. Run: npx tsx scripts/create-test-users.ts
 * 
 * The script will output credentials that can be used to sign in on any machine.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Test user credentials
const TEST_USERS = [
  {
    email: 'test.student@rallypoint.app',
    password: 'RallyPoint2026!',
    firstName: 'Alex',
    lastName: 'Martinez',
    role: 'USER' as const,
    interests: ['HOUSING', 'TRANSIT', 'EDUCATION'],
    address: '1151 S Forest Ave, Tempe, AZ 85281',
  },
  {
    email: 'test.organizer@rallypoint.app',
    password: 'RallyPoint2026!',
    firstName: 'Jordan',
    lastName: 'Chen',
    role: 'ORGANIZER' as const,
    interests: ['ENVIRONMENT', 'ZONING'],
    address: '31 E 5th St, Tempe, AZ 85281',
  },
  {
    email: 'test.admin@rallypoint.app',
    password: 'RallyPoint2026!',
    firstName: 'Sam',
    lastName: 'Rivera',
    role: 'ADMIN' as const,
    interests: ['CITY_SERVICES', 'BUDGET'],
    address: '120 E 1st St, Tempe, AZ 85281',
  },
  {
    email: 'test.user1@rallypoint.app',
    password: 'RallyPoint2026!',
    firstName: 'Taylor',
    lastName: 'Johnson',
    role: 'USER' as const,
    interests: ['HEALTHCARE', 'EDUCATION'],
    address: '660 S Mill Ave, Tempe, AZ 85281',
  },
  {
    email: 'test.user2@rallypoint.app',
    password: 'RallyPoint2026!',
    firstName: 'Morgan',
    lastName: 'Davis',
    role: 'USER' as const,
    interests: ['PUBLIC_SAFETY', 'TRANSIT'],
    address: '1255 E University Dr, Tempe, AZ 85281',
  },
]

async function createClerkUser(userData: typeof TEST_USERS[0]) {
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY

  if (!CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY not found in environment variables')
  }

  try {
    // Create user in Clerk
    const response = await fetch('https://api.clerk.com/v1/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: [userData.email],
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        skip_password_checks: true, // Allow simple passwords for testing
        skip_password_requirement: false,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      
      // If user already exists, try to fetch them
      if (error.errors?.[0]?.code === 'form_identifier_exists') {
        console.log(`   ℹ️  User ${userData.email} already exists in Clerk`)
        
        // Fetch existing user
        const listResponse = await fetch(
          `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(userData.email)}`,
          {
            headers: {
              'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
            },
          }
        )
        
        if (listResponse.ok) {
          const users = await listResponse.json()
          if (users.length > 0) {
            return users[0].id
          }
        }
      }
      
      throw new Error(`Clerk API error: ${JSON.stringify(error)}`)
    }

    const clerkUser = await response.json()
    console.log(`   ✅ Created Clerk user: ${userData.email}`)
    return clerkUser.id
  } catch (error: any) {
    console.error(`   ❌ Failed to create ${userData.email}:`, error.message)
    throw error
  }
}

async function createDatabaseUser(clerkId: string, userData: typeof TEST_USERS[0]) {
  try {
    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        email: userData.email,
        displayName: `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
        onboardingCompleted: true,
      },
      create: {
        clerkId,
        email: userData.email,
        displayName: `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
        onboardingCompleted: true,
      },
    })

    // Create user address
    const addressData = {
      '1151 S Forest Ave, Tempe, AZ 85281': {
        lat: 33.4152,
        lng: -111.9315,
        districtIds: ['tempe-council-5', 'az-ld-26', 'maricopa-county', 'az-congressional-4'],
        jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona', 'ASU'],
      },
      '31 E 5th St, Tempe, AZ 85281': {
        lat: 33.4269,
        lng: -111.9401,
        districtIds: ['tempe-council-3', 'az-ld-26', 'maricopa-county', 'az-congressional-4'],
        jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
      },
      '120 E 1st St, Tempe, AZ 85281': {
        lat: 33.4255,
        lng: -111.9383,
        districtIds: ['tempe-council-2', 'az-ld-26', 'maricopa-county', 'az-congressional-4'],
        jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
      },
      '660 S Mill Ave, Tempe, AZ 85281': {
        lat: 33.4242,
        lng: -111.9401,
        districtIds: ['tempe-council-3', 'az-ld-26', 'maricopa-county', 'az-congressional-4'],
        jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
      },
      '1255 E University Dr, Tempe, AZ 85281': {
        lat: 33.4217,
        lng: -111.9198,
        districtIds: ['tempe-council-5', 'az-ld-26', 'maricopa-county', 'az-congressional-4'],
        jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona', 'ASU'],
      },
    }

    const addrInfo = addressData[userData.address as keyof typeof addressData]

    // Check if address already exists
    const existingAddress = await prisma.userAddress.findFirst({
      where: {
        userId: user.id,
        isPrimary: true,
      },
    })

    if (!existingAddress) {
      await prisma.userAddress.create({
        data: {
          userId: user.id,
          rawAddress: userData.address,
          normalizedAddress: userData.address,
          latitude: addrInfo.lat,
          longitude: addrInfo.lng,
          geocodeConfidence: 0.95,
          city: 'Tempe',
          state: 'AZ',
          zip: '85281',
          county: 'Maricopa',
          districtIds: addrInfo.districtIds,
          jurisdictionTags: addrInfo.jurisdictionTags,
          isPrimary: true,
        },
      })
    }

    // Create user interests
    for (const category of userData.interests) {
      await prisma.userInterest.upsert({
        where: {
          userId_category: {
            userId: user.id,
            category: category as any,
          },
        },
        update: {},
        create: {
          userId: user.id,
          category: category as any,
        },
      })
    }

    console.log(`   ✅ Created database records for ${userData.email}`)
    return user
  } catch (error: any) {
    console.error(`   ❌ Failed to create database records:`, error.message)
    throw error
  }
}

async function main() {
  console.log('🔐 Creating Test Users for RallyPoint\n')
  console.log('This script creates test users in Clerk and syncs them to the database.')
  console.log('These credentials can be used to sign in on any machine.\n')

  const createdUsers: Array<{ email: string; password: string; role: string }> = []

  for (const userData of TEST_USERS) {
    console.log(`\n📝 Creating user: ${userData.email}`)
    
    try {
      // Create in Clerk
      const clerkId = await createClerkUser(userData)
      
      // Create in database
      await createDatabaseUser(clerkId, userData)
      
      createdUsers.push({
        email: userData.email,
        password: userData.password,
        role: userData.role,
      })
    } catch (error: any) {
      console.error(`Failed to create user ${userData.email}:`, error.message)
      // Continue with next user
    }
  }

  console.log('\n\n' + '='.repeat(80))
  console.log('✅ TEST USER CREDENTIALS')
  console.log('='.repeat(80))
  console.log('\nUse these credentials to sign in on any machine:\n')

  for (const user of createdUsers) {
    console.log(`${user.role.padEnd(10)} | Email: ${user.email.padEnd(35)} | Password: ${user.password}`)
  }

  console.log('\n' + '='.repeat(80))
  console.log('\n📋 Sign In Instructions:')
  console.log('1. Go to your RallyPoint app')
  console.log('2. Click "Sign In"')
  console.log('3. Use any of the email/password combinations above')
  console.log('4. You\'ll be automatically redirected to the app\n')

  console.log('💡 Tips:')
  console.log('- All passwords are the same: RallyPoint2026!')
  console.log('- Users have different roles (USER, ORGANIZER, ADMIN)')
  console.log('- Each user has pre-configured interests and addresses')
  console.log('- Users are already onboarded and ready to use\n')
}

main()
  .then(() => {
    console.log('✨ Done!')
    prisma.$disconnect()
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    prisma.$disconnect()
    process.exit(1)
  })
