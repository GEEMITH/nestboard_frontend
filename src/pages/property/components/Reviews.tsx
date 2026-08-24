import { useState } from "react"
import { Star } from "lucide-react"
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  createReview,
  getReviewEligibility,
  getReviews,
} from "@/api/reviews"

import { useAuthStore } from "@/stores/authStore"

type ReviewsProps = {
  propertyId: string
}

export function Reviews({
  propertyId,
}: ReviewsProps) {
  const queryClient = useQueryClient()

  const user = useAuthStore(
    (state) => state.user
  )

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")

  const reviewsQuery = useQuery({
    queryKey: ["reviews", propertyId],
    queryFn: () => getReviews(propertyId),
  })

  const eligibilityQuery = useQuery({
    queryKey: [
      "review-eligibility",
      propertyId,
    ],
    queryFn: () =>
      getReviewEligibility(propertyId),
    enabled: !!user,
  })

  const reviewMutation = useMutation({
    mutationFn: () =>
      createReview(propertyId, {
        rating,
        comment,
      }),

    onSuccess: () => {
      setRating(0)
      setComment("")

      queryClient.invalidateQueries({
        queryKey: ["reviews", propertyId],
      })

      queryClient.invalidateQueries({
        queryKey: [
          "review-eligibility",
          propertyId,
        ],
      })

      queryClient.invalidateQueries({
        queryKey: ["property", propertyId],
      })
    },
  })

  const reviews =
    reviewsQuery.data ?? []

  const average =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) =>
            sum + review.rating,
          0
        ) / reviews.length
      : 0

  return (
    <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold">
        Ratings & Reviews
      </h2>

      <div className="mt-2 flex items-center gap-2">
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />

        <span className="font-semibold">
          {average.toFixed(1)}
        </span>

        <span className="text-sm text-gray-500">
          ({reviews.length} reviews)
        </span>
      </div>

      {user &&
        eligibilityQuery.data?.eligible && (
          <div className="mt-6 rounded-xl border p-4">
            <h3 className="font-semibold">
              Leave a review
            </h3>

            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setRating(value)
                  }
                >
                  <Star
                    className={`h-7 w-7 ${
                      value <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(event) =>
                setComment(event.target.value)
              }
              placeholder="Share your experience..."
              className="mt-4 w-full rounded-lg border p-3"
            />

            {reviewMutation.error && (
              <p className="mt-2 text-sm text-red-600">
                {reviewMutation.error.message}
              </p>
            )}

            <button
              disabled={
                rating === 0 ||
                reviewMutation.isPending
              }
              onClick={() =>
                reviewMutation.mutate()
              }
              className="mt-3 rounded-lg bg-primary px-5 py-2 text-white disabled:opacity-50"
            >
              {reviewMutation.isPending
                ? "Submitting..."
                : "Submit Review"}
            </button>
          </div>
        )}

      <div className="mt-6 space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b pb-4"
          >
            <div className="flex items-center justify-between">
              <strong>
                {review.user.displayName}
              </strong>

              <div className="flex">
                {Array.from({
                  length: review.rating,
                }).map((_, index) => (
                  <Star
                    key={index}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
            </div>

            {review.comment && (
              <p className="mt-2 text-gray-600">
                {review.comment}
              </p>
            )}
          </div>
        ))}

        {reviews.length === 0 && (
          <p className="text-gray-500">
            No reviews yet.
          </p>
        )}
      </div>
    </section>
  )
}