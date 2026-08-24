import { apiClient } from "@/api/client"

export async function uploadProfileImage(file: File) {
  const formData = new FormData()

  formData.append("image", file)

  return apiClient.postForm<{ url: string }>(
    "/api/uploads/profile-image",
    formData,
  )
}

export function resolveProfileImageUrl(
  imageUrl?: string | null,
) {
  if (!imageUrl) {
    return ""
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl
  }

  const apiUrl = String(
    import.meta.env.VITE_API_URL ?? "",
  ).replace(/\/$/, "")

  return `${apiUrl}${
    imageUrl.startsWith("/")
      ? imageUrl
      : `/${imageUrl}`
  }`
}