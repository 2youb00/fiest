import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Trophy, Users, Calendar } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === `/admin${path}` ? 'bg-gray-200' : '';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="mt-4">
          <Link
            to="/admin"
            className={`flex items-center px-4 py-2 text-gray-700 ${isActive('')}`}
          >
            <Home className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
          <Link
            to="/admin/champions"
            className={`flex items-center px-4 py-2 text-gray-700 ${isActive('/champions')}`}
          >
            <Trophy className="w-5 h-5 mr-2" />
            Champions
          </Link>
          <Link
            to="/admin/teams"
            className={`flex items-center px-4 py-2 text-gray-700 ${isActive('/teams')}`}
          >
            <Users className="w-5 h-5 mr-2" />
            Teams
          </Link>
          <Link
            to="/admin/matches"
            className={`flex items-center px-4 py-2 text-gray-700 ${isActive('/matches')}`}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Matches
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;