import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, BookOpen, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function Books() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(null);
  const { token, user } = useAuth();

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.includes(searchTerm)
      );
      setFilteredBooks(filtered);
    }
  }, [searchTerm, books]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/books');
      setBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId) => {
    setBorrowing(bookId);
    try {
      const response = await axios.post('http://localhost:5000/api/borrow', 
        { book_id: bookId, due_days: 14 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const dueDate = new Date(response.data.due_date).toLocaleDateString();
      toast.success(`Book borrowed! Due date: ${dueDate}`);
      fetchBooks(); // Refresh to update available quantity
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to borrow book');
    } finally {
      setBorrowing(null);
    }
  };

  const getAvailabilityStatus = (book) => {
    if (book.available_quantity === 0) {
      return { text: 'Not Available', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (book.available_quantity <= 2) {
      return { text: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    } else {
      return { text: 'Available', color: 'text-green-600', bg: 'bg-green-100' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading books...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📚 Books Collection</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No books found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => {
            const status = getAvailabilityStatus(book);
            return (
              <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">{book.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-2">by {book.author}</p>
                  <p className="text-sm text-gray-500 mb-3">ISBN: {book.isbn}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="text-sm font-medium">{book.category}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-500">Location: {book.location}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-xs text-gray-500">Total Copies:</span>
                      <p className="font-semibold">{book.quantity}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Available:</span>
                      <p className="font-semibold text-green-600">{book.available_quantity}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleBorrow(book.id)}
                    disabled={book.available_quantity === 0 || borrowing === book.id}
                    className={`w-full py-2 rounded-lg transition ${
                      book.available_quantity === 0 || borrowing === book.id
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {borrowing === book.id ? 'Borrowing...' : 'Borrow Book 📖'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Books;