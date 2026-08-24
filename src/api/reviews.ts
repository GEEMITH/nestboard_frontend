import { apiClient } from "@/api/client"

export type Review = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: {
    id: string
    displayName: string
    avatarUrl?: string | null
  }
}

export type ReviewEligibility = {
  eligible: boolean
  reason?: string
}

export function getReviews(
  propertyId: string
) {
  return apiClient.get<Review[]>(
    `/api/properties/${propertyId}/reviews`
  )
}

export function getReviewEligibility(
  propertyId: string
) {
  return apiClient.get<ReviewEligibility>(
    `/api/properties/${propertyId}/reviews/eligibility`
  )
}

export function createReview(
  propertyId: string,
  input: {
    rating: number
    comment?: string
  }
) {
  return apiClient.post<Review>(
    `/api/properties/${propertyId}/reviews`,
    input
  )
}