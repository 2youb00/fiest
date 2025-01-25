import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Trash2, Plus, Save } from 'lucide-react';

const TeamsManager = () => {
  const [teams, setTeams] = useState([]);
  const [champions, setChampions] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [selectedChampion, setSelectedChampion] = useState('');
  const [teamLogo, setTeamLogo] = useState(null);
  const [teamEmail, setTeamEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingTeam, setEditingTeam] = useState(null);

  useEffect(() => {
    fetchTeams();
    fetchChampions();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError('Failed to fetch teams. Please try again.');
    }
  };

  const fetchChampions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/champions');
      setChampions(response.data);
    } catch (error) {
      console.error('Error fetching champions:', error);
      setError('Failed to fetch champions. Please try again.');
    }
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', teamName);
    formData.append('champion', selectedChampion);
    formData.append('email', teamEmail);
    if (teamLogo) {
      formData.append('logo', teamLogo);
    }

    try {
      await axios.post('http://localhost:5000/api/teams', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchTeams();
      resetForm();
    } catch (error) {
      console.error('Error adding team:', error);
      setError('Failed to add team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/teams/${id}`);
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      setError('Failed to delete team. Please try again.');
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setSelectedChampion(team.champion._id);
    setTeamEmail(team.email);
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', teamName);
    formData.append('champion', selectedChampion);
    formData.append('email', teamEmail);
    if (teamLogo) {
      formData.append('logo', teamLogo);
    }

    try {
      await axios.put(`http://localhost:5000/api/teams/${editingTeam._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchTeams();
      resetForm();
      setEditingTeam(null);
    } catch (error) {
      console.error('Error updating team:', error);
      setError('Failed to update team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTeamName('');
    setSelectedChampion('');
    setTeamLogo(null);
    setTeamEmail('');
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Teams Manager</h2>
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">{error}</div>}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            {editingTeam ? `Edit Team: ${editingTeam.name}` : 'Add New Team'}
          </h3>
          <form onSubmit={editingTeam ? handleUpdateTeam : handleTeamSubmit} className="space-y-4">
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">Team Name</label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="champion" className="block text-sm font-medium text-gray-700">Champion</label>
              <select
                id="champion"
                value={selectedChampion}
                onChange={(e) => setSelectedChampion(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="">Select a champion</option>
                {champions.map((champion) => (
                  <option key={champion._id} value={champion._id}>{champion.name} - {champion.season}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="teamEmail" className="block text-sm font-medium text-gray-700">Team Email</label>
              <input
                type="email"
                id="teamEmail"
                value={teamEmail}
                onChange={(e) => setTeamEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="teamLogo" className="block text-sm font-medium text-gray-700">Team Logo</label>
              <input
                type="file"
                id="teamLogo"
                onChange={(e) => setTeamLogo(e.target.files[0])}
                accept="image/*"
                className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                {loading ? (editingTeam ? 'Updating...' : 'Adding...') : (editingTeam ? 'Update Team' : 'Add Team')}
              </button>
              {editingTeam && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTeam(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Existing Teams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div key={team._id} className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition duration-300">
                <div className="flex items-center mb-4">
                  <img src={`http://localhost:5000${team.logo}` || "/placeholder.svg?height=64&width=64"} alt={team.name} className="w-16 h-16 object-cover rounded-full mr-4" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{team.name}</h4>
                    <p className="text-sm text-gray-600">{team.champion ? `${team.champion.name} - ${team.champion.season}` : 'No champion assigned'}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">Email: {team.email}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTeam(team)}
                    className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team._id)}
                    className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-300"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsManager;