"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';

export default function TradeHistoryTable({ entityId, entityType }) {
  const [tradeHistory, setTradeHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
  const [success, setSuccess] = useState('');

  // Fetch trade history for the specific entity (trader or user)
  const fetchTradeHistory = useCallback(async () => {
    if (!entityId) {
      console.log('No entityId provided, skipping fetch');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Construct query parameter based on entity type
      const queryParam = entityType === 'trader' ? 'traderId' : 'userId';
      console.log(`Fetching trade history for ${entityType} with ID ${entityId}`);
      const historyResponse = await fetch(`/api/tradeHistory?${queryParam}=${entityId}`);
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
      console.error(`Error fetching trade history for ${entityType}:`, error);
      setError('Failed to load trade history: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType]);

  // Use a ref to track if we've already fetched data for this entityId
  const fetchedRef = useRef(false);
  const prevEntityIdRef = useRef(null);
  
  // Load trade history when entityId changes
  useEffect(() => {
    // Only fetch if entityId exists and either:
    // 1. We haven't fetched yet, or
    // 2. The entityId has changed
    if (entityId && (!fetchedRef.current || prevEntityIdRef.current !== entityId)) {
      console.log('Fetching trade history for new entityId:', entityId);
      fetchTradeHistory();
      fetchedRef.current = true;
      prevEntityIdRef.current = entityId;
    }
  }, [entityId]);

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
  
  // Calculate profit/loss percentage relative to total amount
  const totalProfitLossPercentage = totalAmount > 0 ? ((totalProfitLoss / totalAmount) * 100).toFixed(2) : 0;
  
  // Calculate percentage for each trade
  const calculatePercentage = (profitLoss, amount) => {
    if (!amount || amount === 0) return 0;
    return ((profitLoss / amount) * 100).toFixed(2);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 mt-6 w-full max-w-full mx-auto overflow-hidden">
      <h3 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-200 border-b pb-4 border-gray-200 dark:border-gray-700">
        Trade History
      </h3>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-6 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {error}
        </div>
      ) : tradeHistory.length > 0 ? (
        <>
          {/* Summary stats */}
          <div className="flex justify-between mb-10 px-4">
            <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-xl shadow-md border border-blue-100 dark:border-gray-700 flex-1 mx-3 first:ml-0 last:mr-0 transform hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <p className="text-base font-medium text-blue-600 dark:text-blue-400">Total<br/>Trades</p>
                <p className="text-4xl font-bold text-gray-800 dark:text-white mt-3">{tradeHistory.length}</p>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-gray-800 p-6 rounded-xl shadow-md border border-purple-100 dark:border-gray-700 flex-1 mx-3 transform hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <p className="text-base font-medium text-purple-600 dark:text-purple-400">Total<br/>Amount</p>
                <p className="text-4xl font-bold text-gray-800 dark:text-white mt-3">${totalAmount.toLocaleString()}</p>
              </div>
            </div>
            <div className={`${totalProfitLoss >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} dark:bg-gray-800 dark:border-gray-700 p-6 rounded-xl shadow-md border flex-1 mx-3 last:mr-0 transform hover:scale-105 transition-transform duration-300`}>
              <div className="text-center">
                <p className={`text-base font-medium ${totalProfitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>Total<br/>Profit/Loss</p>
                <p className={`text-4xl font-bold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'} dark:text-white mt-3`}>
                  ${totalProfitLoss.toLocaleString()} 
                  <span className="text-sm font-medium block mt-1">({totalProfitLoss >= 0 ? '+' : ''}{totalProfitLossPercentage}%)</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Trade history table */}
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-full px-4">
            <table className="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  {entityType === 'trader' ? (
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-1/4">User</th>
                  ) : (
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-1/4">Trader</th>
                  )}
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-1/4">Amount</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-1/4">Profit/Loss</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-1/4">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {tradeHistory.map((trade) => {
                  const percentage = calculatePercentage(trade.profitLoss, trade.amount);
                  return (
                    <tr key={trade._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                      {entityType === 'trader' ? (
                        <td className="px-6 py-6 text-center text-base font-medium text-gray-700 dark:text-gray-300">
                          {trade.user?.username || 'No User'}
                        </td>
                      ) : (
                        <td className="px-6 py-6 text-center text-base font-medium text-gray-700 dark:text-gray-300">
                          {trade.trader?.name || 'Unknown Trader'}
                        </td>
                      )}
                      <td className="px-6 py-6 text-center text-base font-medium text-gray-700 dark:text-gray-300">
                        <span className="font-semibold text-lg">${trade.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className={`text-lg font-semibold ${trade.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {trade.profitLoss >= 0 ? '+' : ''}{trade.profitLoss.toLocaleString()}
                          <span className="text-sm block mt-1">({trade.profitLoss >= 0 ? '+' : ''}{percentage}%)</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <button
                          onClick={() => handleDeleteConfirmation(trade._id)}
                          className="p-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                          title="Delete trade"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
