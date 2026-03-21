import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <SignIn fallbackRedirectUrl="/feed" signUpUrl="/sign-up" />
    </div>
  )
}
