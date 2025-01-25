import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Calendar, Flag } from 'lucide-react';

const ChampionsManager = () => {
  const [champions, setChampions] = useState([]);
  const [name, setName] = useState('');
  const [season, setSeason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [logo, setLogo] = useState(null);
  const [startingRound, setStartingRound] = useState('Round of 16');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChampions();
  }, []);

  const fetchChampions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/champions');
      setChampions(response.data);
    } catch (error) {
      console.error('Error fetching champions:', error);
      setError('Failed to fetch champions. Please try again.');
    }
  };

  const handleChampionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('season', season);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('startingRound', startingRound);
    if (logo) {
      formData.append('logo', logo);
    }

    try {
      await axios.post('http://localhost:5000/api/champions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchChampions();
      resetForm();
    } catch (error) {
      console.error('Error adding champion:', error);
      setError('Failed to add champion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSeason('');
    setStartDate('');
    setEndDate('');
    setLogo(null);
    setStartingRound('Round of 16');
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Champions Manager</h2>
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">{error}</div>}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Add New  Champion</h3>
          <form onSubmit={handleChampionSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="season" className="block text-sm font-medium text-gray-700">Season</label>
                <input
                  type="text"
                  id="season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="startingRound" className="block text-sm font-medium text-gray-700">Starting Round</label>
                <select
                  id="startingRound"
                  value={startingRound}
                  onChange={(e) => setStartingRound(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="Round of 16">Round of 16</option>
                  <option value="Quarterfinal">Quarterfinal</option>
                </select>
              </div>
              <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700">Logo</label>
                <input
                  type="file"
                  id="logo"
                  onChange={(e) => setLogo(e.target.files[0])}
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
                />
              </div>
            </div>
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
                <Plus className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Adding...' : 'Add Champion'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Existing Champions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {champions.map((champion) => (
              <div key={champion._id} className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition duration-300">
                <div className="flex items-center mb-4">
                  <img src={`http://localhost:5000${champion.logo}` || "/placeholder.svg?height=64&width=64"} alt={champion.name} className="w-16 h-16 object-cover rounded-full mr-4" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{champion.name}</h4>
                    <p className="text-sm text-gray-600">{champion.season}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(champion.startDate).toLocaleDateString()} - {new Date(champion.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Flag className="w-4 h-4 mr-2" />
                    Starting Round: {champion.startingRound}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Matches: {champion.matches ? champion.matches.length : 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChampionsManager;