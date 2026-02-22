import React, { useState } from 'react'
import { ThumbsUp, ThumbsDown, Edit, Trash2, CheckCircle, Calendar } from 'lucide-react'
import StarRating from './StarRating'
import { useAuth } from '../context/AuthContext'

interface ReviewCardProps {
  review: {
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
  canEdit?: boolean
  canDelete?: boolean
  onEdit?: (review: any) => void
  onDelete?: (reviewId: number) => void
  onHelpfulVote?: (reviewId: number, voteType: 'helpful' | 'not_helpful') => void
  showActions?: boolean
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
  onHelpfulVote,
  showActions = true
}) => {
  const { user } = useAuth()
  const [hasVoted, setHasVoted] = useState<'helpful' | 'not_helpful' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleVote = async (voteType: 'helpful' | 'not_helpful') => {
    if (hasVoted || isSubmitting || !onHelpfulVote) return

    setIsSubmitting(true)
    try {
      await onHelpfulVote(review.id, voteType)
      setHasVoted(voteType)
    } catch (error) {
      console.error('Failed to submit vote:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isOwner = user && review.user_id === user.id

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {review.user_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{review.user_name}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <StarRating rating={review.rating} size="sm" readonly />
                <span>{formatDate(review.created_at)}</span>
                {review.is_verified_purchase && (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                    <CheckCircle size={12} />
                    Verified Purchase
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (isOwner || canEdit || canDelete) && (
          <div className="flex items-center gap-2">
            {isOwner && canEdit && onEdit && (
              <button
                onClick={() => onEdit(review)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                aria-label="Edit review"
              >
                <Edit size={16} />
              </button>
            )}
            {isOwner && canDelete && onDelete && (
              <button
                onClick={() => onDelete(review.id)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                aria-label="Delete review"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {review.review_text}
        </p>
      </div>

      {/* Purchase Date */}
      {review.is_verified_purchase && review.order_date && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Calendar size={12} />
          <span>Purchased on {formatDate(review.order_date)}</span>
        </div>
      )}

      {/* Helpful Votes */}
      {showActions && onHelpfulVote && (
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Was this helpful?</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleVote('helpful')}
                disabled={hasVoted !== null || isSubmitting}
                className={`
                  flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors
                  ${hasVoted === 'helpful' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                  ${hasVoted !== null ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <ThumbsUp size={14} />
                <span>{review.helpful_votes}</span>
              </button>
              <button
                onClick={() => handleVote('not_helpful')}
                disabled={hasVoted !== null || isSubmitting}
                className={`
                  flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors
                  ${hasVoted === 'not_helpful' 
                    ? 'bg-red-100 text-red-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                  ${hasVoted !== null ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <ThumbsDown size={14} />
                <span>{review.not_helpful_votes}</span>
              </button>
            </div>
          </div>
          
          {isSubmitting && (
            <span className="text-sm text-gray-500">Submitting...</span>
          )}
        </div>
      )}
    </div>
  )
}

export default ReviewCard
