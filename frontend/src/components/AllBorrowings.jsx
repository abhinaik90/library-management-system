import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, User, BookOpen, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function AllBorrowings() {
  const [borrowings, setBorrowings] = useState([]);
  const [filteredBorrowings, setFilteredBorrowings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  if (user?.role !== 'admin') {
    navigate('/');
    return null;
  }

  useEffect(() => {
    fetchBorrowings();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBorrowings(borrowings);
    } else {
      const filtered = borrowings.filter(borrowing =>
        borrowing.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        borrowing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        borrowing.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBorrowings(filtered);
    }
  }, [searchTerm, borrowings]);

  const fetchBorrowings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/all-borrowings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBorrowings(response.data);
      setFilteredBorrowings(response.data);
    } catch (error) {
      toast.error('Failed to load borrowings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, isOverdue) => {
    if (status === 'returned') {
      return { text: 'Returned', color: 'text-green-600', bg: 'bg-green-100' };
    }
    if (isOverdue) {
      return { text: 'Overdue', color: 'text-red-600', bg: 'bg-red-100' };
    }
    return { text: 'Active', color: 'text-blue-600', bg: 'bg-blue-100' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading borrowings...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">👥 All Borrowings</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by member name, email, or book title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {filteredBorrowings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No borrowing records found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrowed Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBorrowings.map((borrowing) => {
                  const status = getStatusBadge(borrowing.status, borrowing.is_overdue);
                  return (
                    <tr key={borrowing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <div>
                            <p className="font-medium">{borrowing.user_name}</p>
                            <p className="text-xs text-gray-500">{borrowing.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className="text-gray-400" />
                          <div>
                            <p className="font-medium">{borrowing.title}</p>
                            <p className="text-xs text-gray-500">by {borrowing.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(borrowing.borrow_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className={`text-sm ${borrowing.is_overdue && borrowing.status === 'borrowed' ? 'text-red-600 font-semibold' : ''}`}>
                            {new Date(borrowing.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {borrowing.fine_amount > 0 ? (
                          <span className="text-red-600 font-semibold">₹{borrowing.fine_amount}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllBorrowings;