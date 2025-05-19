"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import TradeHistoryTable from './TradeHistoryTable';

// Custom CSS for the component
const CustomStyle = () => {
  return (
    <Head>
      <style jsx global>{`
        .trader-row {
          transition: all 0.2s ease-in-out;
        }
        .trader-row:hover {
          background-color: rgba(59, 130, 246, 0.05);
          transform: translateY(-1px);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        .trader-avatar {
          transition: transform 0.2s ease;
        }
        .trader-row:hover .trader-avatar {
          transform: scale(1.05);
        }
        .trader-stats {
          transition: color 0.2s ease;
        }
        .trader-row:hover .trader-stats {
          color: #3b82f6;
        }
      `}</style>
    </Head>
  );
};

export default function TradersComponent({
  traders,
  loading,
  deleteLoading,
  searchTerm,
  setSearchTerm,
  handleTraderSelect,
  handleDeleteConfirmation,
  confirmDelete,
  setShowTraderModal
}) {
  const [selectedTrader, setSelectedTrader] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedTraderForUpdate, setSelectedTraderForUpdate] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profitGenerated: '',
    isVerified: true,
    bio: '',
    assignedUsers: []
  });
  
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Function to handle opening the update modal
  const handleOpenUpdateModal = (trader) => {
    setSelectedTraderForUpdate(trader);
    
    // Set initial form data
    setUpdateFormData({
      name: trader.name || '',
      email: trader.email || '',
      phone: trader.phone || '',
      profitGenerated: trader.profitGenerated || 0,
      isVerified: trader.isVerified !== undefined ? trader.isVerified : true,
      bio: trader.bio || '',
      assignedUsers: trader.assignedUsers || []
    });
    
    setShowUpdateModal(true);
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
        if (window.showNotification) {
          window.showNotification('error', 'Failed to fetch users');
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (window.showNotification) {
        window.showNotification('error', 'An error occurred while fetching users');
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  // Load users when the component mounts or when the update modal is opened
  useEffect(() => {
    if (showUpdateModal) {
      fetchUsers();
    }
  }, [showUpdateModal]);
  
  // Function to handle update form input changes
  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    
    // Parse numeric values
    if (['profitGenerated', 'successRate'].includes(name)) {
      const numValue = value !== '' ? parseFloat(value) : '';
      setUpdateFormData({
        ...updateFormData,
        [name]: numValue
      });
    } else {
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
  
  // Function to update trader
  const updateTrader = async (e) => {
    e.preventDefault();
    if (!selectedTraderForUpdate) return;
    
    setUpdateLoading(true);
    try {
      const response = await fetch(`/api/trader/${selectedTraderForUpdate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateFormData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Close the modal and reset form
        setShowUpdateModal(false);
        setSelectedTraderForUpdate(null);
        
        // Show success notification
        if (window.showNotification) {
          window.showNotification('success', 'Trader updated successfully');
        }
        
        // Refresh traders list
        if (window.fetchTraders) {
          window.fetchTraders();
        }
      } else {
        // Show error notification
        if (window.showNotification) {
          window.showNotification('error', data.message || 'Failed to update trader');
        }
      }
    } catch (error) {
      console.error('Error updating trader:', error);
      if (window.showNotification) {
        window.showNotification('error', 'An error occurred while updating the trader');
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <>
      <CustomStyle />
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <svg className="h-7 w-7 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Traders Management
          </h1>
          <button 
            onClick={() => setShowTraderModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg shadow-md flex items-center transition-colors duration-200 transform hover:scale-105"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Trader
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">All Traders</h2>
              {!loading && traders && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {traders.length}
                </span>
              )}
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search traders..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white text-gray-800 rounded-lg py-2.5 px-4 pl-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm w-64 transition-all duration-200 focus:w-72"
              />
              <svg className="h-5 w-5 text-gray-500 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
                  <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-l-4 border-blue-300 animate-ping opacity-20"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading traders...</p>
                <p className="text-sm text-gray-500">Please wait while we fetch the data</p>
              </div>
            </div>
          ) : traders && traders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Profit Generated</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Verification Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {traders.map((trader) => (
                    <tr 
                      key={trader._id} 
                      className="hover:bg-gray-50 cursor-pointer trader-row"
                      onClick={() => {
                        setSelectedTrader(trader);
                        handleTraderSelect(trader);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 trader-avatar">
                            {trader.profileImage ? (
                              <Image 
                                className="h-10 w-10 rounded-full object-cover border-2 border-blue-100" 
                                src={trader.profileImage} 
                                alt={trader.name}
                                width={40}
                                height={40}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                                <span className="text-white font-medium text-lg">{trader.name.charAt(0).toUpperCase()}</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{trader.name}</div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {trader.phone || 'No phone'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <svg className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {trader.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 trader-stats">
                          $<span className="font-medium">{trader.profitGenerated || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${trader.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {trader.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConfirmation(trader._id);
                            }}
                            className="text-red-600 hover:text-red-900 flex items-center transition-all duration-200 hover:scale-105"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8 border border-gray-200">
                <div className="flex flex-col items-center">
                  <div className="p-4 rounded-full bg-blue-50 mb-4">
                    <svg className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Traders Found</h3>
                  <p className="text-gray-600 mb-6 max-w-xs">Your trader list is empty. Get started by adding your first trader to the platform.</p>
                  <button
                    onClick={() => setShowTraderModal(true)}
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-md text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Your First Trader
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update Trader Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Update Trader</h3>
                    <div className="mt-4">
                      <form onSubmit={updateTrader}>
                        <div className="grid grid-cols-1 gap-y-2">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-0.5">Name</label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={updateFormData.name}
                              onChange={handleUpdateFormChange}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-0.5">Email</label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={updateFormData.email}
                              onChange={handleUpdateFormChange}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-0.5">Phone</label>
                            <input
                              type="text"
                              name="phone"
                              id="phone"
                              value={updateFormData.phone}
                              onChange={handleUpdateFormChange}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="profitGenerated" className="block text-sm font-medium text-gray-700 mb-0.5">Profit Generated ($)</label>
                              <input
                                type="number"
                                name="profitGenerated"
                                id="profitGenerated"
                                min="0"
                                value={updateFormData.profitGenerated}
                                onChange={handleUpdateFormChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="isVerified" className="block text-sm font-medium text-gray-700 mb-0.5">Verification Status</label>
                              <div className="flex items-center space-x-2 mt-1.5">
                                <button
                                  type="button"
                                  onClick={() => setUpdateFormData({...updateFormData, isVerified: true})}
                                  className={`px-3 py-1 rounded-md text-sm font-medium ${updateFormData.isVerified ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-300'}`}
                                >
                                  Verified
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setUpdateFormData({...updateFormData, isVerified: false})}
                                  className={`px-3 py-1 rounded-md text-sm font-medium ${!updateFormData.isVerified ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-gray-100 text-gray-600 border border-gray-300'}`}
                                >
                                  Unverified
                                </button>
                              </div>
                            </div>
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
                            <p className="mt-0.5 text-xs text-gray-500">Click on a user to select/deselect</p>
                          </div>
                          

                          
                          <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-0.5">Bio</label>
                            <textarea
                              name="bio"
                              id="bio"
                              rows="2"
                              value={updateFormData.bio}
                              onChange={handleUpdateFormChange}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            ></textarea>
                          </div>
                        </div>
                        
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                          <button
                            type="button"
                            onClick={() => setShowUpdateModal(false)}
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                            disabled={updateLoading}
                          >
                            {updateLoading ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                              </span>
                            ) : 'Update Trader'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Trader</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this trader? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => confirmDelete()}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </span>
                  ) : 'Delete'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleDeleteConfirmation(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
