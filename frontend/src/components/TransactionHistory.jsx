import React, { useState, useEffect } from "react";
import {
  CreditCard,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Filter,
  Download,
  Eye,
  Receipt,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function TransactionHistory({ currentUser }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser || currentUser.role !== 'contractor') return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/contractor/auth/transactions`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched transactions:', data);
        
        if (data.success) {
          setTransactions(data.transactions || []);
          setCurrentBalance(data.currentBalance || 0);
          console.log(`Loaded ${data.count} transactions`);
        } else {
          throw new Error(data.error || 'Failed to fetch transactions');
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
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

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'credit':
      case 'add_credits':
      case 'credit_purchase':
      case 'deposit':
        return <ArrowUpCircle className="h-5 w-5 text-green-600" />;
      case 'debit':
      case 'purchase':
      case 'lead_purchase':
        return <ArrowDownCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Receipt className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'credit':
      case 'add_credits':
      case 'credit_purchase':
      case 'deposit':
        return 'text-green-600';
      case 'debit':
      case 'purchase':
      case 'lead_purchase':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionSign = (type) => {
    switch (type?.toLowerCase()) {
      case 'credit':
      case 'add_credits':
      case 'credit_purchase':
      case 'deposit':
        return '+';
      case 'debit':
      case 'purchase':
      case 'lead_purchase':
        return '-';
      default:
        return '';
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount', 'Balance After'],
      ...filteredTransactions.map(transaction => [
        formatDate(transaction.timestamp),
        transaction.type || 'N/A',
        transaction.description || 'N/A',
        `${getTransactionSign(transaction.type)}$${Math.abs(transaction.amount || 0).toFixed(2)}`,
        `$${(transaction.balanceAfter || 0).toFixed(2)}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaction-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filterType === "all") return true;
    if (filterType === "credit") {
      return ['credit', 'add_credits', 'credit_purchase', 'deposit'].includes(transaction.type?.toLowerCase());
    }
    if (filterType === "purchase") {
      return ['debit', 'purchase', 'lead_purchase'].includes(transaction.type?.toLowerCase());
    }
    return transaction.type?.toLowerCase().includes(filterType.toLowerCase());
  });

  const displayedTransactions = showAllTransactions ? filteredTransactions : filteredTransactions.slice(0, 5);

  if (!currentUser || currentUser.role !== 'contractor') {
    return null; // Don't render for non-contractors
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading transactions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error loading transactions: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <p className="text-sm text-gray-600">
            Current Balance: <span className="font-semibold text-green-600">${currentBalance.toFixed(2)}</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Transactions</option>
            <option value="credit">Credits Added</option>
            <option value="purchase">Lead Purchases</option>
          </select>
          
          {/* Export Button */}
          <button
            onClick={exportTransactions}
            className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-lg font-semibold text-gray-900">{transactions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <ArrowUpCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Credits Added</p>
              <p className="text-lg font-semibold text-green-600">
                ${transactions
                  .filter(t => ['credit', 'add_credits', 'credit_purchase', 'deposit'].includes(t.type?.toLowerCase()))
                  .reduce((sum, t) => sum + (t.amount || 0), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <ArrowDownCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-lg font-semibold text-red-600">
                ${transactions
                  .filter(t => ['debit', 'purchase', 'lead_purchase'].includes(t.type?.toLowerCase()))
                  .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length > 0 ? (
        <div>
          <div className="space-y-3">
            {displayedTransactions.map((transaction, index) => (
              <div
                key={transaction.id || index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getTransactionIcon(transaction.type)}
                  
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.description || 'Transaction'}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(transaction.timestamp)}</span>
                      <span className="text-gray-400">•</span>
                      <span className="capitalize">{transaction.type || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {getTransactionSign(transaction.type)}${Math.abs(transaction.amount || 0).toFixed(2)}
                  </p>
                  {transaction.balanceAfter !== undefined && (
                    <p className="text-sm text-gray-600">
                      Balance: ${(transaction.balanceAfter || 0).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Show More/Less Button */}
          {filteredTransactions.length > 5 && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowAllTransactions(!showAllTransactions)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {showAllTransactions 
                  ? `Show Less` 
                  : `Show All ${filteredTransactions.length} Transactions`
                }
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h4>
          <p className="text-gray-600">
            {filterType === "all" 
              ? "You haven't made any transactions yet."
              : `No ${filterType} transactions found.`
            }
          </p>
        </div>
      )}
    </div>
  );
}
