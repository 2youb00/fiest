import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, Users } from 'lucide-react';
import axios from 'axios';

const HomePage = () => {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/champions')
      .then(response => {
        setChampions(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.response?.data?.message || 'Failed to fetch champions');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
         
        {/* Team Management Access Button */}
        <div className="flex justify-end mb-8">
          <Link
            to="/team-access"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
          >
            <Users className="w-5 h-5 mr-2" />
            Access Team Management
          </Link>
        </div> 
        <h1 className="text-4xl font-extrabold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
          Football Championships
        </h1>
       

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {champions.map((champion) => (
            <Link
              key={champion._id}
              to={`/champion/${champion._id}`}
              className="bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="relative w-20 h-20 mr-4 overflow-hidden rounded-full bg-gray-700">
                    <img 
                      src={champion.logo ? `http://localhost:5000${champion.logo}` : "/placeholder.svg?height=80&width=80"}
                      alt={champion.name}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold group-hover:text-blue-400 transition-colors duration-300">{champion.name}</h2>
                    <p className="text-sm text-gray-400">{champion.season}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                    <span className="text-sm">
                      {new Date(champion.startDate).toLocaleDateString()} - {new Date(champion.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-medium text-blue-400">View Details</span>
                    <Trophy className="w-6 h-6 text-yellow-500 transform transition-transform duration-300 group-hover:rotate-12" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;