import React, { useState, useEffect } from 'react'
import { Star, MessageSquare, Filter, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react'
import ReviewCard from './ReviewCard'
import ReviewForm from './ReviewForm'
import StarRating from './StarRating'
import { useAuth } from '../context/AuthContext'

interface ReviewSectionProps {
  productId: number
  productName: string
}

interface Review {
  id: number
  rating: number
  review_text: string
  user_name: string
  created_at: string
  order_date: string
  is_verified_purchase: boolean
  helpful_votes: number
  not_helpful_votes: number
  user_id?: number
}

interface RatingDistribution {
  5: { count: number; percentage: number }
  4: { count: number; percentage: number }
  3: { count: number; percentage: number }
  2: { count: number; percentage: number }
  1: { count: number; percentage: number }
  average: number
  total: number
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId, productName }) => {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [distribution, setDistribution] = useState<RatingDistribution | null>(null)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [canReview, setCanReview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [sortOption, setSortOption] = useState('newest')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'highest', label: 'Highest Rating' },
    { value: 'lowest', label: 'Lowest Rating' },
    { value: 'helpful', label: 'Most Helpful' }
  ]

  useEffect(() => {
    fetchReviews()
  }, [productId, sortOption])

  const fetchReviews = async (reset = true) => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `http://localhost:8000/api/products/${productId}/reviews?sort=${sortOption}&limit=10&page=${reset ? 1 : page}`
      )
      const data = await response.json()

      if (data.success) {
        if (reset) {
          setReviews(data.data.reviews)
          setPage(1)
        } else {
          setReviews(prev => [...prev, ...data.data.reviews])
        }
        
        setDistribution(data.data.distribution)
        setUserReview(data.data.user_review)
        setCanReview(data.data.can_review)
        setHasMore(data.data.pagination.total > reviews.length + data.data.reviews.length)
      } else {
        throw new Error(data.message || 'Failed to fetch reviews')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (reviewData: { rating: number; review_text: string }) => {
    try {
      const token = localStorage.getItem('auth_token')
      const method = editingReview ? 'PUT' : 'POST'
      const url = editingReview 
        ? `http://localhost:8000/api/reviews/${editingReview.id}`
        : `http://localhost:8000/api/reviews`

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          ...reviewData
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowForm(false)
        setEditingReview(null)
        fetchReviews()
      } else {
        throw new Error(data.message || 'Failed to submit review')
      }
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setShowForm(true)
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:8000/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        fetchReviews()
      } else {
        throw new Error(data.message || 'Failed to delete review')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleHelpfulVote = async (reviewId: number, voteType: 'helpful' | 'not_helpful') => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:8000/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vote_type: voteType })
      })

      const data = await response.json()

      if (data.success) {
        // Update the review in the list
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                helpful_votes: voteType === 'helpful' ? review.helpful_votes + 1 : review.helpful_votes,
                not_helpful_votes: voteType === 'not_helpful' ? review.not_helpful_votes + 1 : review.not_helpful_votes
              }
            : review
        ))
      } else {
        throw new Error(data.message || 'Failed to submit vote')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const loadMore = () => {
    setPage(prev => prev + 1)
    fetchReviews(false)
  }

  const renderRatingBars = () => {
    if (!distribution || distribution.total === 0) return null

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map(star => {
          const starData = distribution[star as keyof typeof distribution]
          if (typeof starData === 'number') return null
          
          return (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-20">
                <span className="text-sm font-medium">{star}</span>
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">star</span>
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-yellow-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${starData.percentage}%` }}
                />
              </div>
              <div className="flex items-center gap-2 w-20 justify-end">
                <span className="text-sm text-gray-600">
                  {starData.count}
                </span>
                <span className="text-xs text-gray-500">
                  ({starData.percentage}%)
                </span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
        {distribution && distribution.total > 0 && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-gray-900">
                {distribution.average}
              </div>
              <div>
                <StarRating rating={distribution.average} size="md" readonly />
                <p className="text-sm text-gray-600 mt-1">
                  Based on {distribution.total} reviews
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          productId={productId}
          productName={productName}
          initialReview={editingReview || undefined}
          onSubmit={handleSubmitReview}
          onCancel={() => {
            setShowForm(false)
            setEditingReview(null)
          }}
          isEditing={!!editingReview}
        />
      )}

      {/* Write Review Button */}
      {!showForm && user && canReview && !userReview && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <MessageSquare size={20} />
          Write a Review
        </button>
      )}

      {/* User's Review */}
      {userReview && !showForm && (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-blue-900">Your Review</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEditReview(userReview)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                aria-label="Edit review"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDeleteReview(userReview.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                aria-label="Delete review"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <ReviewCard
            review={userReview}
            showActions={false}
          />
        </div>
      )}

      {/* Rating Distribution */}
      {distribution && distribution.total > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          {renderRatingBars()}
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-6">
          {/* Sort Options */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Reviews ({distribution?.total || 0})
            </h3>
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Filter size={16} />
                <span className="text-sm">
                  {sortOptions.find(opt => opt.value === sortOption)?.label}
                </span>
                {showSortDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {showSortDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortOption(option.value)
                        setShowSortDropdown(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-md last:rounded-b-md"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-4">
            {reviews.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                canEdit={user?.id === review.user_id}
                canDelete={user?.id === review.user_id}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
                onHelpfulVote={handleHelpfulVote}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More Reviews'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Reviews */}
      {reviews.length === 0 && !loading && (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
          <p className="text-gray-600">
            Be the first to review this product!
          </p>
        </div>
      )}
    </div>
  )
}

export default ReviewSection
