import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, PlusCircle, LogOut, Home, BookMarked } from 'lucide-react';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/books', icon: BookOpen, label: 'Books' },
    { path: '/my-borrowings', icon: BookMarked, label: 'My Borrowings' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/add-book', icon: PlusCircle, label: 'Add Book' });
    navItems.push({ path: '/all-borrowings', icon: Users, label: 'All Borrowings' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-indigo-800 text-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            📚 Library MS
          </h1>
          <p className="text-sm text-indigo-200 mt-2">{user?.name}</p>
          <p className="text-xs text-indigo-300 mt-1">
            {user?.role === 'admin' ? 'Administrator' : 'Member'}
          </p>
        </div>
        
        <nav className="mt-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 transition ${
                isActive(item.path) 
                  ? 'bg-indigo-900 border-l-4 border-white' 
                  : 'hover:bg-indigo-700'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-3 hover:bg-indigo-700 transition w-full text-left mt-8"
          >
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {children}
      </div>
    </div>
  );
}

export default Layout;