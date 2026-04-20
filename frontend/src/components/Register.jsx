import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('Attempting registration with:', { name, email, phone });
    
    const result = await register(name, email, password, phone);
    
    if (result.success) {
      toast.success('Registration successful! Please login.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      toast.error(result.error);
      console.error('Registration failed:', result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-800">📚 Library MS</h1>
          <p className="text-gray-600 mt-2">Create new account</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              minLength="4"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 4 characters</p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white transition ${
              loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        
        <p className="text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;