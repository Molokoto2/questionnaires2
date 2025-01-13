import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, BarChart3, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Navigation = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-indigo-600 font-semibold">
              <ClipboardList className="h-6 w-6" />
              <span>Survey System</span>
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/create" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md">
                Create Survey
              </Link>
              <Link to="/" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md">
                My Surveys
              </Link>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;