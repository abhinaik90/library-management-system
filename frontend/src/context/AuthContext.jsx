import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔍 Checking existing session...', { hasToken: !!storedToken, hasUser: !!storedUser });
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Set default axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        console.log('✅ Session restored for user:', parsedUser.email);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log('🔐 Attempting login for:', email);
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      const { token, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      console.log('✅ Login successful for:', user.email);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data?.error || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed. Make sure backend is running on port 5000'
      };
    }
  };

  const register = async (name, email, password, phone, student_id, class_name) => {
    console.log('📝 Attempting registration for:', email);
    try {
      const response = await axios.post('http://localhost:5000/api/register', { 
        name, email, password, phone, student_id, class: class_name
      });
      console.log('✅ Registration successful:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Register error:', error.response?.data?.error || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user:', user?.email);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};