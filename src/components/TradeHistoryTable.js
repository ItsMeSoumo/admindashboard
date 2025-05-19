"use client";

import { useState, useEffect } from 'react';

export default function TradeHistoryTable({ entityId, entityType }) {
  const [tradeHistory, setTradeHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
  const [success, setSuccess] = useState('');

  // Fetch trade history for the specific entity (trader or user)
  const fetchTradeHistory = async () => {
    if (!entityId) return;
    
    setLoading(true);
    try {
      // Construct query parameter based on entity type
      const queryParam = entityType === 'trader' ? 'traderId' : 'userId';
      const historyResponse = await fetch(`/api/tradeHistory?${queryParam}=${entityId}`);
      const historyData = await historyResponse.json();
      
      if (historyData.success) {
        setTradeHistory(historyData.data);
      } else {
        setError(historyData.message || 'Failed to load trade history');
      }
    } catch (error) {
      console.error(`Error fetching trade history for ${entityType}:`, error);
      setError('Failed to load trade history');
    } finally {
      setLoading(false);
    }
  };

  // Load trade history when entityId changes
  useEffect(() => {
    if (entityId) {
      fetchTradeHistory();
    }
  }, [entityId, fetchTradeHistory]);

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

  // Calculate total profit/loss
  const totalProfitLoss = tradeHistory.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
  
  // Calculate total amount traded
  const totalAmount = tradeHistory.reduce((sum, trade) => sum + (trade.amount || 0), 0);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
        Trade History
      </h3>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">
          {error}
        </div>
      ) : tradeHistory.length > 0 ? (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Trades</p>
              <p className="text-xl font-semibold">{tradeHistory.length}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
              <p className="text-xl font-semibold">${totalAmount.toLocaleString()}</p>
            </div>
            <div className={`bg-gray-50 dark:bg-gray-700 p-3 rounded-lg ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Profit/Loss</p>
              <p className="text-xl font-semibold">${totalProfitLoss.toLocaleString()}</p>
            </div>
          </div>
          
          {/* Trade history table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  {entityType === 'trader' ? (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  ) : (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trader</th>
                  )}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Day</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Profit/Loss</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tradeHistory.map((trade) => (
                  <tr key={trade._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(trade.date)}</td>
                    {entityType === 'trader' ? (
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {trade.user?.username || 'No User'}
                      </td>
                    ) : (
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {trade.trader?.name || 'Unknown Trader'}
                      </td>
                    )}
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{trade.day}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">{trade.tradeType}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${trade.amount.toLocaleString()}</td>
                    <td className={`px-4 py-2 whitespace-nowrap text-sm ${trade.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.profitLoss >= 0 ? '+' : ''}{trade.profitLoss.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
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
        </>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No trade history found.
        </div>
      )}
      
      {/* Success message */}
      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
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
    </div>
  );
}
