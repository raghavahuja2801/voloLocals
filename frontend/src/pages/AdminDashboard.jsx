import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import ServiceEditModal from '../components/ServiceEditModal'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export default function AdminDashboard() {
  const { currentUser } = useAuth()
  
  // Tab state
  const [activeTab, setActiveTab] = useState('leads')
  
  // Leads state
  const [leads, setLeads] = useState([])
  const [filteredLeads, setFilteredLeads] = useState([])
  const [leadFilters, setLeadFilters] = useState({
    status: '',
    serviceType: '',
    urgency: '',
    dateRange: ''
  })
  
  // Services state
  const [services, setServices] = useState([])
  const [serviceQuestions, setServiceQuestions] = useState({})
  const [selectedService, setSelectedService] = useState(null)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [newService, setNewService] = useState({ serviceType: '', questions: [] })
  
  // Contractors state
  const [contractors, setContractors] = useState([])
  const [contractorStats, setContractorStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0
  })
  const [contractorFilters, setContractorFilters] = useState({
    status: 'pending'
  })
  
  // Global state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (activeTab === 'leads') {
      fetchLeads()
    } else if (activeTab === 'services') {
      fetchServicesAndQuestions()
    } else if (activeTab === 'contractors') {
      fetchContractors()
    }
  }, [activeTab])

  useEffect(() => {
    filterLeads()
  }, [leads, leadFilters])

  useEffect(() => {
    if (activeTab === 'contractors') {
      fetchContractors()
    }
  }, [contractorFilters])

  const filterLeads = () => {
    let filtered = [...leads]

    if (leadFilters.status) {
      filtered = filtered.filter(lead => 
        (lead.status || 'open').toLowerCase() === leadFilters.status.toLowerCase()
      )
    }

    if (leadFilters.serviceType) {
      filtered = filtered.filter(lead => 
        lead.serviceType?.toLowerCase().includes(leadFilters.serviceType.toLowerCase())
      )
    }

    if (leadFilters.urgency) {
      filtered = filtered.filter(lead => 
        (lead.urgency || '').toLowerCase() === leadFilters.urgency.toLowerCase()
      )
    }

    if (leadFilters.dateRange) {
      const now = new Date()
      const filterDate = new Date()
      
      switch (leadFilters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        default:
          filterDate = null
      }
      
      if (filterDate) {
        filtered = filtered.filter(lead => 
          new Date(lead.createdAt) >= filterDate
        )
      }
    }

    setFilteredLeads(filtered)
  }

  const getLeadStats = () => {
    const stats = {
      total: leads.length,
      open: leads.filter(l => (l.status || 'open').toLowerCase() === 'open').length,
      closed: leads.filter(l => (l.status || '').toLowerCase() === 'closed').length,
      urgent: leads.filter(l => (l.urgency || '').toLowerCase() === 'urgent').length,
    }
    return stats
  }

  const fetchLeads = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`${API_BASE_URL}/api/leads/admin`, {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated. Please log in as an admin.')
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.')
        }
        throw new Error(`Failed to fetch leads: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setLeads(data.leads || [])
      setFilteredLeads(data.leads || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchServicesAndQuestions = async () => {
    try {
      setLoading(true)
      setError('')
      
      // First, fetch the list of services
      const servicesResponse = await fetch(`${API_BASE_URL}/api/services`, {
        credentials: 'include',
      })

      if (!servicesResponse.ok) {
        if (servicesResponse.status === 401) {
          throw new Error('Not authenticated. Please log in as an admin.')
        } else if (servicesResponse.status === 403) {
          throw new Error('Access denied. Admin privileges required.')
        }
        throw new Error(`Failed to fetch services: ${servicesResponse.status} ${servicesResponse.statusText}`)
      }

      const servicesData = await servicesResponse.json()
      const servicesList = servicesData.services || []
      setServices(servicesList)

      // Now fetch questions for each service type
      const questionsMap = {}
      for (const serviceType of servicesList) {
        try {
          const questionsResponse = await fetch(`${API_BASE_URL}/api/services/${encodeURIComponent(serviceType)}/questions`, {
            credentials: 'include',
          })

          if (questionsResponse.ok) {
            const questionsData = await questionsResponse.json()
            questionsMap[serviceType] = questionsData.questions || []
          } else {
            questionsMap[serviceType] = []
          }
        } catch (err) {
          questionsMap[serviceType] = []
        }
      }

      setServiceQuestions(questionsMap)
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createService = async () => {
    try {
      // Convert questions to API format before sending
      const apiQuestions = newService.questions.map(q => {
        const apiQuestion = {
          id: q.id || `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          label: q.text,
          type: q.type,
          required: q.required
        }
        
        // Add options for select/radio/checkbox types
        if (['select', 'radio', 'checkbox'].includes(q.type) && q.options && q.options.length > 0) {
          apiQuestion.options = q.options.map(opt => ({
            label: opt,
            value: opt.toLowerCase().replace(/\s+/g, '-')
          }))
        }
        
        return apiQuestion
      })
      
      const response = await fetch(`${API_BASE_URL}/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          serviceType: newService.serviceType,
          questions: apiQuestions
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create service: ${response.status} ${response.statusText}`)
      }

      setShowServiceModal(false)
      setNewService({ serviceType: '', questions: [] })
      fetchServicesAndQuestions()
    } catch (err) {
      setError(err.message)
    }
  }

  const updateService = async (serviceType, updatedQuestions) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/services/${encodeURIComponent(serviceType)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          questions: updatedQuestions
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update service: ${response.status} ${response.statusText}`)
      }

      fetchServicesAndQuestions()
      setSelectedService(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const fetchContractors = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Build query parameters
      const params = new URLSearchParams()
      if (contractorFilters.status) {
        params.append('status', contractorFilters.status)
      }
      
      const url = `${API_BASE_URL}/api/contractor/auth/admin/contractors${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await fetch(url, {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated. Please log in as an admin.')
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.')
        }
        throw new Error(`Failed to fetch contractors: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setContractors(data.contractors || [])
      
      // Update stats - fetch all statuses to get complete stats
      await fetchContractorStats()
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchContractorStats = async () => {
    try {
      const statuses = ['pending', 'approved', 'rejected', 'suspended']
      const stats = { total: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 }
      
      for (const status of statuses) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/contractor/auth/admin/contractors?status=${status}`, {
            credentials: 'include',
          })
          
          if (response.ok) {
            const data = await response.json()
            stats[status] = data.count || 0
            stats.total += data.count || 0
          }
        } catch (err) {
          // Silently handle individual status fetch errors
        }
      }
      
      setContractorStats(stats)
    } catch (err) {
      // Keep stats fetch failures silent to avoid cluttering UI
    }
  }

  const updateContractorStatus = async (contractorId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contractor/auth/admin/contractors/${contractorId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update contractor status: ${response.status} ${response.statusText}`)
      }

      fetchContractors()
    } catch (err) {
      setError(err.message)
    }
  }

  const formatDate = (dateString) => {
    try {
      if (!dateString) {
        return 'No date available'
      }
      
      let date;
      
      // Handle Firestore timestamp format
      if (dateString && typeof dateString === 'object' && dateString._seconds) {
        date = new Date(dateString._seconds * 1000 + dateString._nanoseconds / 1000000)
      } else {
        date = new Date(dateString)
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Date unavailable'
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getContractorStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'suspended':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getContractorStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '⏳'
      case 'approved':
        return '✅'
      case 'rejected':
        return '❌'
      case 'suspended':
        return '⏸️'
      default:
        return '❓'
    }
  }

  const addQuestion = () => {
    setNewService(prev => ({
      ...prev,
      questions: [...prev.questions, { 
        id: `new_question_${Date.now()}`,
        text: '', 
        type: 'text', 
        required: false,
        options: [] // For select/radio/checkbox questions
      }]
    }))
  }

  const updateQuestion = (index, field, value) => {
    setNewService(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }))
  }

  const removeQuestion = (index) => {
    setNewService(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const moveQuestion = (index, direction) => {
    const newQuestions = [...newService.questions]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < newQuestions.length) {
      [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]]
      setNewService(prev => ({ ...prev, questions: newQuestions }))
    }
  }

  const addOption = (questionIndex) => {
    setNewService(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: [...(q.options || []), ''] }
          : q
      )
    }))
  }

  const updateOption = (questionIndex, optionIndex, value) => {
    setNewService(prev => ({
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
    setNewService(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: q.options.filter((_, j) => j !== optionIndex) }
          : q
      )
    }))
  }

  const deleteService = async (serviceType) => {
    if (!confirm(`Are you sure you want to delete the service "${serviceType}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/services/${encodeURIComponent(serviceType)}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete service: ${response.status} ${response.statusText}`)
      }

      fetchServicesAndQuestions()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 min-w-screen overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('leads')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'leads'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Leads Management
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'services'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Services Management
                </button>
                <button
                  onClick={() => setActiveTab('contractors')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'contractors'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Contractors
                </button>
              </nav>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <>
              {/* Leads Tab */}
              {activeTab === 'leads' && (
                <div>
                  {/* Lead Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {(() => {
                      const stats = getLeadStats()
                      return (
                        <>
                          <div className="bg-white p-4 rounded-lg shadow">
                            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                            <div className="text-sm text-gray-600">Total Leads</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow">
                            <div className="text-2xl font-bold text-green-600">{stats.open}</div>
                            <div className="text-sm text-gray-600">Open Leads</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow">
                            <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
                            <div className="text-sm text-gray-600">Closed Leads</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow">
                            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
                            <div className="text-sm text-gray-600">Urgent Leads</div>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  {/* Filters */}
                  <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={leadFilters.status}
                          onChange={(e) => setLeadFilters(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Statuses</option>
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                        <input
                          type="text"
                          value={leadFilters.serviceType}
                          onChange={(e) => setLeadFilters(prev => ({ ...prev, serviceType: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search service..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                        <select
                          value={leadFilters.urgency}
                          onChange={(e) => setLeadFilters(prev => ({ ...prev, urgency: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Urgencies</option>
                          <option value="urgent">Urgent</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                        <select
                          value={leadFilters.dateRange}
                          onChange={(e) => setLeadFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Time</option>
                          <option value="today">Today</option>
                          <option value="week">Last Week</option>
                          <option value="month">Last Month</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">All Leads</h2>
                    <div className="text-sm text-gray-600">
                      Showing: {filteredLeads.length} of {leads.length} leads
                    </div>
                  </div>

                  <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Service
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Urgency
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Budget
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredLeads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {lead.serviceType}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {lead.description?.substring(0, 50)}...
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{lead.userName}</div>
                                <div className="text-sm text-gray-500">{lead.userEmail}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {lead.location}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(lead.urgency)}`}>
                                  {lead.urgency || 'Not specified'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${lead.budget || 'Not specified'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                                  {lead.status || 'Open'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(lead.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {filteredLeads.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No leads found matching your filters.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Services Tab */}
              {activeTab === 'services' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Service Types</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={fetchServicesAndQuestions}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={() => setShowServiceModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Add New Service
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((serviceType, index) => {
                      const questions = serviceQuestions[serviceType] || []
                      
                      return (
                        <div key={serviceType} className="bg-white p-6 rounded-lg shadow-md">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {serviceType}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Questions: {questions.length}
                          </p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                const serviceData = {
                                  serviceType: serviceType,
                                  questions: questions
                                }
                                setSelectedService(serviceData)
                                setShowEditModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit Questions →
                            </button>
                            <button
                              onClick={() => deleteService(serviceType)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {services.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No services found.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Contractors Tab */}
              {activeTab === 'contractors' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Contractor Applications</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={fetchContractors}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  {/* Contractor Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="text-2xl font-bold text-blue-600">{contractorStats.total}</div>
                      <div className="text-sm text-gray-600">Total Applications</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="text-2xl font-bold text-yellow-600">{contractorStats.pending}</div>
                      <div className="text-sm text-gray-600">Pending Review</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="text-2xl font-bold text-green-600">{contractorStats.approved}</div>
                      <div className="text-sm text-gray-600">Approved</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="text-2xl font-bold text-red-600">{contractorStats.rejected}</div>
                      <div className="text-sm text-gray-600">Rejected</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="text-2xl font-bold text-orange-600">{contractorStats.suspended}</div>
                      <div className="text-sm text-gray-600">Suspended</div>
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Filter by Status</h3>
                    <div className="flex space-x-4">
                      {['pending', 'approved', 'rejected', 'suspended'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setContractorFilters({ status })}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            contractorFilters.status === status
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {getContractorStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                      <button
                        onClick={() => setContractorFilters({ status: '' })}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          !contractorFilters.status
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All Contractors
                      </button>
                    </div>
                  </div>

                  {/* Contractors Table */}
                  <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">
                        {contractorFilters.status ? 
                          `${contractorFilters.status.charAt(0).toUpperCase() + contractorFilters.status.slice(1)} Contractors` : 
                          'All Contractors'
                        } ({contractors.length})
                      </h3>
                    </div>
                    
                    {contractors.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contractor
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Business Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Service Categories
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Applied
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {contractors.map((contractor) => (
                              <tr key={contractor.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {contractor.email}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {contractor.id}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {contractor.businessName || 'Not specified'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex flex-wrap gap-1">
                                    {contractor.serviceCategories?.map((category, index) => (
                                      <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {category}
                                      </span>
                                    )) || <span className="text-sm text-gray-500">None specified</span>}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getContractorStatusColor(contractor.status)}`}>
                                    {getContractorStatusIcon(contractor.status)} {contractor.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(contractor.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    {contractor.status === 'pending' && (
                                      <>
                                        <button
                                          onClick={() => updateContractorStatus(contractor.id, 'approved')}
                                          className="text-green-600 hover:text-green-900"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => updateContractorStatus(contractor.id, 'rejected')}
                                          className="text-red-600 hover:text-red-900"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}
                                    {contractor.status === 'approved' && (
                                      <>
                                        <button
                                          onClick={() => updateContractorStatus(contractor.id, 'suspended')}
                                          className="text-orange-600 hover:text-orange-900"
                                        >
                                          Suspend
                                        </button>
                                        <button
                                          onClick={() => updateContractorStatus(contractor.id, 'rejected')}
                                          className="text-red-600 hover:text-red-900"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}
                                    {contractor.status === 'rejected' && (
                                      <button
                                        onClick={() => updateContractorStatus(contractor.id, 'pending')}
                                        className="text-blue-600 hover:text-blue-900"
                                      >
                                        Reopen
                                      </button>
                                    )}
                                    {contractor.status === 'suspended' && (
                                      <>
                                        <button
                                          onClick={() => updateContractorStatus(contractor.id, 'approved')}
                                          className="text-green-600 hover:text-green-900"
                                        >
                                          Reactivate
                                        </button>
                                        <button
                                          onClick={() => updateContractorStatus(contractor.id, 'rejected')}
                                          className="text-red-600 hover:text-red-900"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="mb-4">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {contractorFilters.status ? 
                            `No ${contractorFilters.status} contractors found` : 
                            'No contractors found'}
                        </h3>
                        <p className="text-gray-500">
                          {contractorFilters.status ? 
                            `There are currently no contractors with ${contractorFilters.status} status.` : 
                            'No contractor applications have been submitted yet.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* New Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Add New Service</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <input
                    type="text"
                    value={newService.serviceType}
                    onChange={(e) => setNewService(prev => ({ ...prev, serviceType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., cleaning, plumbing, electrical"
                  />
                </div>

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
                  
                  {newService.questions.map((question, questionIndex) => (
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
                            disabled={questionIndex === newService.questions.length - 1}
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

                  {newService.questions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No questions added yet. Click "Add Question" to get started.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-6 border-t">
                <button
                  onClick={createService}
                  disabled={!newService.serviceType}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Create Service
                </button>
                <button
                  onClick={() => {
                    setShowServiceModal(false)
                    setNewService({ serviceType: '', questions: [] })
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Service Edit Modal */}
      <ServiceEditModal
        service={selectedService}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedService(null)
        }}
        onSave={() => {
          fetchServicesAndQuestions()
          setShowEditModal(false)
          setSelectedService(null)
        }}
        onUpdate={updateService}
      />

      <Footer />
    </div>
  )
}
