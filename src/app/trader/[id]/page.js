"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import TradeHistoryTable from '../../../components/TradeHistoryTable';

export default function TraderDetailPage({ params }) {
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const traderId = resolvedParams.id;
  
  const router = useRouter();
  const [trader, setTrader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [updateFormData, setUpdateFormData] = useState({
    name: '',
    email: '',
    phone: '',
    totalTrades: 0,
    profitGenerated: 0,
    assignedUsers: []
  });
  
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Use a ref to track if we've already fetched data for this trader
  const fetchedRef = useRef(false);
  const prevTraderIdRef = useRef(null);
  
  useEffect(() => {
    const fetchTrader = async () => {
      setLoading(true);
      try {
        console.log('Fetching trader details for ID:', traderId);
        // Fetch the trader details
        const response = await fetch(`/api/trader/${traderId}`);
        const data = await response.json();
        
        if (data.success) {
          setTrader(data.data);
          console.log('Trader data loaded successfully');
          
          // Fetch users to get the user name for this trader
          await fetchUsers();
        } else {
          setError(data.message || 'Failed to load trader details');
        }
      } catch (error) {
        console.error('Error fetching trader details:', error);
        setError('Failed to load trader details');
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if traderId exists and either:
    // 1. We haven't fetched yet, or
    // 2. The traderId has changed
    if (traderId && (!fetchedRef.current || prevTraderIdRef.current !== traderId)) {
      fetchTrader();
      fetchedRef.current = true;
      prevTraderIdRef.current = traderId;
    }
  }, [traderId]);

  // Calculate success rate percentage
  const calculateSuccessRate = () => {
    if (!trader || !trader.totalTrades || trader.totalTrades <= 0) {
      return 0;
    }
    
    // For demonstration purposes, we'll calculate a random success rate
    // In a real app, this would be based on actual trader performance data
    return ((trader.profitGenerated / 1000) * 100).toFixed(2);
  };
  
  // Function to show notification
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };
  
  // Function to fetch users for dropdown
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.filter(user => user.role === 'user'));
      } else {
        console.error('Failed to fetch users:', data.message);
        showNotification('error', 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('error', 'An error occurred while fetching users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Function to handle opening the update modal
  const handleOpenUpdateModal = () => {
    if (!trader) return;
    
    // Fetch users when opening the modal
    fetchUsers();
    
    setUpdateFormData({
      name: trader.name || '',
      email: trader.email || '',
      phone: trader.phone || '',
      totalTrades: trader.totalTrades || 0,
      profitGenerated: trader.profitGenerated || 0,
      assignedUsers: trader.assignedUsers || []
    });
    setShowUpdateModal(true);
  };
  
  // Function to handle update form input changes
  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    
    if (['totalTrades', 'profitGenerated'].includes(name)) {
      // For numeric fields
      setUpdateFormData({
        ...updateFormData,
        [name]: value === '' ? '' : parseFloat(value) || 0
      });
    } else {
      // For text fields
      setUpdateFormData({
        ...updateFormData,
        [name]: value
      });
    }
  };
  
  // Function to toggle a user selection
  const toggleUserSelection = (userId) => {
    setUpdateFormData(prevData => {
      // Check if the user is already selected
      const isSelected = prevData.assignedUsers.includes(userId);
      
      if (isSelected) {
        // If selected, remove from the array
        return {
          ...prevData,
          assignedUsers: prevData.assignedUsers.filter(id => id !== userId)
        };
      } else {
        // If not selected, add to the array
        return {
          ...prevData,
          assignedUsers: [...prevData.assignedUsers, userId]
        };
      }
    });
  };
  
  // Function to handle input focus - clears the value if it's 0
  const handleInputFocus = (e) => {
    const { name, value } = e.target;
    if (value === '0' || value === 0) {
      setUpdateFormData({
        ...updateFormData,
        [name]: ''
      });
    }
  };
  
  // Function to update trader information
  const updateTrader = async (e) => {
    e.preventDefault();
    if (!trader) return;
    
    // Prepare data for submission
    const dataToSubmit = {
      name: updateFormData.name,
      email: updateFormData.email,
      phone: updateFormData.phone,
      totalTrades: updateFormData.totalTrades === '' ? 0 : parseInt(updateFormData.totalTrades) || 0,
      profitGenerated: updateFormData.profitGenerated === '' ? 0 : parseFloat(updateFormData.profitGenerated) || 0,
      assignedUsers: updateFormData.assignedUsers,
      isVerified: trader.isVerified // Preserve the existing isVerified status
    };
    
    setUpdateLoading(true);
    try {
      const response = await fetch(`/api/trader/${trader._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTrader(data.data);
        setShowUpdateModal(false);
        showNotification('success', 'Trader updated successfully');
      } else {
        showNotification('error', data.message || 'Failed to update trader');
      }
    } catch (error) {
      console.error('Error updating trader:', error);
      showNotification('error', 'An error occurred while updating the trader');
    } finally {
      setUpdateLoading(false);
    }
  };
  
  // Function to delete trader
  const deleteTrader = async () => {
    if (!trader) return;
    
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/trader/${trader._id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('success', 'Trader deleted successfully');
        // Redirect to dashboard after successful deletion
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        showNotification('error', data.message || 'Failed to delete trader');
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting trader:', error);
      showNotification('error', 'An error occurred while deleting the trader');
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Trader</h2>
              <p className="text-gray-600">{error}</p>
              <div className="mt-6 flex justify-center">
                <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                  Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trader) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Trader Not Found</h2>
              <p className="text-gray-600">The requested trader could not be found.</p>
              <div className="mt-6 flex justify-center">
                <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                  Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const successRate = calculateSuccessRate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={() => router.push('/?tab=traders')} 
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 bg-white py-1.5 px-3 rounded-lg shadow-sm"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Traders
          </button>
        </div>
        
        <div className="p-6 sm:p-8 bg-white rounded-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
                <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Trader Information
              </h2>
              <div className="space-y-5">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Name</span>
                  <span className="text-gray-800 font-medium">{trader.name || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Email</span>
                  <span className="text-gray-800">{trader.email || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Phone</span>
                  <span className="text-gray-800">{trader.phone || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Password</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800">{showPassword ? (trader.password || 'N/A') : '•••••••••'}</span>
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="p-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                      title="Change password"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Trader ID</span>
                  <div className="flex-shrink-0 max-w-[60%] overflow-hidden">
                    <span className="text-xs font-mono bg-gray-100 p-1.5 rounded block truncate">{trader._id}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Verification Status</span>
                  <span className={`capitalize px-3 py-1 rounded-full text-sm font-medium ${trader.isVerified ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {trader.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Member Since</span>
                  <span className="text-gray-800">
                    {trader.createdAt ? new Date(trader.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Unknown'}
                  </span>
                </div>
                
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 font-medium pt-1">Assigned Users</span>
                  <div className="text-right">
                    {trader.assignedUsers && trader.assignedUsers.length > 0 ? (
                      <div className="flex flex-col items-end">
                        {users.length > 0 ? (
                          trader.assignedUsers.map(userId => {
                            const user = users.find(u => u._id === userId);
                            return user ? (
                              <span key={userId} className="text-sm text-gray-800 mb-1 bg-blue-50 px-2 py-1 rounded">
                                {user.username} ({user.email})
                              </span>
                            ) : (
                              <span key={userId} className="text-sm text-gray-500 mb-1">User ID: {userId}</span>
                            );
                          })
                        ) : (
                          trader.assignedUsers.map(userId => (
                            <span key={userId} className="text-sm text-gray-500 mb-1">User ID: {userId}</span>
                          ))
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">No users assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
                <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Trading Performance
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <p className="text-sm text-gray-500 mb-1">Total Trades</p>
                  <div className="flex items-baseline overflow-hidden">
                    <span className="text-xl font-bold text-gray-800 tabular-nums tracking-tight">{trader.totalTrades || 0}</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <p className="text-sm text-gray-500 mb-1">Profit Generated</p>
                  <div className="flex items-baseline overflow-hidden">
                    <span className="text-xl font-bold text-gray-800 tabular-nums tracking-tight">$</span>
                    <span className="text-xl font-bold text-gray-800 tabular-nums tracking-tight truncate">{trader.profitGenerated ? trader.profitGenerated.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <p className="text-sm text-gray-500 mb-1">Success Rate</p>
                  <div className="block">
                    <div className="text-xl font-bold tabular-nums tracking-tight text-blue-500">
                      {successRate}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trade History Section */}
          <div className="mt-8 p-6 sm:p-8 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
              <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Trade History
            </h2>
            <TradeHistoryTable entityId={traderId} entityType="trader" />
          </div>
        </div>
            
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={handleOpenUpdateModal}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Update Trader Info
              </button>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Trader
              </button>
            </div>            
            {/* Update Balance Modal */}
            {showUpdateModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Update Trader Information</h3>
                  
                  <form onSubmit={updateTrader}>
                    <div className="space-y-2">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-0.5">Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={updateFormData.name}
                          onChange={handleUpdateFormChange}
                          className="w-full p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-0.5">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={updateFormData.email}
                          onChange={handleUpdateFormChange}
                          className="w-full p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-0.5">Phone</label>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          value={updateFormData.phone}
                          onChange={handleUpdateFormChange}
                          className="w-full p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="totalTrades" className="block text-sm font-medium text-gray-700 mb-0.5">Total Trades</label>
                        <input
                          type="number"
                          id="totalTrades"
                          name="totalTrades"
                          value={updateFormData.totalTrades}
                          onChange={handleUpdateFormChange}
                          onFocus={handleInputFocus}
                          className="w-full p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="profitGenerated" className="block text-sm font-medium text-gray-700 mb-0.5">Profit Generated ($)</label>
                        <input
                          type="number"
                          id="profitGenerated"
                          name="profitGenerated"
                          value={updateFormData.profitGenerated}
                          onChange={handleUpdateFormChange}
                          onFocus={handleInputFocus}
                          className="w-full p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Assign Users</label>
                        <div className="border border-gray-300 rounded-md max-h-36 overflow-y-auto p-1">
                          {isLoadingUsers ? (
                            <div className="text-center py-2 text-gray-500">Loading users...</div>
                          ) : users.length > 0 ? (
                            <div className="space-y-1">
                              {users.map(user => (
                                <div 
                                  key={user._id} 
                                  onClick={() => toggleUserSelection(user._id)}
                                  className={`cursor-pointer p-1 rounded-md transition-colors ${updateFormData.assignedUsers.includes(user._id) 
                                    ? 'bg-blue-100 border border-blue-300' 
                                    : 'hover:bg-gray-100 border border-transparent'}`}
                                >
                                  <div className="flex items-center">
                                    <div className={`w-4 h-4 rounded-sm mr-2 flex items-center justify-center ${updateFormData.assignedUsers.includes(user._id) ? 'bg-blue-500' : 'border border-gray-400'}`}>
                                      {updateFormData.assignedUsers.includes(user._id) && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                    <span>{user.username} ({user.email})</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-2 text-gray-500">No users available</div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Click on a user to select/deselect</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowUpdateModal(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                      >
                        {updateLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : 'Update'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="text-center">
              <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this trader? This action cannot be undone.</p>
              
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                
                <button
                  onClick={deleteTrader}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
                >
                  {deleteLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
            
            {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
                showNotification('error', 'New passwords do not match');
                return;
              }
              
              setPasswordLoading(true);
              fetch(`/api/trader/${trader._id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: passwordFormData.newPassword }),
              })
                .then(response => response.json())
                .then(data => {
                  if (data.success) {
                    setTrader(data.data);
                    setShowPasswordModal(false);
                    setPasswordFormData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    showNotification('success', 'Password updated successfully');
                  } else {
                    showNotification('error', data.message || 'Failed to update password');
                  }
                })
                .catch(error => {
                  console.error('Error updating password:', error);
                  showNotification('error', 'An error occurred while updating the password');
                })
                .finally(() => {
                  setPasswordLoading(false);
                });
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordFormData.newPassword}
                    onChange={(e) => setPasswordFormData({...passwordFormData, newPassword: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordFormData.confirmPassword}
                    onChange={(e) => setPasswordFormData({...passwordFormData, confirmPassword: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordFormData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                >
                  {passwordLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Notification */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {notification.message}
        </div>
      )}
          </div>
        </div>
  );
}
