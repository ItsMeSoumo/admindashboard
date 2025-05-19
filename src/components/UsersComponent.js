"use client";

import { useState } from 'react';
import { useEffect } from 'react';
import Head from 'next/head';

// Custom CSS to hide green values with up arrows under MEMBER SINCE column
const CustomStyle = () => {
  return (
    <Head>
      <style jsx global>{`
        /* Hide green values with up arrows under MEMBER SINCE column */
        table tr td:nth-child(7) > span.bg-green-100,
        table tr td:nth-child(7) > div.bg-green-100 {
          display: none !important;
        }
        /* Ensure only the date text is visible */
        table tr td:nth-child(7) > *:not(.text-sm) {
          display: none !important;
        }
      `}</style>
    </Head>
  );
};

export default function UsersComponent({
  users,
  loading,
  deleteLoading,
  searchTerm,
  setSearchTerm,
  handleUserSelect,
  handleDeleteConfirmation,
  confirmDelete,
  setShowUserModal
}) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedUserForUpdate, setSelectedUserForUpdate] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({
    money: '',
    profit: '',
    presentmoney: ''
  });
  
  // Effect to remove unwanted green values with up arrows under MEMBER SINCE column
  useEffect(() => {
    // Function to remove the unwanted elements and fix table layout
    const fixTableLayout = () => {
      // Target the table cells in the MEMBER SINCE column
      const memberSinceCells = document.querySelectorAll('table tr td:nth-child(7)');
      
      memberSinceCells.forEach(cell => {
        // Find and remove any elements with green background and up arrows
        const greenElements = cell.querySelectorAll('span[class*="bg-green"], div[class*="bg-green"]');
        greenElements.forEach(el => {
          el.remove(); // Remove completely instead of just hiding
        });
        
        // Ensure the cell content is properly aligned
        if (cell.childNodes.length > 0) {
          cell.style.verticalAlign = 'middle';
          cell.style.textAlign = 'left';
        }
      });
      
      // Fix spacing and alignment for all cells
      const allCells = document.querySelectorAll('table td');
      allCells.forEach(cell => {
        cell.style.verticalAlign = 'middle';
      });
    };
    
    // Run the function after a short delay to ensure the DOM is fully rendered
    const timeoutId = setTimeout(fixTableLayout, 100);
    
    // Clean up the timeout
    return () => clearTimeout(timeoutId);
  }, [users]); // Re-run when users data changes
  
  // Function to handle opening the update modal
  const handleOpenUpdateModal = (user) => {
    setSelectedUserForUpdate(user);
    
    // Set initial form data - only money and present money
    setUpdateFormData({
      money: user.money || 0,
      presentmoney: user.presentmoney || 0
    });
    
    setShowUpdateModal(true);
  };
  
  // Function to handle update form input changes
  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    
    // Parse the input value to a number, ensuring it's a valid number
    let newValue = value;
    if (value !== '') {
      newValue = parseFloat(value);
      if (isNaN(newValue)) newValue = 0;
    }
    
    // Update form data
    setUpdateFormData({
      ...updateFormData,
      [name]: newValue
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
    if (!selectedUserForUpdate) return;
    
    // Convert empty values to 0 before submission
    const dataToSubmit = {
      money: updateFormData.money === '' ? 0 : parseFloat(updateFormData.money) || 0,
      presentmoney: updateFormData.presentmoney === '' ? 0 : parseFloat(updateFormData.presentmoney) || 0
    };
    
    setUpdateLoading(true);
    try {
      const response = await fetch(`/api/user/${selectedUserForUpdate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Close the modal and reset form
        setShowUpdateModal(false);
        setSelectedUserForUpdate(null);
        
        // Show success notification
        // We'll use a callback to notify the parent component
        if (window.showNotification) {
          window.showNotification('success', 'User updated successfully');
        }
        
        // Refresh users list
        if (window.fetchUsers) {
          window.fetchUsers();
        }
      } else {
        // Show error notification
        if (window.showNotification) {
          window.showNotification('error', data.message || 'Failed to update user');
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
      if (window.showNotification) {
        window.showNotification('error', 'An error occurred while updating the user');
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
        <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
        <button 
          onClick={() => setShowUserModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg shadow-md flex items-center transition-colors duration-200"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New User
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-lg font-semibold text-gray-800">All Users</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white text-gray-800 rounded-lg py-2.5 px-4 pl-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
            <svg className="h-5 w-5 text-gray-500 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Profit</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Present Money</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Member Since</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                      <p className="text-sm font-medium">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-gray-500 font-medium">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : users
                .filter(user => {
                  if (!searchTerm) return true;
                  return (
                    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
                  );
                })
                .map((user) => (
                <tr 
                  key={user._id} 
                  className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer" 
                  onClick={() => window.location.href = `/user/${user._id}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                        <span className="text-blue-600 font-semibold text-sm">{user.username ? user.username.substring(0, 2).toUpperCase() : 'U'}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-xs text-gray-500">{user.role || 'User'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-semibold">${user.money ? user.money.toFixed(2) : '0.00'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-semibold">${user.profit ? user.profit.toFixed(2) : '0.00'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-semibold">${user.presentmoney ? user.presentmoney.toFixed(2) : '0.00'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.money > 0 && user.presentmoney > 0 ? (
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.presentmoney >= user.money ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.presentmoney >= user.money ? (
                          <>
                            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            {Math.abs(((user.presentmoney - user.money) / user.money) * 100).toFixed(2)}%
                          </>
                        ) : (
                          <>
                            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            {Math.abs(((user.presentmoney - user.money) / user.money) * 100).toFixed(2)}%
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConfirmation(user._id, 'user');
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded-md shadow-sm transition-colors duration-200 text-xs flex items-center"
                    >
                      <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Update User Balance Modal */}
      {showUpdateModal && selectedUserForUpdate && (
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
              <p className="text-blue-800">Updating balance for: <span className="font-semibold">{selectedUserForUpdate.username}</span></p>
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
      </div>
    </>
  );
}
