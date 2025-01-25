import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import HomePage from './components/HomePage';
import ChampionPage from './components/ChampionPage';
import AdminLayout from './components/Admin/AdminLayout';
import Dashboard from './components/Admin/Dashboard';
import ChampionsManager from './components/Admin/ChampionsManager';
import TeamsManager from './components/Admin/TeamsManager';
import MatchesManager from './components/Admin/MatchesManager';
import TeamAccess from './components/TeamAccess';
import AdminLogin from './components/Admin/AdminLogin';
import TeamManagement from './components/TeamManagement';

const ProtectedAdminRoute = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/champion/:id" element={<ChampionPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin" element={<ProtectedAdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="champions" element={<ChampionsManager />} />
            <Route path="teams" element={<TeamsManager />} />
            <Route path="matches" element={<MatchesManager />} />
          </Route>
        </Route>
        <Route path="/team-access" element={<TeamAccess />} />
        <Route path="/team-management/:teamId" element={<TeamManagement />} />
      </Routes>
    </Router>
  );
}

export default App;