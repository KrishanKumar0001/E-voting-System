import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Vote, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Vote className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SecureVote</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            
            {isAuthenticated && !isAdmin && (
              <Link
                to="/elections"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/elections') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Elections
              </Link>
            )}

            <Link
              to="/results"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/results') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Results
            </Link>

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin/dashboard') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {isAdmin ? (
                    <Shield className="h-5 w-5 text-green-600" />
                  ) : (
                    <User className="h-5 w-5 text-blue-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Register
                </Link>
                <Link
                  to="/admin/login"
                  className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 border border-green-600 hover:border-green-700 rounded-md transition-colors"
                >
                  Admin
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;