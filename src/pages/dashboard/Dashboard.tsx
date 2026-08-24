import { useUser } from "@clerk/react"
// import { FileExclamationPoint } from "lucide-react"

export function Dashboard() {
  // const { user, isLoaded, isSignedIn } = useUser()
  const { user } = useUser()

  // if (!isLoaded) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center">
  //       <p className="text-gray-500">Loading...</p>
  //     </div>
  //   )
  // }

  // if (!isSignedIn) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center">
  //       <FileExclamationPoint className="mr-2 h-5 w-5 text-lg text-red-700" />
  //       <p className="text-lg text-red-700">
  //         You need to sign in to view your dashboard.
  //       </p>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-28">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold text-gray-900">
          Welcome, {user?.firstName || "User"}!
        </h1>
        <p className="mt-2 text-gray-600">
          This is your dashboard where you can manage your properties, view your
          saved listings, and see your recent activity. We're working on adding
          more features soon, so stay tuned!
        </p>
      </div>
    </div>
  )
}
