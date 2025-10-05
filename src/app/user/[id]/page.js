"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TradeHistoryTable from '../../../components/TradeHistoryTable';

export default function UserDetailPage({ params }) {
  // Store the ID in a state variable to avoid the params warning
  const [userId] = useState(params?.id);
  const router = useRouter();
  const [user, setUser] = useState(null);
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
    money: '',
    profit: '',
    presentmoney: ''
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Use a ref to track if we've already fetched data for this user
  const fetchedRef = useRef(false);
  const prevUserIdRef = useRef(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        console.log('Fetching user details for ID:', userId);
        const response = await fetch(`/api/user/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setUser(data.data);
          console.log('User data loaded successfully');
        } else {
          throw new Error(data.message || 'Failed to fetch user data');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch once when component mounts
    if (userId && !fetchedRef.current) {
      fetchUser();
      fetchedRef.current = true;
    }
  }, []);

  // Calculate profit/loss percentage
  const calculatePercentage = () => {
    if (!user || !user.money || user.money <= 0 || !user.presentmoney) {
      return { value: 0, isProfit: false };
    }
    
    const difference = user.presentmoney - user.money;
    const percentage = (difference / user.money) * 100;
    
    return {
      value: Math.abs(percentage).toFixed(2),
      isProfit: percentage >= 0
    };
  };
  
  // Function to show notification
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };
  
  // Function to handle opening the update modal
  const handleOpenUpdateModal = () => {
    if (!user) return;
    
    setUpdateFormData({
      money: user.money || 0,
      profit: user.profit || 0,
      presentmoney: user.presentmoney || 0
    });
    setShowUpdateModal(true);
  };
  
  // Function to handle update form input changes
  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData({
      ...updateFormData,
      [name]: value === '' ? '' : parseFloat(value) || 0
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
  
  // Function to update user money and profit
  const updateUser = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    // Convert empty values to 0 before submission
    const dataToSubmit = {
      money: updateFormData.money === '' ? 0 : parseFloat(updateFormData.money) || 0,
      profit: updateFormData.profit === '' ? 0 : parseFloat(updateFormData.profit) || 0,
      presentmoney: updateFormData.presentmoney === '' ? 0 : parseFloat(updateFormData.presentmoney) || 0
    };
    
    setUpdateLoading(true);
    try {
      const response = await fetch(`/api/user/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data);
        setShowUpdateModal(false);
        showNotification('success', 'User updated successfully');
      } else {
        showNotification('error', data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('error', 'An error occurred while updating the user');
    } finally {
      setUpdateLoading(false);
    }
  };
  
  // Function to delete user
  const deleteUser = async () => {
    if (!user) return;
    
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/user/${user._id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('success', 'User deleted successfully');
        // Redirect to dashboard after successful deletion
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        showNotification('error', data.message || 'Failed to delete user');
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('error', 'An error occurred while deleting the user');
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading User</h2>
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
              <p className="text-gray-600">The requested user could not be found.</p>
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

  const percentage = calculatePercentage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-16 px-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <button 
            onClick={() => router.push('/?tab=users')} 
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-300 bg-white py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Users
          </button>
        </div>
        
        <div className="p-8 sm:p-10 bg-white rounded-2xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-2">
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="h-6 w-6 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account Information
              </h2>
              <div className="space-y-5">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Username</span>
                  <span className="text-gray-800 font-medium">{user.username || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Email</span>
                  <span className="text-gray-800">{user.email || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Password</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800">{showPassword ? (user.password || 'N/A') : '•••••••••'}</span>
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
                  <span className="text-gray-600 font-medium">User ID</span>
                  <div className="flex-shrink-0 max-w-[60%] overflow-hidden">
                    <span className="text-xs font-mono bg-gray-100 p-1.5 rounded block truncate">{user._id}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Role</span>
                  <span className="capitalize bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{user.role || 'User'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Member Since</span>
                  <span className="text-gray-800">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="h-6 w-6 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Financial Summary
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center mb-3">
                    <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-base font-semibold text-blue-700">Initial Investment</p>
                  </div>
                  <div className="flex items-baseline overflow-hidden">
                    <span className="text-3xl font-bold text-gray-800 tabular-nums tracking-tight">$</span>
                    <span className="text-3xl font-bold text-gray-800 tabular-nums tracking-tight truncate">{user.money ? user.money.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-100 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center mb-3">
                    <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    <p className="text-base font-semibold text-purple-700">Current Balance</p>
                  </div>
                  <div className="flex items-baseline overflow-hidden">
                    <span className="text-3xl font-bold text-gray-800 tabular-nums tracking-tight">$</span>
                    <span className="text-3xl font-bold text-gray-800 tabular-nums tracking-tight truncate">{user.presentmoney ? user.presentmoney.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
                
                <div className={`${percentage.isProfit ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} rounded-xl p-6 border shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                  <div className="flex items-center mb-3">
                    <svg className={`h-5 w-5 ${percentage.isProfit ? 'text-green-600' : 'text-red-600'} mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={percentage.isProfit ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"} />
                    </svg>
                    <p className={`text-base font-semibold ${percentage.isProfit ? 'text-green-700' : 'text-red-700'}`}>Profit/Loss</p>
                  </div>
                  <div className="block">
                    <div className={`text-3xl font-bold tabular-nums tracking-tight ${percentage.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                      {percentage.isProfit ? '+$' : '-$'}{Math.abs(user.presentmoney - user.money).toFixed(2)}
                    </div>
                    <div className={`text-base mt-1 ${percentage.isProfit ? 'text-green-600' : 'text-red-600'} whitespace-nowrap`}>({percentage.value}%)</div>
                  </div>
                </div>
              </div>
            </div>
            
            {user.transactions && user.transactions.length > 0 && (
              <div className="mt-8">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Recent Transactions
                </h2>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 mb-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {user.transactions.slice(0, 5).map((transaction, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                transaction.type === 'deposit' || transaction.type === 'profit' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-baseline">
                                <span className="text-sm font-bold tabular-nums tracking-tight text-gray-800">
                                  ${transaction.amount ? transaction.amount.toFixed(2) : '0.00'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">
                                {transaction.description || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {transaction.date ? new Date(transaction.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
                  <div className="flex justify-end mt-4">
                    <Link href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                      <span>View All Transactions</span>
                      <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                </div>
              </div>
            </div>
            )}
            
            {/* Trade History Section */}
            <div className="mt-10 p-8 sm:p-10 bg-white rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                <svg className="h-6 w-6 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Trade History
              </h2>
              <div className="w-full overflow-hidden">
                <TradeHistoryTable entityId={userId} entityType="user" />
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <div className="flex space-x-4">
                <button 
                  onClick={() => window.history.back()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium h-10 px-6 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
              </div>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium h-10 px-6 rounded-lg shadow-md transition-colors duration-200 flex items-center"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete User
                </button>
                <button 
                  onClick={handleOpenUpdateModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 px-6 rounded-lg shadow-md transition-colors duration-200 flex items-center"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update
                </button>
              </div>
            </div>
            
            {/* Update Balance Modal */}
            {showUpdateModal && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Update User Balance</h2>
                    <button 
                      onClick={() => setShowUpdateModal(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-blue-800">Updating balance for: <span className="font-semibold">{user.username}</span></p>
                  </div>
                  <form onSubmit={updateUser}>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Money Balance ($)</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            name="money"
                            step="0.01"
                            value={updateFormData.money}
                            onChange={handleUpdateFormChange}
                            onFocus={handleInputFocus}
                            className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Present Money ($)</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            name="presentmoney"
                            step="0.01"
                            value={updateFormData.presentmoney}
                            onChange={handleUpdateFormChange}
                            onFocus={handleInputFocus}
                            className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-lg"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowUpdateModal(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {updateLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : 'Update Balance'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-200">
                  <div className="text-center">
                    <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Confirm Delete</h3>
                    <p className="text-gray-500 mb-6">
                      Are you sure you want to delete user <span className="font-semibold">{user.username}</span>? This action cannot be undone.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={deleteUser}
                        disabled={deleteLoading}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {deleteLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting...
                          </>
                        ) : 'Delete User'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Change Password Modal */}
            {showPasswordModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-md">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Change Password</h3>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
                      showNotification('error', 'New passwords do not match');
                      return;
                    }
                    
                    setPasswordLoading(true);
                    fetch(`/api/user/${user._id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ password: passwordFormData.newPassword }),
                    })
                      .then(response => response.json())
                      .then(data => {
                        if (data.success) {
                          setUser(data.data);
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
                    <div className="space-y-2">
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-0.5">New Password</label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwordFormData.newPassword}
                          onChange={(e) => setPasswordFormData({...passwordFormData, newPassword: e.target.value})}
                          className="w-full p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-0.5">Confirm Password</label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordFormData.confirmPassword}
                          onChange={(e) => setPasswordFormData({...passwordFormData, confirmPassword: e.target.value})}
                          className="w-full p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowPasswordModal(false)}
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
      </div>
    </div>
  );
}
