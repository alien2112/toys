// src/components/ReviewList.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Review } from '../types/review.types';
import { Star, AlertCircle, CheckCircle, FileText, Check } from 'lucide-react';

interface ReviewListProps {
  productId: number;
}

export const ReviewList = ({ productId }: ReviewListProps) => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => { fetchReviews(); }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProductReviews(productId);
      setReviews(response.reviews || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('فشل في تحميل التقييمات');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { setError('يجب تسجيل الدخول لإضافة تقييم'); return; }
    if (!newReview.comment.trim()) { setError('يرجى كتابة تعليق'); return; }
    try {
      setSubmitting(true);
      setError(null);
      await apiService.createReview({ product_id: productId, rating: newReview.rating, comment: newReview.comment });
      setSubmitSuccess(true);
      setNewReview({ rating: 5, comment: '' });
      await fetchReviews();
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.message || 'فشل في إضافة التقييم');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderStarsStatic = (rating: number) => (
    <div className="pdp-stars-display" aria-label={`${rating} من 5`}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={16} fill={s <= rating ? 'currentColor' : 'none'} strokeWidth={s <= rating ? 0 : 2} />
      ))}
    </div>
  );

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="pdp-reviews">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="pdp-skeleton-block" style={{ height: '80px', borderRadius: '14px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pdp-reviews">
      {/* Review Summary */}
      <div className="pdp-review-summary">
        <div className="pdp-review-score">
          <span className="pdp-review-score__num">{averageRating}</span>
          <div className="pdp-review-score__stars">
            {renderStarsStatic(Math.round(parseFloat(averageRating)))}
          </div>
          <span className="pdp-review-score__total">{reviews.length} تقييم</span>
        </div>
      </div>

      {/* Review Form */}
      {isAuthenticated ? (
        <div className="pdp-review-form-wrap">
          <h3><Star size={18} fill="var(--pdp-amber)" strokeWidth={0} /> أضف تقييمك</h3>

          {submitSuccess && (
            <div className="pdp-alert pdp-alert--success">
              <CheckCircle size={18} /> تم إضافة تقييمك بنجاح!
            </div>
          )}

          {error && (
            <div className="pdp-alert pdp-alert--error">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="pdp-review-form">
            {/* Stars */}
            <div>
              <label className="pdp-form-label">التقييم:</label>
              <div className="pdp-stars-interactive">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    type="button"
                    className="pdp-star-btn"
                    onClick={() => setNewReview({ ...newReview, rating: s })}
                    aria-label={`${s} نجوم`}
                  >
                    <Star size={24} fill={s <= newReview.rating ? 'currentColor' : 'none'} strokeWidth={s <= newReview.rating ? 0 : 2} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="review-comment" className="pdp-form-label">تعليقك:</label>
              <textarea
                id="review-comment"
                className="pdp-review-textarea"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="شاركنا رأيك في المنتج..."
                rows={4}
                required
                disabled={submitting}
              />
            </div>

            <button type="submit" className="pdp-review-submit" disabled={submitting}>
              {submitting ? 'جاري الإرسال...' : <><FileText size={16} /> إرسال التقييم</>}
            </button>
          </form>
        </div>
      ) : (
        <div className="pdp-auth-prompt">
          <p>يجب تسجيل الدخول لإضافة تقييم</p>
          <a href="/login">تسجيل الدخول</a>
        </div>
      )}

      {/* Reviews List */}
      <div className="pdp-review-items">
        <h3 className="pdp-review-items-title">التقييمات ({reviews.length})</h3>

        {reviews.length === 0 ? (
          <div className="pdp-review-empty">
            لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج! <Star size={16} style={{ display: 'inline-block', verticalAlign: 'middle', color: 'var(--pdp-amber)' }} />
          </div>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="pdp-review-card">
              <div className="pdp-review-card__head">
                <div className="pdp-review-card__user">
                  <span className="pdp-review-card__avatar">
                    {review.userName?.charAt(0) || 'م'}
                  </span>
                  <span className="pdp-review-card__name">{review.userName}</span>
                  {review.verified && (
                    <span className="pdp-review-card__verified" title="مشتري موثق"><Check size={12} strokeWidth={3} /></span>
                  )}
                </div>
                <div className="pdp-review-card__stars">
                  {renderStarsStatic(review.rating)}
                </div>
              </div>
              <p className="pdp-review-card__text">{review.comment}</p>
              <time className="pdp-review-card__date" dateTime={review.date}>
                {formatDate(review.date)}
              </time>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
