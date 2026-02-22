import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PaymentCancelPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  const handleRetryPayment = () => {
    navigate('/cart')
  }

  const handleViewOrders = () => {
    navigate('/orders')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled. No charges were made to your account.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>What happened?</strong>
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              You cancelled the payment process, or there was an issue with the payment gateway.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRetryPayment}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
            >
              Try Again
            </button>
            <button
              onClick={handleViewOrders}
              className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 font-medium"
            >
              View Orders
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentCancelPage
