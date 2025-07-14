import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PaymentStatus() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  
  const paymentStatus = searchParams.get('payment') || 'unknown';
  const sessionId = searchParams.get('session_id');
  const amount = searchParams.get('amount');

  // Countdown timer and redirect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Get status configuration based on payment status
  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Payment Successful!',
          message: 'Your credits have been successfully added to your account.',
          description: 'You can now use these credits to purchase leads on your dashboard.',
        };
      case 'cancelled':
      case 'canceled':
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Payment Cancelled',
          message: 'Your payment was cancelled and no charges were made.',
          description: 'You can try again anytime from your contractor dashboard.',
        };
      case 'pending':
        return {
          icon: Clock,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Payment Pending',
          message: 'Your payment is being processed.',
          description: 'Credits will be added to your account once the payment is confirmed.',
        };
      case 'failed':
      case 'error':
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Payment Failed',
          message: 'There was an issue processing your payment.',
          description: 'Please try again or contact support if the problem persists.',
        };
      default:
        return {
          icon: AlertCircle,
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Payment Status Unknown',
          message: 'We could not determine the status of your payment.',
          description: 'Please check your account or contact support for assistance.',
        };
    }
  };

  const statusConfig = getStatusConfig(paymentStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex flex-col min-h-screen bg-gray-5 min-w-screen">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Status Icon */}
            <div className={`mx-auto mb-6 w-20 h-20 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border-2 flex items-center justify-center`}>
              <StatusIcon className={`h-10 w-10 ${statusConfig.iconColor}`} />
            </div>

            {/* Status Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {statusConfig.title}
            </h1>

            {/* Status Message */}
            <p className="text-gray-600 mb-4">
              {statusConfig.message}
            </p>

            {/* Status Description */}
            <p className="text-sm text-gray-500 mb-6">
              {statusConfig.description}
            </p>

            {/* Payment Details */}
            {(sessionId || amount) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Details:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  {sessionId && (
                    <div>
                      <span className="font-medium">Session ID:</span> {sessionId.slice(0, 20)}...
                    </div>
                  )}
                  {amount && (
                    <div>
                      <span className="font-medium">Amount:</span> ${amount}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Status:</span> {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                  </div>
                </div>
              </div>
            )}

            {/* Countdown */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Redirecting to dashboard in <span className="font-bold">{countdown}</span> seconds...
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Dashboard Now
              </button>
              
              {paymentStatus.toLowerCase() === 'success' && (
                <button
                  onClick={() => navigate('/contractor-dashboard')}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  View Available Leads
                </button>
              )}
              
              {(paymentStatus.toLowerCase() === 'cancelled' || paymentStatus.toLowerCase() === 'failed') && (
                <button
                  onClick={() => navigate('/contractor-dashboard')}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors font-medium"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help? {' '}
              <a href="mailto:support@vololocals.com" className="text-blue-600 hover:text-blue-700">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
