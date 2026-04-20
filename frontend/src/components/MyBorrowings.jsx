import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, AlertCircle, Clock, BookOpen, RotateCcw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function MyBorrowings() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const fetchBorrowings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/my-borrowings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBorrowings(response.data);
    } catch (error) {
      toast.error('Failed to load borrowings');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowingId) => {
    setReturning(borrowingId);
    try {
      const response = await axios.post('http://localhost:5000/api/return', 
        { borrowing_id: borrowingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.fine > 0) {
        toast.success(`Book returned! Fine amount: ₹${response.data.fine}`);
      } else {
        toast.success('Book returned successfully!');
      }
      fetchBorrowings();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to return book');
    } finally {
      setReturning(null);
    }
  };

  const getDueStatus = (dueDate, isOverdue) => {
    const due = new Date(dueDate);
    const today = new Date();
    
    if (isOverdue) {
      const daysOverdue = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
      return { text: `Overdue by ${daysOverdue} days`, color: 'text-red-600', bg: 'bg-red-100' };
    }
    
    const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) {
      return { text: `${daysLeft} days left`, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    }
    return { text: `${daysLeft} days left`, color: 'text-green-600', bg: 'bg-green-100' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading your borrowings...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">📖 My Borrowings</h1>

      {borrowings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-gray-500 text-lg mb-4">You haven't borrowed any books yet</p>
          <a
            href="/books"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Browse Books
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {borrowings.map((borrowing) => {
            const dueStatus = getDueStatus(borrowing.due_date, borrowing.is_overdue);
            return (
              <div key={borrowing.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{borrowing.title}</h3>
                    <p className="text-gray-600">by {borrowing.author}</p>
                    <p className="text-sm text-gray-500 mt-1">ISBN: {borrowing.isbn}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${dueStatus.bg} ${dueStatus.color}`}>
                    {dueStatus.text}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Borrowed Date</p>
                      <p className="text-sm">{new Date(borrowing.borrow_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="text-sm font-medium">{new Date(borrowing.due_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {borrowing.is_overdue && !borrowing.return_date && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} className="text-red-600" />
                    <p className="text-sm text-red-600">
                      ⚠️ This book is overdue! Please return as soon as possible to avoid additional fines.
                    </p>
                  </div>
                )}

                {!borrowing.return_date && (
                  <button
                    onClick={() => handleReturn(borrowing.id)}
                    disabled={returning === borrowing.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      returning === borrowing.id
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    <RotateCcw size={18} />
                    {returning === borrowing.id ? 'Processing...' : 'Return Book'}
                  </button>
                )}

                {borrowing.return_date && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={18} className="text-green-600" />
                        <p className="text-sm text-green-600">Returned on {new Date(borrowing.return_date).toLocaleDateString()}</p>
                      </div>
                      {borrowing.fine_amount > 0 && (
                        <p className="text-sm font-semibold text-red-600">Fine: ₹{borrowing.fine_amount}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyBorrowings;