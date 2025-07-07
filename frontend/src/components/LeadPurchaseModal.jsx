import React, { useState } from 'react'
import { X, DollarSign, MapPin, Clock, Star, AlertTriangle } from 'lucide-react'

export default function LeadPurchaseModal({ lead, isOpen, onClose, onPurchase }) {
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen || !lead) return null

  const handlePurchase = async () => {
    setIsProcessing(true)
    try {
      await onPurchase(lead.id, lead.leadCost)
      onClose()
    } catch (error) {
      console.error('Purchase failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Purchase Lead</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Lead Preview */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{lead.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(lead.urgency)}`}>
                {lead.urgency} priority
              </span>
            </div>
            
            <p className="text-gray-600 mb-4">{lead.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>{lead.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{lead.postedTime}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="font-semibold text-gray-900">{lead.budget}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Customer Rating</p>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-semibold">{lead.homeownerRating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* What You'll Get */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">What you'll get after purchase:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Complete project description and requirements</li>
              <li>• Full customer contact information (phone & email)</li>
              <li>• Exact property address</li>
              <li>• Customer's preferred timeline</li>
              <li>• Any additional project photos or documents</li>
            </ul>
          </div>

          {/* Cost Breakdown */}
          <div className="mb-6 p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Lead Cost:</span>
              <span className="font-semibold">${lead.leadCost}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Estimated Project Value:</span>
              <span className="font-semibold text-green-600">${lead.estimatedValue.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Potential ROI:</span>
                <span className="font-bold text-green-600">
                  {Math.round((lead.estimatedValue / lead.leadCost) * 100)}x
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="mb-6 p-3 bg-yellow-50 rounded-lg flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Purchase Policy:</p>
              <p>Lead purchases are final and non-refundable. Make sure this lead matches your service area and expertise.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <DollarSign className="h-4 w-4" />
            <span>{isProcessing ? 'Processing...' : `Purchase for $${lead.leadCost}`}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
