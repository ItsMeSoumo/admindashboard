"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TradeHistoryComponent() {
  const [tradeHistory, setTradeHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);
  const [tradeFormData, setTradeFormData] = useState({
    traderId: '',
    tradeType: 'buy',
    day: 'Monday',
    amount: '',
    profitLoss: ''
  });
  const [users, setUsers] = useState([]);
  const [traders, setTraders] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  // Fetch all trade history
  const fetchTradeData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all trade history
      console.log('Fetching trade history data...');
      const historyResponse = await fetch('/api/tradeHistory');
      const historyData = await historyResponse.json();
      
      console.log('Trade history API response:', historyData);
      
      if (historyData.success) {
        setTradeHistory(historyData.data);
        console.log('Trade history data set:', historyData.data);
      } else {
        setError(historyData.message || 'Failed to load trade history');
        console.error('API error:', historyData.message);
      }
    } catch (error) {
      console.error('Error fetching trade data:', error);
      setError('Failed to load trade data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch traders for the dropdown
  const fetchTraders = useCallback(async () => {
    try {
      const response = await fetch('/api/trader');
      const data = await response.json();
      
      if (data.success) {
        setTraders(data.data);
      }
    } catch (error) {
      console.error('Error fetching traders:', error);
    }
  }, []);

  // Fetch users for reference
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  // Use a ref to track if we've already loaded data
  const dataLoadedRef = useRef(false);
  
  // Load trade data when component mounts
  useEffect(() => {
    // Only load data once
    if (!dataLoadedRef.current) {
      const loadData = async () => {
        setLoading(true);
        try {
          console.log('Loading trade history data...');
          await fetchTradeData();
          await fetchTraders();
          await fetchUsers();
          dataLoadedRef.current = true;
        } catch (error) {
          console.error('Error loading data:', error);
          setError('Failed to load data');
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
    }
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTradeFormData({
      ...tradeFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!tradeFormData.traderId || !tradeFormData.amount) {
      setError('Trader and amount are required');
      return;
    }
    
    try {
      const response = await fetch('/api/tradeHistory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          traderId: tradeFormData.traderId,
          tradeType: tradeFormData.tradeType,
          day: tradeFormData.day,
          amount: parseFloat(tradeFormData.amount),
          profitLoss: parseFloat(tradeFormData.profitLoss) || 0
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Trade added successfully');
        setTradeFormData({
          traderId: '',
          tradeType: 'buy',
          day: 'Monday',
          amount: '',
          profitLoss: ''
        });
        fetchTradeData();
        setShowAddTradeModal(false);
      } else {
        setError(data.message || 'Failed to add trade');
      }
    } catch (error) {
      console.error('Error adding trade:', error);
      setError('An error occurred while adding the trade');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle delete confirmation
  const handleDeleteConfirmation = (id) => {
    setConfirmDelete({ show: true, id });
  };
  
  // Cancel delete
  const cancelDelete = () => {
    setConfirmDelete({ show: false, id: null });
  };
  
  // Delete trade
  const deleteTrade = async () => {
    if (!confirmDelete.id) return;
    
    setDeleteLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`/api/tradeHistory?id=${confirmDelete.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTradeHistory(tradeHistory.filter(trade => trade._id !== confirmDelete.id));
        setSuccess('Trade deleted successfully');
      } else {
        setError(data.message || 'Failed to delete trade');
      }
    } catch (error) {
      console.error('Error deleting trade:', error);
      setError('An error occurred while deleting the trade');
    } finally {
      setDeleteLoading(false);
      setConfirmDelete({ show: false, id: null });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Trade History</h2>
        <button
          onClick={() => setShowAddTradeModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Trade
        </button>
      </div>

      {/* Trade History Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">All Trades</h3>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : tradeHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trader</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Profit/Loss</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tradeHistory.map((trade) => (
                  <tr key={trade._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(trade.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {trade.trader?.name || 'Unknown Trader'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {trade.user?.username || 'No User'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{trade.day}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">{trade.tradeType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${trade.amount.toLocaleString()}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${trade.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.profitLoss >= 0 ? '+' : ''}{trade.profitLoss.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteConfirmation(trade._id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete trade"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No trade history found.
          </div>
        )}
      </div>

      {/* Success message */}
      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Confirm Delete</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this trade? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={deleteTrade}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Trade Modal */}
      {showAddTradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Add New Trade</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Trader</label>
                <select
                  name="traderId"
                  value={tradeFormData.traderId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                >
                  <option value="">Select a trader</option>
                  {traders.map(trader => (
                    <option key={trader._id} value={trader._id}>{trader.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Trade Type</label>
                <select
                  name="tradeType"
                  value={tradeFormData.tradeType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Day</label>
                <select
                  name="day"
                  value={tradeFormData.day}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Amount ($)</label>
                <input
                  type="number"
                  name="amount"
                  value={tradeFormData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Profit/Loss ($)</label>
                <input
                  type="number"
                  name="profitLoss"
                  value={tradeFormData.profitLoss}
                  onChange={handleInputChange}
                  placeholder="Enter profit or loss (negative for loss)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddTradeModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Trade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}