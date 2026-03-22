/**
 * Reset Specific User Data
 * 
 * This script resets data for a specific user by email.
 * Useful for resetting individual accounts without affecting everyone.
 * 
 * Usage:
 * npx tsx scripts/reset-specific-user.ts kkalra1@asu.edu
 * npx tsx scripts/reset-specific-user.ts test.student@rallypoint.app
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetUser(email: string) {
  console.log(`\n🔄 Resetting user: ${email}\n`)

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      _count: {
        select: {
          engagements: true,
          comments: true,
          addresses: true,
          interests: true,
        },
      },
    },
  })

  if (!user) {
    console.error(`❌ User not found: ${email}`)
    return
  }

  console.log(`📊 Current data for ${user.displayName}:`)
  console.log(`   Engagements: ${user._count.engagements}`)
  console.log(`   Comments: ${user._count.comments}`)
  console.log(`   Addresses: ${user._count.addresses}`)
  console.log(`   Interests: ${user._count.interests}`)
  console.log(`   Onboarding: ${user.onboardingCompleted ? 'Completed' : 'Not completed'}\n`)

  console.log('🧹 Deleting user data...\n')

  // Delete user's moderation flags (as reporter)
  const deletedFlags = await prisma.moderationFlag.deleteMany({
    where: { reportedById: user.id },
  })
  console.log(`   ✅ Deleted ${deletedFlags.count} moderation flags`)

  // Delete user's comments
  const deletedComments = await prisma.comment.deleteMany({
    where: { authorId: user.id },
  })
  console.log(`   ✅ Deleted ${deletedComments.count} comments`)

  // Delete user's engagements
  const deletedEngagements = await prisma.engagementEvent.deleteMany({
    where: { userId: user.id },
  })
  console.log(`   ✅ Deleted ${deletedEngagements.count} engagements`)

  // Delete user's addresses
  const deletedAddresses = await prisma.userAddress.deleteMany({
    where: { userId: user.id },
  })
  console.log(`   ✅ Deleted ${deletedAddresses.count} addresses`)

  // Delete user's interests
  const deletedInterests = await prisma.userInterest.deleteMany({
    where: { userId: user.id },
  })
  console.log(`   ✅ Deleted ${deletedInterests.count} interests`)

  // Reset onboarding
  await prisma.user.update({
    where: { id: user.id },
    data: { onboardingCompleted: false },
  })
  console.log(`   ✅ Reset onboarding status`)

  // Delete user's audit logs
  const deletedAuditLogs = await prisma.auditLog.deleteMany({
    where: { userId: user.id },
  })
  console.log(`   ✅ Deleted ${deletedAuditLogs.count} audit logs`)

  // Delete user's fraud signals
  const deletedFraudSignals = await prisma.fraudSignal.deleteMany({
    where: { userId: user.id },
  })
  console.log(`   ✅ Deleted ${deletedFraudSignals.count} fraud signals`)

  console.log('\n✅ User reset complete!')
  console.log(`\n${user.displayName} (${email}) now has a fresh first-time experience.\n`)
}

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('❌ Error: Email address required')
    console.log('\nUsage:')
    console.log('  npx tsx scripts/reset-specific-user.ts <email>')
    console.log('\nExamples:')
    console.log('  npx tsx scripts/reset-specific-user.ts kkalra1@asu.edu')
    console.log('  npx tsx scripts/reset-specific-user.ts test.student@rallypoint.app')
    process.exit(1)
  }

  await resetUser(email)
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
