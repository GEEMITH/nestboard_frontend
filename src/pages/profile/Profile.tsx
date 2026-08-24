import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import {
  Camera,
  Loader2,
  Save,
  User,
} from "lucide-react"

import { getCurrentUser, updateProfile } from "@/api/auth"
import { apiClient } from "@/api/client"
import { resolveImageUrl } from "@/api/admin"
import { useAuthStore } from "@/stores/authStore"

export function Profile() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [displayName, setDisplayName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [bioTag, setBioTag] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) {
      return
    }

    setDisplayName(user.displayName ?? "")
    setAvatarUrl(user.avatarUrl ?? "")
    setBioTag(user.bioTag ?? "")
  }, [user])

  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setError("")
    setMessage("")

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ]

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG, and WEBP images are allowed.",
      )

      event.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile image must be smaller than 5 MB.",
      )

      event.target.value = ""
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()

      formData.append("image", file)

      const result = await apiClient.postForm<{
        url: string
      }>(
        "/api/uploads/profile-image",
        formData,
      )

      if (!result.url) {
        throw new Error(
          "The server did not return an image URL.",
        )
      }

      setAvatarUrl(result.url)

      setMessage(
        "Profile image uploaded. Click Save Profile to keep it.",
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload profile image.",
      )
    } finally {
      setIsUploading(false)
      event.target.value = ""
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      const updatedUser = await updateProfile({
        displayName: displayName.trim(),
        avatarUrl:
          avatarUrl.trim() || null,
        bioTag:
          bioTag.trim() || null,
      })

      setUser(updatedUser)

      setDisplayName(
        updatedUser.displayName ?? "",
      )

      setAvatarUrl(
        updatedUser.avatarUrl ?? "",
      )

      setBioTag(
        updatedUser.bioTag ?? "",
      )

      setMessage(
        "Profile updated successfully.",
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function refreshProfile() {
    setError("")
    setMessage("")

    try {
      const currentUser =
        await getCurrentUser()

      setUser(currentUser)

      setDisplayName(
        currentUser.displayName ?? "",
      )

      setAvatarUrl(
        currentUser.avatarUrl ?? "",
      )

      setBioTag(
        currentUser.bioTag ?? "",
      )

      setMessage(
        "Profile refreshed successfully.",
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to refresh profile.",
      )
    }
  }

  const imageSrc =
    resolveImageUrl(avatarUrl)

  const initials =
    displayName.trim().charAt(0).toUpperCase() ||
    "U"

  return (
    <div className="min-h-screen bg-gray-50 px-4 pb-12 pt-28">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="bg-linear-to-r from-orange-500 to-orange-600 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <User className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  My Profile
                </h1>

                <p className="mt-1 text-sm text-orange-50">
                  Manage your NestBoard account.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                {message}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={
                        displayName ||
                        "Profile"
                      }
                      className="h-28 w-28 rounded-full object-cover ring-4 ring-orange-100"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-orange-100 text-4xl font-bold text-orange-600 ring-4 ring-orange-50">
                      {initials}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    title="Upload profile image"
                  >
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  JPG, PNG or WEBP · Maximum 5 MB
                </p>
              </div>

              <div>
                <label
                  htmlFor="displayName"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Display Name
                </label>

                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(event) =>
                    setDisplayName(
                      event.target.value,
                    )
                  }
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 caret-orange-500 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="avatarUrl"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Profile Image URL
                </label>

                <input
                  id="avatarUrl"
                  type="text"
                  value={avatarUrl}
                  onChange={(event) =>
                    setAvatarUrl(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 caret-orange-500 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="https://example.com/photo.jpg"
                />

                <p className="mt-2 text-xs text-gray-500">
                  You can upload an image above or
                  enter an image URL manually.
                </p>
              </div>

              <div>
                <label
                  htmlFor="bioTag"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Bio
                </label>

                <textarea
                  id="bioTag"
                  value={bioTag}
                  onChange={(event) =>
                    setBioTag(
                      event.target.value,
                    )
                  }
                  maxLength={255}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 caret-orange-500 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="Tell us a little about yourself..."
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={
                    isLoading || isUploading
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}

                  {isLoading
                    ? "Saving..."
                    : "Save Profile"}
                </button>

                <button
                  type="button"
                  onClick={refreshProfile}
                  disabled={
                    isLoading || isUploading
                  }
                  className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Refresh Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}