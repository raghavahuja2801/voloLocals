import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  DollarSign,
  Phone,
  Mail,
  User,
  Calendar,
  Filter,
  Search,
  Star,
  Download,
  Eye,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export default function MyLeads() {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [purchasedLeads, setPurchasedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);

  // Additional protection - redirect if not a contractor
  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'contractor')) {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  // Fetch purchased leads
  useEffect(() => {
    const fetchPurchasedLeads = async () => {
      if (!currentUser || currentUser.role !== 'contractor') return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/contractor/auth/purchased-leads`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        // Handle different response structures
        if (data.success || data.purchasedLeads) {
          const leads = data.purchasedLeads || data.leads || [];
          // Map the lead data to match our expected structure
          const mappedLeads = leads.map(lead => ({
            ...lead,
            leadCost: lead.price || lead.leadCost || 0,
            urgency: lead.urgent || lead.urgency || lead.priority,
            purchasedAt: lead.createdAt, // Use createdAt as purchase date for now
            // Map customer contact information
            userName: lead.leadOwnerContact?.name || lead.userName,
            userEmail: lead.leadOwnerContact?.email || lead.userEmail || lead.customerContact,
            phone: lead.leadOwnerContact?.phone || lead.phone,
          }));
          setPurchasedLeads(mappedLeads);
          console.log(`Loaded ${mappedLeads.length} purchased leads`);
        } else if (Array.isArray(data)) {
          // Handle case where API returns array directly
          setPurchasedLeads(data);
          console.log(`Loaded ${data.length} purchased leads`);
        } else {
          throw new Error(data.error || data.message || 'Failed to fetch purchased leads');
        }
      } catch (err) {
        console.error('Error fetching purchased leads:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedLeads();
  }, [currentUser]);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'No date available';
      
      let date;
      
      // Handle Firestore timestamp format
      if (dateString && typeof dateString === 'object' && dateString._seconds) {
        date = new Date(dateString._seconds * 1000 + dateString._nanoseconds / 1000000);
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date unavailable';
    }
  };

  const formatBudget = (budgetValue) => {
    if (!budgetValue) return 'Budget not specified';
    
    const budgetLabels = {
      'under-1000': 'Under $1,000',
      '1000-5000': '$1,000 - $5,000',
      '5000-10000': '$5,000 - $10,000',
      '10000-25000': '$10,000 - $25,000',
      'above-25000': 'Above $25,000'
    };
    
    return budgetLabels[budgetValue] || budgetValue;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "urgent":
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getServiceIcon = (serviceType) => {
    const iconMap = {
      plumbing: "🔧",
      electrical: "⚡",
      cleaning: "🧹",
      landscaping: "🌿",
      painting: "🎨",
      carpentry: "🔨",
      default: "🏠",
    };
    return iconMap[serviceType] || iconMap.default;
  };

  const getLeadStatus = (lead) => {
    // This would typically come from your backend
    // For now, we'll determine based on purchase date
    const purchaseDate = new Date(lead.purchasedAt || lead.createdAt);
    const daysSincePurchase = Math.floor((new Date() - purchaseDate) / (1000 * 60 * 60 * 24));
    
    if (daysSincePurchase <= 1) return { status: 'new', color: 'bg-blue-100 text-blue-800' };
    if (daysSincePurchase <= 7) return { status: 'active', color: 'bg-green-100 text-green-800' };
    return { status: 'completed', color: 'bg-gray-100 text-gray-800' };
  };

  const openLeadModal = (lead) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
  };

  const exportLeads = () => {
    const csvContent = [
      ['Service Type', 'Customer', 'Email', 'Phone', 'Location', 'Budget', 'Purchased Date', 'Lead Cost'],
      ...filteredLeads.map(lead => [
        lead.serviceType,
        lead.userName || 'N/A',
        lead.userEmail || lead.customerContact || 'N/A',
        lead.phone || 'N/A',
        lead.location || 'N/A',
        formatBudget(lead.budget),
        formatDate(lead.purchasedAt || lead.createdAt),
        `$${lead.leadCost || 0}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredLeads = purchasedLeads.filter((lead) => {
    const matchesService = selectedService === "all" || lead.serviceType === selectedService;
    const matchesStatus = selectedStatus === "all" || getLeadStatus(lead).status === selectedStatus;
    const matchesSearch = searchTerm === "" || [
      lead.serviceType,
      lead.userName,
      lead.userEmail,
      lead.customerContact,
      lead.location,
      lead.description,
      ...(lead.responses ? Object.values(lead.responses) : [])
    ].some(field => 
      field && field.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesService && matchesStatus && matchesSearch;
  });

  // Get unique service types from purchased leads
  const availableServices = [...new Set(purchasedLeads.map(lead => lead.serviceType))];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 min-w-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your leads...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 min-w-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading leads: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 min-w-screen">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Leads</h1>
            <p className="text-gray-600">
              Manage and track your purchased leads
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={exportLeads}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => navigate('/contractor-dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse New Leads
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{purchasedLeads.length}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {purchasedLeads.filter(lead => getLeadStatus(lead).status === 'new').length}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${purchasedLeads.reduce((sum, lead) => sum + (lead.leadCost || 0), 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Lead Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${purchasedLeads.length > 0 
                    ? (purchasedLeads.reduce((sum, lead) => sum + (lead.leadCost || 0), 0) / purchasedLeads.length).toFixed(2)
                    : '0.00'
                  }
                </p>
              </div>
              <Filter className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Services</option>
              {availableServices.map((service) => (
                <option key={service} value={service}>
                  {service.charAt(0).toUpperCase() + service.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>

            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredLeads.length} of {purchasedLeads.length} leads
            </div>
          </div>
        </div>

        {/* Leads Grid */}
        {filteredLeads.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredLeads.map((lead) => {
              const leadStatus = getLeadStatus(lead);
              
              return (
                <div
                  key={lead.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openLeadModal(lead)}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getServiceIcon(lead.serviceType)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 capitalize">
                            {lead.serviceType} Service
                          </h3>
                          <p className="text-sm text-gray-500">
                            Purchased {formatDate(lead.purchasedAt || lead.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${leadStatus.color}`}>
                          {leadStatus.status}
                        </span>
                        {lead.urgency && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(lead.urgency)}`}>
                            {lead.urgency} priority
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{lead.userName || 'Name not available'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{lead.userEmail || 'Email not available'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{lead.phone || 'Phone not available'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{lead.location || 'Location not available'}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {lead.description || 'Full project details available in lead.'}
                    </p>

                    {/* Budget and Cost */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Customer Budget</p>
                        <p className="font-semibold text-gray-900">{formatBudget(lead.budget)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Lead Cost</p>
                        <p className="font-semibold text-green-600">${lead.leadCost || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Eye className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {purchasedLeads.length === 0 ? "No purchased leads yet" : "No leads match your filters"}
            </h3>
            <p className="text-gray-500 mb-4">
              {purchasedLeads.length === 0 
                ? "Start browsing and purchasing leads to see them here."
                : "Try adjusting your search criteria or filters."
              }
            </p>
            {purchasedLeads.length === 0 && (
              <button
                onClick={() => navigate('/contractor-dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Browse Available Leads
              </button>
            )}
          </div>
        )}
      </main>

      <Footer />

      {/* Lead Details Modal */}
      {showLeadModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-900 capitalize">
                  {selectedLead.serviceType} Service Details
                </h3>
                <button
                  onClick={() => setShowLeadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedLead.userName || 'Name not available'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedLead.userEmail || 'Email not available'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedLead.phone || 'Phone not available'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{selectedLead.location || 'Location not available'}</p>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Project Details</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="text-gray-900">{selectedLead.description || 'Project details available'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-sm text-gray-600">Budget</p>
                        <p className="font-medium">{formatBudget(selectedLead.budget)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Urgency</p>
                        <p className="font-medium capitalize">{selectedLead.urgency || 'Standard'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Posted</p>
                        <p className="font-medium">{formatDate(selectedLead.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Responses (if any) */}
                {selectedLead.responses && Object.keys(selectedLead.responses).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Customer Responses</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedLead.responses).map(([question, answer], index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-3">
                          <p className="text-sm text-gray-600">{question}</p>
                          <p className="text-gray-900">{answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Purchase Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Purchase Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Purchase Date</p>
                      <p className="font-medium">{formatDate(selectedLead.purchasedAt || selectedLead.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lead Cost</p>
                      <p className="font-medium text-green-600">${selectedLead.leadCost || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6 border-t mt-6">
                <button
                  onClick={() => setShowLeadModal(false)}
                  className="bg-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
