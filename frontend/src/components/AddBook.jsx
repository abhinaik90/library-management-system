import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function AddBook() {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    quantity: 1,
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  if (user?.role !== 'admin') {
    navigate('/');
    return null;
  }

  const categories = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Romance', 'Mystery', 'Biography', 'History', 'Science', 'Technology'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/books', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Book added successfully!');
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: '',
        quantity: 1,
        location: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">➕ Add New Book</h1>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Book Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Author *</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">ISBN *</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Shelf Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., A-101, B-202"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 rounded-lg text-white transition ${
                loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Adding Book...' : 'Add Book'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/books')}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBook;