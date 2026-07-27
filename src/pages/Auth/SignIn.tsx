import { SignIn as ClerkSignIn } from "@clerk/react"

export function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <ClerkSignIn
        routing="path"
        path="/sign-in"
        forceRedirectUrl="/dashboard"
      />
    </div>
  )
}
