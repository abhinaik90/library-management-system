import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, BookMarked, Users, BookCheck } from 'lucide-react';
import toast from 'react-hot-toast';

function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    activeBorrowings: 0,
    totalMembers: 0
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: BookOpen,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Available Books',
      value: stats.availableBooks,
      icon: BookCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Active Borrowings',
      value: stats.activeBorrowings,
      icon: BookMarked,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-full`}>
                <card.icon className={`${card.color} text-white`} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/books"
            className="bg-indigo-50 p-4 rounded-lg hover:bg-indigo-100 transition text-center"
          >
            <BookOpen className="inline-block text-indigo-600 mb-2" size={32} />
            <p className="font-semibold text-indigo-600">Browse Books</p>
            <p className="text-sm text-gray-600">Search and view available books</p>
          </a>
          <a
            href="/my-borrowings"
            className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition text-center"
          >
            <BookMarked className="inline-block text-green-600 mb-2" size={32} />
            <p className="font-semibold text-green-600">My Borrowings</p>
            <p className="text-sm text-gray-600">View borrowed books and due dates</p>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;