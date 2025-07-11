import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export default function ServiceEditModal({ service, isOpen, onClose, onSave, onUpdate }) {
  const { currentUser } = useAuth()
  const [editedService, setEditedService] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (service && service.questions) {
      console.log('ServiceEditModal received service:', service)
      console.log('ServiceEditModal received questions:', service.questions)
      
      // Convert API format to internal format
      const convertedQuestions = service.questions.map((q, index) => {
        // Handle different API response formats
        const question = {
          id: q.id || q.key || `question_${index}`,
          text: q.label || q.text || '',
          type: q.type || 'text',
          required: q.required || false,
          options: []
        }
        
        // Handle options for select/radio/checkbox types
        if (q.options && Array.isArray(q.options)) {
          question.options = q.options.map(opt => {
            if (typeof opt === 'string') {
              return opt
            } else if (opt.label && opt.value) {
              return opt.label // Display the label in the admin interface
            } else {
              return opt.toString()
            }
          })
        }
        
        return question
      })
      
      setEditedService({
        serviceType: service.serviceType,
        questions: convertedQuestions
      })
      
      console.log('Converted questions for editing:', convertedQuestions)
    }
  }, [service])

  const addQuestion = () => {
    setEditedService(prev => ({
      ...prev,
      questions: [...prev.questions, { 
        id: `new_question_${Date.now()}`,
        text: '', 
        type: 'text', 
        required: false,
        options: [] // For select type questions
      }]
    }))
  }

  const updateQuestion = (index, field, value) => {
    setEditedService(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }))
  }

  const removeQuestion = (index) => {
    setEditedService(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const moveQuestion = (index, direction) => {
    const newQuestions = [...editedService.questions]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < newQuestions.length) {
      [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]]
      setEditedService(prev => ({ ...prev, questions: newQuestions }))
    }
  }

  const addOption = (questionIndex) => {
    setEditedService(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: [...(q.options || []), ''] }
          : q
      )
    }))
  }

  const updateOption = (questionIndex, optionIndex, value) => {
    setEditedService(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { 
              ...q, 
              options: q.options.map((opt, j) => j === optionIndex ? value : opt)
            }
          : q
      )
    }))
  }

  const removeOption = (questionIndex, optionIndex) => {
    setEditedService(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: q.options.filter((_, j) => j !== optionIndex) }
          : q
      )
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Convert back to API format before saving
      const apiQuestions = editedService.questions.map(q => {
        const apiQuestion = {
          id: q.id,
          label: q.text,
          type: q.type,
          required: q.required
        }
        
        // Add options for select/radio/checkbox types
        if (['select', 'radio', 'checkbox'].includes(q.type) && q.options.length > 0) {
          apiQuestion.options = q.options.map(opt => ({
            label: opt,
            value: opt.toLowerCase().replace(/\s+/g, '-')
          }))
        }
        
        return apiQuestion
      })
      
      console.log('Saving questions in API format:', apiQuestions)
      
      // Use the onUpdate prop passed from AdminDashboard
      if (onUpdate) {
        await onUpdate(editedService.serviceType, apiQuestions)
      }

      onSave()
      onClose()
    } catch (err) {
      console.error('Error saving service:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !editedService) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Edit Service: {editedService.serviceType}
          </h3>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Service Basic Info */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type
              </label>
              <input
                type="text"
                value={editedService.serviceType}
                onChange={(e) => setEditedService(prev => ({ ...prev, serviceType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled // Service type shouldn't be editable after creation
              />
            </div>

            {/* Questions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Questions</h4>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                >
                  + Add Question
                </button>
              </div>
              
              {editedService.questions.map((question, questionIndex) => (
                <div key={question.id || questionIndex} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-medium text-gray-900">Question {questionIndex + 1}</h5>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => moveQuestion(questionIndex, 'up')}
                        disabled={questionIndex === 0}
                        className="text-gray-500 hover:text-gray-700 disabled:text-gray-300 text-sm"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestion(questionIndex, 'down')}
                        disabled={questionIndex === editedService.questions.length - 1}
                        className="text-gray-500 hover:text-gray-700 disabled:text-gray-300 text-sm"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text
                      </label>
                      <textarea
                        value={question.text}
                        onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="Enter your question..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Input Type
                      </label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(questionIndex, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="text">Text Input</option>
                        <option value="number">Number Input</option>
                        <option value="select">Dropdown Select</option>
                        <option value="radio">Radio Buttons</option>
                        <option value="checkbox">Checkboxes</option>
                        <option value="textarea">Large Text Area</option>
                        <option value="date">Date Picker</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => updateQuestion(questionIndex, 'required', e.target.checked)}
                        className="mr-2"
                      />
                      Required field
                    </label>
                  </div>

                  {/* Options for select, radio, checkbox types */}
                  {(['select', 'radio', 'checkbox'].includes(question.type)) && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Options
                        </label>
                        <button
                          type="button"
                          onClick={() => addOption(questionIndex)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          + Add Option
                        </button>
                      </div>
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Option text..."
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(questionIndex, optionIndex)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {editedService.questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No questions added yet. Click "Add Question" to get started.
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-6 border-t">
            <button
              onClick={handleSave}
              disabled={loading || !editedService.serviceType}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
