import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  DollarSign,
  Eye,
  Star,
  Filter,
  Search,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LeadPurchaseModal from "../components/LeadPurchaseModal";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export default function ContractorDashboard() {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [purchasedLeads, setPurchasedLeads] = useState(new Set());
  const [selectedLead, setSelectedLead] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Additional protection - redirect if not a contractor
  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'contractor')) {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  // Mock data for now - replace with API call
  const mockLeads = [
    {
      id: 1,
      serviceType: "plumbing",
      title: "Bathroom Renovation",
      description: "Complete bathroom renovation needed including...",
      location: "Downtown Area",
      budget: "$2,000 - $5,000",
      postedTime: "2 hours ago",
      urgency: "high",
      leadCost: 15,
      estimatedValue: 3500,
      homeownerRating: 4.8,
      isPreview: true,
    },
    {
      id: 2,
      serviceType: "electrical",
      title: "Kitchen Electrical Work",
      description: "Need electrical outlets installed for new...",
      location: "Suburbs",
      budget: "$500 - $1,200",
      postedTime: "4 hours ago",
      urgency: "medium",
      leadCost: 8,
      estimatedValue: 850,
      homeownerRating: 4.2,
      isPreview: true,
    },
    {
      id: 3,
      serviceType: "cleaning",
      title: "Deep House Cleaning",
      description: "Post-construction deep cleaning required...",
      location: "City Center",
      budget: "$300 - $600",
      postedTime: "1 day ago",
      urgency: "low",
      leadCost: 5,
      estimatedValue: 450,
      homeownerRating: 4.6,
      isPreview: true,
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLeads(mockLeads);
      setLoading(false);
    }, 1000);
  }, []);

  const handlePurchaseLead = async (leadId, cost) => {
    try {
      // API call to purchase lead
      const response = await fetch(
        `${API_BASE_URL}/api/contractor/purchase-lead`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ leadId, cost }),
        }
      );

      if (response.ok) {
        setPurchasedLeads((prev) => new Set([...prev, leadId]));
        // Update the lead to show full information
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === leadId
              ? {
                  ...lead,
                  isPreview: false,
                  fullDescription:
                    lead.description + " Full details now available!",
                  customerContact: "john.doe@email.com",
                  phone: "(555) 123-4567",
                }
              : lead
          )
        );
      } else {
        alert("Failed to purchase lead. Please try again.");
      }
    } catch (error) {
      console.error("Error purchasing lead:", error);
      alert("Error purchasing lead. Please try again.");
    }
  };

  const openPurchaseModal = (lead) => {
    setSelectedLead(lead);
    setShowPurchaseModal(true);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesService =
      selectedService === "all" || lead.serviceType === selectedService;
    const matchesSearch =
      lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesService && matchesSearch;
  });

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getServiceIcon = (serviceType) => {
    const iconMap = {
      plumbing: "🔧",
      electrical: "⚡",
      cleaning: "🧹",
      default: "🏠",
    };
    return iconMap[serviceType] || iconMap.default;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 min-w-screen overflow-x-hidden">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading available leads...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 min-w-screen overflow-x-hidden">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser?.displayName || "Contractor"}!
          </h1>
          <p className="text-gray-600">
            Find and purchase quality leads for your business
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Available Leads
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredLeads.length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Purchased Today
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {purchasedLeads.size}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Potential Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {filteredLeads
                    .reduce((sum, lead) => sum + lead.estimatedValue, 0)
                    .toLocaleString()}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg. Lead Cost
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {Math.round(
                    filteredLeads.reduce(
                      (sum, lead) => sum + lead.leadCost,
                      0
                    ) / filteredLeads.length
                  ) || 0}
                </p>
              </div>
              <Filter className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
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
            </div>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Services</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="cleaning">Cleaning</option>
            </select>
          </div>
        </div>

        {/* Leads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {getServiceIcon(lead.serviceType)}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {lead.title}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {lead.serviceType}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                      lead.urgency
                    )}`}
                  >
                    {lead.urgency} priority
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {lead.isPreview
                    ? lead.description
                    : lead.fullDescription || lead.description}
                </p>

                {/* Location and Time */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {lead.isPreview
                        ? lead.location
                        : "Full address available"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{lead.postedTime}</span>
                  </div>
                </div>

                {/* Budget and Rating */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-semibold text-gray-900">{lead.budget}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Customer Rating</p>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-semibold">
                        {lead.homeownerRating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info (only if purchased) */}
                {!lead.isPreview && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-1">
                      Contact Information:
                    </p>
                    <p className="text-sm text-green-700">
                      Email: {lead.customerContact}
                    </p>
                    <p className="text-sm text-green-700">
                      Phone: {lead.phone}
                    </p>
                  </div>
                )}

                {/* Purchase Button */}
                {lead.isPreview ? (
                  <button
                    onClick={() => openPurchaseModal(lead)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Purchase Lead - ${lead.leadCost}
                  </button>
                ) : (
                  <div className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-center font-medium">
                    ✓ Lead Purchased
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Eye className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No leads found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or check back later for new
              opportunities.
            </p>
          </div>
        )}
      </main>

      <Footer />

      {/* Lead Purchase Modal */}
      <LeadPurchaseModal
        lead={selectedLead}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchase={handlePurchaseLead}
      />
    </div>
  );
}
