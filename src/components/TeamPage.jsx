import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

function TeamPage() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/teams/${id}`)
      .then(response => {
        setTeam(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.response?.data?.message || 'Failed to fetch team details');
        setLoading(false);
      });
  }, [id]);

 


  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!team) {
    return <div className="flex justify-center items-center h-screen">Team not found</div>;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <img src={team.logo || "/placeholder.svg?height=64&width=64"} alt={team.name} className="w-16 h-16 object-contain" />
          <h1 className="text-3xl font-bold">{team.name}</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Team Details</h2>
          <p><strong>Champion:</strong> {team.champion ? team.champion.name : 'Not specified'}</p>
          {/* Add more team details here */}
        </div>
        {/* You can add more sections here for players, matches, etc. */}
      </div>
    </div>
  );
}

export default TeamPage;