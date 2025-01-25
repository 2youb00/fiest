import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Trophy, Users } from 'lucide-react';
import KnockoutStage from './KnockoutStage';
import TopScorers from './TopScorers';

const ChampionPage = () => {
  const { id } = useParams();
  const [champion, setChampion] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('knockout');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [championResponse, teamsResponse, matchesResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/champions/${id}`),
          axios.get(`http://localhost:5000/api/teams/bychampion/${id}`),
          axios.get(`http://localhost:5000/api/matches/bychampion/${id}`)
        ]);
        setChampion(championResponse.data);
        setTeams(teamsResponse.data);
        setMatches(matchesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto p-4">
        {/* Champion Details Section */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={champion.logo ? `http://localhost:5000${champion.logo}` : "/placeholder.svg?height=96&width=96"}
              alt={champion.name} 
              className="w-24 h-24 mr-6 object-cover rounded-full bg-gray-700"
            />
            <div>
              <h1 className="text-4xl font-bold mb-2">{champion.name}</h1>
              <p className="text-xl text-gray-400">{champion.season}</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-md p-4 mb-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-2 text-center">Championship Details</h2>
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-5 h-5 mr-2 text-blue-400" />
              <span><strong>Start Date:</strong> {new Date(champion.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-400" />
              <span><strong>End Date:</strong> {new Date(champion.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-6">
          <button
            className={`px-4 py-2 mr-2 rounded-t-lg font-semibold transition duration-300 ${
              activeTab === 'knockout' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('knockout')}
          >
            <Trophy className="w-5 h-5 inline-block mr-2" />
            Knockout Stage
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold transition duration-300 ${
              activeTab === 'topScorers' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('topScorers')}
          >
            <Users className="w-5 h-5 inline-block mr-2" />
            Top Scorers
          </button>
        </div>

        {/* Content Section */}
          {activeTab === 'knockout' ? (
            <KnockoutStage teams={teams} matches={matches} champion={champion} />
          ) : (
            <TopScorers matches={matches} />
          )}

        {/* Return to Home Button */}
        <div className="mt-8 text-center">
          <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChampionPage;