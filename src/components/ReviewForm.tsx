import React, { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import StarRating from './StarRating'

interface ReviewFormProps {
  productId: number
  productName: string
  initialReview?: {
    id: number
    rating: number
    review_text: string
  }
  onSubmit: (data: { rating: number; review_text: string }) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  productName,
  initialReview,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const [rating, setRating] = useState(initialReview?.rating || 0)
  const [reviewText, setReviewText] = useState(initialReview?.review_text || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (reviewText.trim().length < 10) {
      setError('Review must be at least 10 characters long')
      return
    }

    if (reviewText.trim().length > 2000) {
      setError('Review must be less than 2000 characters')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        rating,
        review_text: reviewText.trim()
      })
    } catch (err: any) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
    setError('')
  }

  const getRatingLabel = (rating: number) => {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    return labels[rating] || ''
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {productName}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Cancel"
        >
          <X size={20} />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Overall Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            <StarRating
              rating={rating}
              size="lg"
              interactive={!isSubmitting}
              onRatingChange={handleRatingChange}
            />
            {rating > 0 && (
              <span className="text-sm font-medium text-gray-600">
                {getRatingLabel(rating)}
              </span>
            )}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => {
              setReviewText(e.target.value)
              setError('')
            }}
            placeholder="Share your experience with this product. What did you like or dislike? What would you tell others considering this purchase?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={5}
            maxLength={2000}
            disabled={isSubmitting}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">
              Minimum 10 characters
            </p>
            <p className="text-xs text-gray-500">
              {reviewText.length}/2000
            </p>
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-gray-50 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Review Guidelines</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Be specific and detailed about your experience</li>
            <li>• Mention product quality, value, and performance</li>
            <li>• Help others make informed decisions</li>
            <li>• No profanity, hate speech, or personal information</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isEditing ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReviewForm
