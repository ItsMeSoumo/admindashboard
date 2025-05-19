"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Import component files
import UsersComponent from "../components/UsersComponent";
import TradersComponent from "../components/TradersComponent";
import ContactsComponent from "../components/ContactsComponent";
import SMMComponent from "../components/SMMComponent";
import DevComponent from "../components/DevComponent";
import DashboardComponent from "../components/DashboardComponent";
import TradeHistoryComponent from "../components/TradeHistoryComponent";


// Client component that uses useSearchParams
function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Check for tab query parameter on initial load
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['dashboard', 'users', 'traders', 'contacts', 'smm', 'dev', 'tradeHistory'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [smmEntries, setSmmEntries] = useState([]);
  const [devEntries, setDevEntries] = useState([]);
  const [traders, setTraders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTraderModal, setShowTraderModal] = useState(false);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    password: '',
    isAcceptingMessages: true,
    isVerified: true,
    role: 'user'
  });
  const [traderFormData, setTraderFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    isVerified: true,
    totalTrades: 0,
    profitGenerated: 0,
    role: 'trader'
  });
  const [transactionData, setTransactionData] = useState({
    type: 'deposit',
    amount: '',
    description: ''
  });
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch data when tabs are activated
  useEffect(() => {
    if (activeTab === 'contacts') {
      fetchContacts();
    } else if (activeTab === 'smm') {
      fetchSmmEntries();
    } else if (activeTab === 'dev') {
      fetchDevEntries();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'traders') {
      fetchTraders();
    }
  }, [activeTab]);
  
  // Function to fetch contacts from the API
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contact');
      const data = await response.json();
      if (data.success) {
        setContacts(data.data);
      } else {
        console.error('Failed to fetch contacts:', data.message);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to show notification
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };
  
  // Expose functions to window object for component access
  useEffect(() => {
    window.showNotification = showNotification;
    window.fetchUsers = fetchUsers;
    window.fetchTraders = fetchTraders;
    
    return () => {
      // Clean up when component unmounts
      delete window.showNotification;
      delete window.fetchUsers;
      delete window.fetchTraders;
    };
  }, []);
  
  // Function to fetch SMM entries
  const fetchSmmEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/smm');
      const data = await response.json();
      if (data.success) {
        setSmmEntries(data.data);
      } else {
        console.error('Failed to fetch SMM entries:', data.message);
      }
    } catch (error) {
      console.error('Error fetching SMM entries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch Dev entries
  const fetchDevEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dev');
      const data = await response.json();
      if (data.success) {
        setDevEntries(data.data);
      } else {
        console.error('Failed to fetch Dev entries:', data.message);
      }
    } catch (error) {
      console.error('Error fetching Dev entries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a contact
  const deleteContact = async (contactId) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/contact?id=${contactId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setContacts(contacts.filter(contact => contact._id !== contactId));
        showNotification('success', 'Contact deleted successfully');
      } else {
        showNotification('error', data.message || 'Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      showNotification('error', 'An error occurred while deleting the contact');
    } finally {
      setDeleteLoading(false);
      setConfirmDelete({ show: false, id: null, type: '' });
    }
  };

  // Function to delete an SMM entry
  const deleteSmmEntry = async (entryId) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/smm?id=${entryId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setSmmEntries(smmEntries.filter(entry => entry._id !== entryId));
        showNotification('success', 'SMM request deleted successfully');
      } else {
        showNotification('error', data.message || 'Failed to delete SMM request');
      }
    } catch (error) {
      console.error('Error deleting SMM entry:', error);
      showNotification('error', 'An error occurred while deleting the SMM request');
    } finally {
      setDeleteLoading(false);
      setConfirmDelete({ show: false, id: null, type: '' });
    }
  };

  // Function to fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        console.error('Failed to fetch users:', data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch traders
  const fetchTraders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trader');
      const data = await response.json();
      if (data.success) {
        setTraders(data.data);
      } else {
        console.error('Failed to fetch traders:', data.message);
      }
    } catch (error) {
      console.error('Error fetching traders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle user form input changes
  const handleUserFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserFormData({
      ...userFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Function to handle trader form input changes
  const handleTraderFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle numeric fields
    if (['totalTrades', 'profitGenerated'].includes(name)) {
      const numValue = value === '' ? 0 : parseFloat(value);
      setTraderFormData({
        ...traderFormData,
        [name]: isNaN(numValue) ? 0 : numValue
      });
    } else {
      setTraderFormData({
        ...traderFormData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Function to create a new user
  const createUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userFormData),
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers([...users, data.data]);
        setShowUserModal(false);
        setUserFormData({
          username: '',
          email: '',
          password: '',
          isAcceptingMessages: true,
          isVerified: true,
          role: 'user'
        });
        showNotification('success', 'User created successfully');
      } else {
        showNotification('error', data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showNotification('error', 'An error occurred while creating the user');
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new trader
  const createTrader = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/trader', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(traderFormData),
      });
      const data = await response.json();
      
      if (data.success) {
        setTraders([...traders, data.data]);
        setShowTraderModal(false);
        setTraderFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          isVerified: true,
          totalTrades: 0,
          profitGenerated: 0,
          role: 'trader'
        });
        showNotification('success', 'Trader created successfully');
      } else {
        showNotification('error', data.message || 'Failed to create trader');
      }
    } catch (error) {
      console.error('Error creating trader:', error);
      showNotification('error', 'An error occurred while creating the trader');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle transaction form input changes
  const handleTransactionFormChange = (e) => {
    const { name, value } = e.target;
    setTransactionData({
      ...transactionData,
      [name]: value
    });
  };

  // Function to add a transaction
  const addTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/user/${selectedUser._id}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      const data = await response.json();
      
      if (data.success) {
        // Update the selected user with the new transaction
        setSelectedUser(data.data);
        
        // Update the user in the users array
        setUsers(users.map(user => 
          user._id === selectedUser._id ? data.data : user
        ));
        
        setShowTransactionModal(false);
        setTransactionData({
          type: 'deposit',
          amount: '',
          description: ''
        });
        showNotification('success', 'Transaction added successfully');
      } else {
        showNotification('error', data.message || 'Failed to add transaction');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      showNotification('error', 'An error occurred while adding the transaction');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle delete confirmation
  const handleDeleteConfirmation = (id, type) => {
    setConfirmDelete({ show: true, id, type });
  };

  // Function to cancel delete
  const cancelDelete = () => {
    setConfirmDelete({ show: false, id: null, type: '' });
  };

  // Function to confirm delete
  const confirmDeleteAction = () => {
    if (confirmDelete.type === 'user') {
      deleteUser(confirmDelete.id);
    } else if (confirmDelete.type === 'contact') {
      deleteContact(confirmDelete.id);
    } else if (confirmDelete.type === 'smm') {
      deleteSmmEntry(confirmDelete.id);
    } else if (confirmDelete.type === 'dev') {
      deleteDevEntry(confirmDelete.id);
    } else if (confirmDelete.type === 'trader') {
      deleteTrader(confirmDelete.id);
    }
  };

  // Function to delete a user
  const deleteUser = async (userId) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/user?id=${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(users.filter(user => user._id !== userId));
        
        // If the deleted user is the currently selected user, go back to the users list
        if (selectedUser && selectedUser._id === userId) {
          setActiveTab('users');
          setSelectedUser(null);
        }
        
        showNotification('success', 'User deleted successfully');
      } else {
        showNotification('error', data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('error', 'An error occurred while deleting the user');
    } finally {
      setDeleteLoading(false);
      setConfirmDelete({ show: false, id: null, type: '' });
    }
  };

  // Function to delete a Dev entry
  const deleteDevEntry = async (entryId) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/dev?id=${entryId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setDevEntries(devEntries.filter(entry => entry._id !== entryId));
        showNotification('success', 'Development request deleted successfully');
      } else {
        showNotification('error', data.message || 'Failed to delete development request');
      }
    } catch (error) {
      console.error('Error deleting Dev entry:', error);
      showNotification('error', 'An error occurred while deleting the development request');
    } finally {
      setDeleteLoading(false);
      setConfirmDelete({ show: false, id: null, type: '' });
    }
  };

  // Handle user selection for detailed view
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setActiveTab('userDetail');
  };

  // Handle back button from user detail view
  const handleBackToUsers = () => {
    setActiveTab('users');
    setSelectedUser(null);
  };

  // Function to delete a trader
  const deleteTrader = async (traderId) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/trader?id=${traderId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setTraders(traders.filter(trader => trader._id !== traderId));
        showNotification('success', 'Trader deleted successfully');
      } else {
        showNotification('error', data.message || 'Failed to delete trader');
      }
    } catch (error) {
      console.error('Error deleting trader:', error);
      showNotification('error', 'An error occurred while deleting the trader');
    } finally {
      setDeleteLoading(false);
      setConfirmDelete({ show: false, id: null, type: '' });
    }
  };

  // Handle trader selection for detailed view
  const handleTraderSelect = (trader) => {
    // Navigate to the trader detail page
    router.push(`/trader/${trader._id}`);
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-md z-10 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Admin Panel</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                router.push('/?tab=dashboard');
              }}
              className={`w-full flex items-center p-3 rounded-md ${activeTab === 'dashboard' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('users');
                router.push('/?tab=users');
              }}
              className={`w-full flex items-center p-3 rounded-md ${activeTab === 'users' || activeTab === 'userDetail' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Users
            </button>
            <button
              onClick={() => {
                setActiveTab('traders');
                router.push('/?tab=traders');
              }}
              className={`w-full flex items-center p-3 rounded-md ${activeTab === 'traders' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Traders
            </button>
            <button
              onClick={() => {
                setActiveTab('tradeHistory');
                router.push('/?tab=tradeHistory');
              }}
              className={`w-full flex items-center p-3 rounded-md ${activeTab === 'tradeHistory' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Trade History
            </button>
            <button
              onClick={() => {
                setActiveTab('contacts');
                router.push('/?tab=contacts');
              }}
              className={`w-full flex items-center p-3 rounded-md ${activeTab === 'contacts' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contacts
            </button>
            <button
              onClick={() => {
                setActiveTab('smm');
                router.push('/?tab=smm');
              }}
              className={`w-full flex items-center p-3 rounded-md ${activeTab === 'smm' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              SMM
            </button>
            <button
              onClick={() => {
                setActiveTab('dev');
                router.push('/?tab=dev');
              }}
              className={`w-full flex items-center p-3 rounded-md ${activeTab === 'dev' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Development
            </button>

          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <DashboardComponent users={users} />
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <UsersComponent
            users={users}
            loading={loading}
            deleteLoading={deleteLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleUserSelect={handleUserSelect}
            handleDeleteConfirmation={(id) => handleDeleteConfirmation(id, 'user')}
            confirmDelete={confirmDelete.show && confirmDelete.type === 'user' ? confirmDeleteAction : null}
            setShowUserModal={setShowUserModal}
          />
        )}

        {/* Traders Tab */}
        {activeTab === 'traders' && (
          <TradersComponent
            traders={traders}
            loading={loading}
            deleteLoading={deleteLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleTraderSelect={handleTraderSelect}
            handleDeleteConfirmation={(id) => handleDeleteConfirmation(id, 'trader')}
            confirmDelete={confirmDelete.show && confirmDelete.type === 'trader' ? confirmDeleteAction : null}
            setShowTraderModal={setShowTraderModal}
          />
        )}

        {/* Trade History Tab */}
        {activeTab === 'tradeHistory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <svg className="h-7 w-7 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Trade History
              </h1>
            </div>
            <TradeHistoryComponent />
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <ContactsComponent
            contacts={contacts}
            loading={loading}
            deleteLoading={deleteLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleDeleteConfirmation={(id) => handleDeleteConfirmation(id, 'contact')}
            confirmDelete={confirmDelete.show && confirmDelete.type === 'contact' ? confirmDeleteAction : null}
          />
        )}

        {/* SMM Tab */}
        {activeTab === 'smm' && (
          <SMMComponent
            smmEntries={smmEntries}
            loading={loading}
            deleteLoading={deleteLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleDeleteConfirmation={(id) => handleDeleteConfirmation(id, 'smm')}
            confirmDelete={confirmDelete.show && confirmDelete.type === 'smm' ? confirmDeleteAction : null}
          />
        )}

        {/* Dev Tab */}
        {activeTab === 'dev' && (
          <DevComponent
            devEntries={devEntries}
            loading={loading}
            deleteLoading={deleteLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleDeleteConfirmation={(id) => handleDeleteConfirmation(id, 'dev')}
            confirmDelete={confirmDelete.show && confirmDelete.type === 'dev' ? confirmDeleteAction : null}
          />
        )}

        {/* User Detail View */}
        {activeTab === 'userDetail' && selectedUser && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <button 
                  onClick={handleBackToUsers}
                  className="mr-3 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                >
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                User Details
              </h1>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTransactionModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-md flex items-center transition-colors duration-200"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Transaction
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <h2 className="text-lg font-semibold text-gray-800">User Information</h2>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500 block">Username</span>
                      <span className="text-base font-medium">{selectedUser.username}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">Email</span>
                      <span className="text-base">{selectedUser.email}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">Role</span>
                      <span className="text-base capitalize">{selectedUser.role}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">Member Since</span>
                      <span className="text-base">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">Verification Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedUser.isVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-4">Financial Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500 block">Initial Investment</span>
                      <span className="text-base font-medium">${selectedUser.money?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">Current Balance</span>
                      <span className="text-base font-medium">${selectedUser.presentmoney?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">Profit/Loss</span>
                      <span className={`text-base font-medium ${selectedUser.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(selectedUser.profit || 0).toFixed(2)} {selectedUser.profit >= 0 ? '(Profit)' : '(Loss)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>
              </div>
              
              {selectedUser.transactions && selectedUser.transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedUser.transactions.map((transaction, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${transaction.type === 'deposit' ? 'bg-green-100 text-green-800' : 
                                transaction.type === 'withdrawal' ? 'bg-red-100 text-red-800' : 
                                transaction.type === 'profit' ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${transaction.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.description || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No transactions found for this user.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notification */}
        {notification.show && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {notification.message}
          </div>
        )}
        
        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New User</h2>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={createUser}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={userFormData.username}
                      onChange={handleUserFormChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={userFormData.email}
                      onChange={handleUserFormChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={userFormData.password}
                      onChange={handleUserFormChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <select
                      name="role"
                      value={userFormData.role}
                      onChange={handleUserFormChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isAcceptingMessages"
                      checked={userFormData.isAcceptingMessages}
                      onChange={handleUserFormChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Accept Messages
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isVerified"
                      checked={userFormData.isVerified}
                      onChange={handleUserFormChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Verified User
                    </label>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Trader Modal */}
        {showTraderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Trader</h2>
                <button 
                  onClick={() => setShowTraderModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={createTrader}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={traderFormData.name}
                      onChange={handleTraderFormChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={traderFormData.email}
                      onChange={handleTraderFormChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={traderFormData.phone}
                      onChange={handleTraderFormChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={traderFormData.password}
                      onChange={handleTraderFormChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Trades</label>
                      <input
                        type="number"
                        name="totalTrades"
                        value={traderFormData.totalTrades}
                        onChange={handleTraderFormChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profit Generated</label>
                      <input
                        type="number"
                        name="profitGenerated"
                        value={traderFormData.profitGenerated}
                        onChange={handleTraderFormChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isVerified"
                      checked={traderFormData.isVerified}
                      onChange={handleTraderFormChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Verified Trader
                    </label>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Trader'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {confirmDelete.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="text-center">
                <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Confirm Delete</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this {confirmDelete.type}? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteAction}
                    disabled={deleteLoading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Wrap the client component in a Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>}>
      <HomeContent />
    </Suspense>
  );
}
