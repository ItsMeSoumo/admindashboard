"use client";

import { useState, useEffect } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardComponent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users data when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user');
        const data = await response.json();
        
        if (data.success) {
          setUsers(data.data);
        } else {
          setError(data.message || 'Failed to fetch users');
          console.error('Failed to fetch users:', data.message);
        }
      } catch (error) {
        setError('An error occurred while fetching users');
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      {/* Stats Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading dashboard data</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{users.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-600 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>12% increase</span>
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Money</p>
              <p className="text-2xl font-bold text-gray-800">
                ${users.reduce((total, user) => total + (parseFloat(user.money) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-600 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>8% increase</span>
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Profit</p>
              <p className="text-2xl font-bold text-gray-800">
                ${users.reduce((total, user) => total + (parseFloat(user.profit) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-600 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>15% increase</span>
            </p>
          </div>
        </div>
      </div>
      )}
      
      {/* Charts */}
      {!loading && !error && users.length > 0 && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Money vs Profit</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: 'Jan', money: 40000, profit: 15000 },
                  { name: 'Feb', money: 45000, profit: 18000 },
                  { name: 'Mar', money: 48000, profit: 20000 },
                  { name: 'Apr', money: 52000, profit: 22500 },
                  { name: 'May', money: 58000, profit: 25000 },
                  { name: 'Jun', money: 65000, profit: 28000 },
                ]}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#1F2937' }} 
                />
                <Area type="monotone" dataKey="money" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} name="Total Money" />
                <Area type="monotone" dataKey="profit" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} name="Total Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Users by Money</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={users
                    .sort((a, b) => (parseFloat(b.money) || 0) - (parseFloat(a.money) || 0))
                    .slice(0, 5)
                    .map(user => ({
                      name: user.username,
                      value: parseFloat(user.money) || 0
                    }))
                    .filter(item => item.value > 0)
                  }
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value" 
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#10B981" />
                  <Cell fill="#F59E0B" />
                  <Cell fill="#8B5CF6" />
                  <Cell fill="#EC4899" />
                </Pie>
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#1F2937' }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
