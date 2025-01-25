import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import axios from 'axios';

export default function FixturesAndResults() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/matches')
      .then(response => {
        setMatches(response.data);
        if (response.data.length > 0) {
          setSelectedDate(new Date(response.data[0].date).toISOString().split('T')[0]);
        }
        setLoading(false);
      })
      .catch(error => {
        setError(error.response?.data?.message || 'Failed to fetch matches');
        setLoading(false);
      });
  }, []);


  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  const uniqueDates = [...new Set(matches.map(match => new Date(match.date).toISOString().split('T')[0]))].sort();

  const handlePrevDate = () => {
    const currentIndex = uniqueDates.indexOf(selectedDate);
    if (currentIndex > 0) {
      setSelectedDate(uniqueDates[currentIndex - 1]);
    }
  }

  const handleNextDate = () => {
    const currentIndex = uniqueDates.indexOf(selectedDate);
    if (currentIndex < uniqueDates.length - 1) {
      setSelectedDate(uniqueDates[currentIndex + 1]);
    }
  }

  const filteredMatches = matches.filter(match => new Date(match.date).toISOString().split('T')[0] === selectedDate);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Fixtures and Results</h1>
      
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handlePrevDate}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          disabled={selectedDate === uniqueDates[0]}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-xl font-semibold">
          {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <button
          onClick={handleNextDate}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          disabled={selectedDate === uniqueDates[uniqueDates.length - 1]}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      
      <div className="space-y-4">
        {filteredMatches.map(match => (
          <div key={match._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(match.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <img src={match.homeTeam.logo || "/placeholder.svg?height=24&width=24"} alt={match.homeTeam.name} className="w-6 h-6" />
                <span className="font-semibold">{match.homeTeam.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                {match.homeScore !== null && match.awayScore !== null ? (
                  <span className="font-bold text-lg">{match.homeScore} - {match.awayScore}</span>
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-400">vs</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{match.awayTeam.name}</span>
                <img src={match.awayTeam.logo || "/placeholder.svg?height=24&width=24"} alt={match.awayTeam.name} className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredMatches.length === 0 && (
        <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
          No matches scheduled for this date.
        </div>
      )}
    </div>
  )
}