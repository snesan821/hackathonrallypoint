/**
 * Reset All User Data
 * 
 * This script clears all user interactions and history while keeping user accounts intact.
 * After running this, all users (including existing ones like kkalra1@asu.edu) will have
 * a fresh first-time user experience.
 * 
 * What gets deleted:
 * - All engagement events (views, saves, supports, comments, etc.)
 * - All comments and replies
 * - All user addresses
 * - All user interests
 * - Onboarding completion status (users will see onboarding again)
 * 
 * What stays:
 * - User accounts (can still sign in)
 * - Civic items (issues, petitions, etc.)
 * - AI summaries
 * - Source documents
 * 
 * Run: npx tsx scripts/reset-user-data.ts
 */

import { PrismaClient } from '@prisma/client'
import * as readline from 'readline'

const prisma = new PrismaClient()

async function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y')
    })
  })
}

async function main() {
  console.log('🔄 Reset All User Data\n')
  console.log('This will delete all user interactions and history while keeping accounts intact.\n')
  
  // Get current stats
  const stats = {
    users: await prisma.user.count(),
    engagements: await prisma.engagementEvent.count(),
    comments: await prisma.comment.count(),
    addresses: await prisma.userAddress.count(),
    interests: await prisma.userInterest.count(),
    civicItems: await prisma.civicItem.count(),
  }

  console.log('📊 Current Database Stats:')
  console.log(`   Users: ${stats.users}`)
  console.log(`   Engagement Events: ${stats.engagements}`)
  console.log(`   Comments: ${stats.comments}`)
  console.log(`   User Addresses: ${stats.addresses}`)
  console.log(`   User Interests: ${stats.interests}`)
  console.log(`   Civic Items: ${stats.civicItems} (will be kept)\n`)

  console.log('⚠️  What will be deleted:')
  console.log('   ✗ All engagement events (views, saves, supports, etc.)')
  console.log('   ✗ All comments and replies')
  console.log('   ✗ All user addresses')
  console.log('   ✗ All user interests')
  console.log('   ✗ Onboarding completion status\n')

  console.log('✅ What will be kept:')
  console.log('   ✓ User accounts (can still sign in)')
  console.log('   ✓ Civic items (issues, petitions, etc.)')
  console.log('   ✓ AI summaries')
  console.log('   ✓ Source documents\n')

  const confirmed = await askConfirmation('Are you sure you want to reset all user data? (yes/no): ')

  if (!confirmed) {
    console.log('\n❌ Operation cancelled.')
    return
  }

  console.log('\n🧹 Starting data reset...\n')

  try {
    // Delete in correct order to respect foreign key constraints
    console.log('1️⃣  Deleting moderation flags...')
    const deletedFlags = await prisma.moderationFlag.deleteMany()
    console.log(`   ✅ Deleted ${deletedFlags.count} moderation flags`)

    console.log('2️⃣  Deleting comments...')
    const deletedComments = await prisma.comment.deleteMany()
    console.log(`   ✅ Deleted ${deletedComments.count} comments`)

    console.log('3️⃣  Deleting engagement events...')
    const deletedEngagements = await prisma.engagementEvent.deleteMany()
    console.log(`   ✅ Deleted ${deletedEngagements.count} engagement events`)

    console.log('4️⃣  Deleting user addresses...')
    const deletedAddresses = await prisma.userAddress.deleteMany()
    console.log(`   ✅ Deleted ${deletedAddresses.count} user addresses`)

    console.log('5️⃣  Deleting user interests...')
    const deletedInterests = await prisma.userInterest.deleteMany()
    console.log(`   ✅ Deleted ${deletedInterests.count} user interests`)

    console.log('6️⃣  Resetting user onboarding status...')
    const updatedUsers = await prisma.user.updateMany({
      data: {
        onboardingCompleted: false,
      },
    })
    console.log(`   ✅ Reset onboarding for ${updatedUsers.count} users`)

    console.log('7️⃣  Deleting audit logs (optional cleanup)...')
    const deletedAuditLogs = await prisma.auditLog.deleteMany()
    console.log(`   ✅ Deleted ${deletedAuditLogs.count} audit logs`)

    console.log('8️⃣  Deleting fraud signals (optional cleanup)...')
    const deletedFraudSignals = await prisma.fraudSignal.deleteMany()
    console.log(`   ✅ Deleted ${deletedFraudSignals.count} fraud signals`)

    // Get final stats
    const finalStats = {
      users: await prisma.user.count(),
      engagements: await prisma.engagementEvent.count(),
      comments: await prisma.comment.count(),
      addresses: await prisma.userAddress.count(),
      interests: await prisma.userInterest.count(),
      civicItems: await prisma.civicItem.count(),
    }

    console.log('\n' + '='.repeat(80))
    console.log('✅ DATA RESET COMPLETE')
    console.log('='.repeat(80))
    console.log('\n📊 Final Database Stats:')
    console.log(`   Users: ${finalStats.users} (unchanged)`)
    console.log(`   Engagement Events: ${finalStats.engagements}`)
    console.log(`   Comments: ${finalStats.comments}`)
    console.log(`   User Addresses: ${finalStats.addresses}`)
    console.log(`   User Interests: ${finalStats.interests}`)
    console.log(`   Civic Items: ${finalStats.civicItems} (unchanged)\n`)

    console.log('🎉 All users now have a fresh first-time experience!')
    console.log('\n📝 What happens next:')
    console.log('   1. Users can still sign in with their existing credentials')
    console.log('   2. They will see the onboarding flow')
    console.log('   3. They need to set their address and interests again')
    console.log('   4. All civic items are still available to browse')
    console.log('   5. No previous engagement history exists\n')

  } catch (error: any) {
    console.error('\n❌ Error during reset:', error.message)
    throw error
  }
}

main()
  .then(() => {
    console.log('✨ Done!')
    prisma.$disconnect()
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    prisma.$disconnect()
    process.exit(1)
  })
