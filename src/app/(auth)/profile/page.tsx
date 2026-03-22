import { redirect } from 'next/navigation'
import { getCurrentUserCached } from '@/lib/auth/server'
import { getProfilePageData } from '@/lib/user/profile'
import { ProfilePageClient } from '@/components/profile/ProfilePageClient'

export default async function ProfilePage() {
  const user = await getCurrentUserCached()

  if (!user) {
    redirect('/sign-in')
  }

  const data = await getProfilePageData(user.id)

  if (!data) {
    redirect('/sign-in')
  }

  return (
    <ProfilePageClient
      initialProfile={data.profile}
      initialSavedItems={data.savedItems}
      initialRecentActivity={data.recentActivity}
    />
  )
}
