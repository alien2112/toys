import React, { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  showValue?: boolean
  className?: string
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 'md',
  interactive = false,
  onRatingChange,
  readonly = false,
  showValue = false,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0)
  const [currentRating, setCurrentRating] = useState(rating)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleStarClick = (starRating: number) => {
    if (readonly || !interactive) return
    
    setCurrentRating(starRating)
    onRatingChange?.(starRating)
  }

  const handleStarHover = (starRating: number) => {
    if (readonly || !interactive) return
    setHoverRating(starRating)
  }

  const handleStarLeave = () => {
    if (readonly || !interactive) return
    setHoverRating(0)
  }

  const displayRating = hoverRating || currentRating

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className="flex items-center"
        onMouseLeave={handleStarLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating
          
          return (
            <button
              key={star}
              type="button"
              className={`
                ${sizeClasses[size]}
                ${interactive && !readonly ? 'cursor-pointer transition-colors' : 'cursor-default'}
                ${isFilled ? 'text-yellow-400' : 'text-gray-300'}
                hover:text-yellow-400
                focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 rounded
              `}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
              disabled={readonly || !interactive}
              aria-label={`Rate ${star} stars`}
            >
              <Star 
                size={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
                fill={isFilled ? 'currentColor' : 'none'}
                className={isFilled ? 'text-yellow-400' : 'text-gray-300'}
              />
            </button>
          )
        })}
      </div>
      
      {showValue && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          {currentRating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default StarRating
