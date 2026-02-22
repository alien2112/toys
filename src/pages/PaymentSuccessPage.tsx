import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/api'

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id')
        const paymentId = searchParams.get('payment_id')

        if (paymentId) {
          // Verify payment status
          const status = await apiService.getPaymentStatus(parseInt(paymentId))
          setPaymentStatus(status)
          
          if (status.status === 'completed') {
            // Redirect to orders after a short delay
            setTimeout(() => {
              navigate('/orders', { state: { newOrderId: status.order_id } })
            }, 3000)
          } else {
            setError('Payment not completed. Please try again.')
          }
        } else if (sessionId) {
          // Stripe success - just redirect to orders
          setTimeout(() => {
            navigate('/orders')
          }, 3000)
        } else {
          setError('Invalid payment verification')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to verify payment')
      } finally {
        setIsLoading(false)
      }
    }

    verifyPayment()
  }, [isAuthenticated, navigate, searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/orders')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm border border-green-200 p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your order. You will be redirected to your orders page shortly.
          </p>
          {paymentStatus && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600 mb-1">Order ID: #{paymentStatus.order_id}</p>
              <p className="text-sm text-gray-600 mb-1">Payment ID: #{paymentStatus.id}</p>
              <p className="text-sm text-gray-600">Amount: {paymentStatus.amount} {paymentStatus.currency}</p>
            </div>
          )}
          <button
            onClick={() => navigate('/orders')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            View Orders
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage
