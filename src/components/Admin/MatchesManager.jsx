import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronRight, Plus, Save, RotateCcw, Clock, Play, CheckCircle, User, Award, Trash2, Loader } from 'lucide-react';

const MatchesManager = () => {
  const [matches, setMatches] = useState([]);
  const [champions, setChampions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startingRound, setStartingRound] = useState('Round of 16');
  const [selectedChampion, setSelectedChampion] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    if (selectedChampion) {
      fetchMatchesForChampion(selectedChampion);
    }
  }, [selectedChampion]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [championsRes, teamsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/champions'),
        axios.get('http://localhost:5000/api/teams')
      ]);
      setChampions(championsRes.data);
      setTeams(teamsRes.data);
      
      if (championsRes.data.length > 0) {
        setSelectedChampion(championsRes.data[0]._id);
        setStartingRound(championsRes.data[0].startingRound);
      }
    } catch (error) {
      handleAxiosError(error, 'Error fetching data:');
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchesForChampion = async (championId) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/matches/bychampion/${championId}`);
      setMatches(response.data);
      const champion = champions.find(c => c._id === championId);
      if (champion) {
        setStartingRound(champion.startingRound);
      }
    } catch (error) {
      handleAxiosError(error, 'Error fetching matches:');
      setError('Failed to fetch matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMatch = async (stage, position) => {
    const newMatch = {
      team1: null,
      team2: null,
      date: new Date().toISOString(),
      champion: selectedChampion,
      score1: 0,
      score2: 0,
      stage: stage,
      position: position,
      status: 'Not Started',
      goalScorers: [],
      manOfTheMatch: null
    };

    try {
      const response = await axios.post(`http://localhost:5000/api/matches`, newMatch);
      setMatches([...matches, response.data]);
    } catch (error) {
      handleAxiosError(error, 'Error adding match:');
      setError('Failed to add match. Please try again.');
    }
  };

  const handleUpdateMatch = async (matchId, updatedData) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/matches/${matchId}`, updatedData);
      const updatedMatches = matches.map(match => 
        match._id === matchId ? response.data : match
      );
      setMatches(updatedMatches);
    } catch (error) {
      handleAxiosError(error, 'Error updating match:');
      setError('Failed to update match. Please try again.');
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        await axios.delete(`http://localhost:5000/api/matches/${matchId}`);
        setMatches(matches.filter(match => match._id !== matchId));
      } catch (error) {
        handleAxiosError(error, 'Error deleting match:');
        setError('Failed to delete match. Please try again.');
      }
    }
  };

  const handleSave = async () => {
    try {
      await Promise.all(matches.map(match => 
        axios.put(`http://localhost:5000/api/matches/${match._id}`, match)
      ));
      alert('All changes saved successfully!');
    } catch (error) {
      handleAxiosError(error, 'Error saving changes:');
      setError('Failed to save changes. Please try again.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the bracket? This will clear all matches.')) {
      setMatches([]);
    }
  };

  const handleAxiosError = (error, message) => {
    console.error(message, error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
  };

  const getMatchesByStage = (stage) => {
    return matches.filter(match => match.stage === stage)
      .sort((a, b) => a.position - b.position);
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="w-full min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tournament Bracket</h1>
        <div className="mb-4">
          <label htmlFor="champion-select" className="block text-sm font-medium text-gray-700">Select Champion</label>
          <select
            id="champion-select"
            value={selectedChampion || ''}
            onChange={(e) => setSelectedChampion(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select a champion</option>
            {champions.map((champion) => (
              <option key={champion._id} value={champion._id}>{champion.name} - {champion.season}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-between items-start">
          {startingRound === 'Round of 16' && (
            <StageColumn
              title="Round of 16"
              matches={getMatchesByStage('r16')}
              onAddMatch={(position) => handleAddMatch('r16', position)}
              onUpdateMatch={handleUpdateMatch}
              onDeleteMatch={handleDeleteMatch}
              teams={teams}
              maxMatches={8}
            />
          )}
          <StageColumn
            title="Quarterfinal"
            matches={getMatchesByStage('quarter')}
            onAddMatch={(position) => handleAddMatch('quarter', position)}
            onUpdateMatch={handleUpdateMatch}
            onDeleteMatch={handleDeleteMatch}
            teams={teams}
            maxMatches={4}
          />
          <StageColumn
            title="Semifinal"
            matches={getMatchesByStage('semi')}
            onAddMatch={(position) => handleAddMatch('semi', position)}
            onUpdateMatch={handleUpdateMatch}
            onDeleteMatch={handleDeleteMatch}
            teams={teams}
            maxMatches={2}
          />
          <StageColumn
            title="Final"
            matches={getMatchesByStage('final')}
            onAddMatch={(position) => handleAddMatch('final', position)}
            onUpdateMatch={handleUpdateMatch}
            onDeleteMatch={handleDeleteMatch}
            teams={teams}
            maxMatches={1}
          />
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            <RotateCcw className="w-5 h-5 mr-2 inline-block" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <Save className="w-5 h-5 mr-2 inline-block" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const StageColumn = ({ title, matches, onAddMatch, onUpdateMatch, onDeleteMatch, teams, maxMatches }) => {
  return (
    <div className="flex-1">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {matches.map((match) => (
        <MatchCard
          key={match._id}
          match={match}
          onUpdateMatch={onUpdateMatch}
          onDeleteMatch={onDeleteMatch}
          teams={teams}
        />
      ))}
      {matches.length < maxMatches && (
        <div className="bg-white shadow rounded-lg p-4 mb-4 flex items-center justify-center">
          <button
            onClick={() => onAddMatch(matches.length + 1)}
            className="text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

const MatchCard = ({ match, onUpdateMatch, onDeleteMatch, teams }) => {
  const [score1, setScore1] = useState(match?.score1 || '');
  const [score2, setScore2] = useState(match?.score2 || '');
  const [showDetails, setShowDetails] = useState(false);
  const [goalScorers, setGoalScorers] = useState(match?.goalScorers || []);
  const [manOfTheMatch, setManOfTheMatch] = useState(match?.manOfTheMatch || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedScorer1, setSelectedScorer1] = useState('');
  const [selectedScorer2, setSelectedScorer2] = useState('');

  useEffect(() => {
    if (match) {
      setScore1(match.score1 || '');
      setScore2(match.score2 || '');
      setGoalScorers(match.goalScorers || []);
      setManOfTheMatch(match.manOfTheMatch || null);
    }
  }, [match]);

  const handleScoreChange = (team, value) => {
    if (team === 1) setScore1(value);
    else setScore2(value);
  };

  const handleScoreSubmit = async () => {
    if (match && match._id) {
      setLoading(true);
      setError('');
      try {
        await onUpdateMatch(match._id, { ...match, score1: parseInt(score1), score2: parseInt(score2) });
      } catch (error) {
        setError('Failed to update score. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTeamChange = async (teamNumber, teamId) => {
    if (match && match._id) {
      setLoading(true);
      setError('');
      try {
        const selectedTeam = teams.find(team => team._id === teamId);
        await onUpdateMatch(match._id, { ...match, [`team${teamNumber}`]: selectedTeam });
      } catch (error) {
        setError('Failed to update team. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = async (status) => {
    if (match && match._id) {
      setLoading(true);
      setError('');
      try {
        const response = await axios.put(`http://localhost:5000/api/matches/${match._id}/status`, { status });
        await onUpdateMatch(match._id, response.data);
      } catch (error) {
        setError('Failed to update match status. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddGoalScorer = async (teamNumber) => {
    setLoading(true);
    setError('');
    try {
      const playerId = teamNumber === 1 ? selectedScorer1 : selectedScorer2;
      if (!playerId) {
        setError('Please select a player before adding a goal scorer.');
        setLoading(false);
        return;
      }
      const newGoalScorer = { team: teamNumber, player: playerId };
      const updatedGoalScorers = [...goalScorers, newGoalScorer];
      await onUpdateMatch(match._id, { ...match, goalScorers: updatedGoalScorers });
      setGoalScorers(updatedGoalScorers);
      // Don't reset the selected scorer, allowing for multiple goals by the same player
    } catch (error) {
      setError('Failed to add goal scorer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGoalScorer = async (index) => {
    setLoading(true);
    setError('');
    try {
      const updatedGoalScorers = goalScorers.filter((_, i) => i !== index);
      await onUpdateMatch(match._id, { ...match, goalScorers: updatedGoalScorers });
      setGoalScorers(updatedGoalScorers);
    } catch (error) {
      setError('Failed to remove goal scorer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManOfTheMatchChange = async (playerId) => {
    setLoading(true);
    setError('');
    try {
      await onUpdateMatch(match._id, { ...match, manOfTheMatch: playerId });
      setManOfTheMatch(playerId);
    } catch (error) {
      setError('Failed to update Man of the Match. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <select
            value={match.team1?._id || ''}
            onChange={(e) => handleTeamChange(1, e.target.value)}
            className="mr-2  border rounded"
            disabled={loading}
          >
            <option value="">Select Team</option>
            {teams.map(team => (
              <option key={team._id} value={team._id}>{team.name}</option>
            ))}
          </select>
          {match.team1 && match.team1.logo && (
            <img
              src={`http://localhost:5000${match.team1.logo}`}
              alt={`${match.team1.name} logo`}
              className="w-5 h-5 mr-2"
            />
          )}
          <span>{match.team1 ? match.team1.name : 'TBD'}</span>
        </div>
        <input
          type="number"
          value={score1}
          onChange={(e) => handleScoreChange(1, e.target.value)}
          className="w-12 text-center border rounded"
          min="0"
          disabled={loading}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <select
            value={match.team2?._id || ''}
            onChange={(e) => handleTeamChange(2, e.target.value)}
            className="mr-2 border rounded"
            disabled={loading}
          >
            <option value="">Select Team</option>
            {teams.map(team => (
              <option key={team._id} value={team._id}>{team.name}</option>
            ))}
          </select>
          {match.team2 && match.team2.logo && (
            <img
              src={`http://localhost:5000${match.team2.logo}`}
              alt={`${match.team2.name} logo`}
              className="w-5 h-5 mr-2"
            />
          )}
          <span>{match.team2 ? match.team2.name : 'TBD'}</span>
        </div>
        <input
          type="number"
          value={score2}
          onChange={(e) => handleScoreChange(2, e.target.value)}
          className="w-12 text-center border rounded"
          min="0"
          disabled={loading}
        />
      </div>
      <div className="mt-2 flex justify-between">
        <button
          onClick={handleScoreSubmit}
          className="px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
          disabled={loading}
        >
          {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Update Score'}
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusChange('Not Started')}
            className={`p-1 rounded ${match.status === 'Not Started' ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Not Started"
            disabled={loading}
          >
            <Clock className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleStatusChange('Playing')}
            className={`p-1 rounded ${match.status === 'Playing' ? 'bg-green-200' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Playing"
            disabled={loading}
          >
            <Play className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleStatusChange('Ended')}
            className={`p-1 rounded ${match.status === 'Ended' ? 'bg-red-200' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Ended"
            disabled={loading}
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex justify-between items-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-800 focus:outline-none flex items-center"
          disabled={loading}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
          <ChevronRight className={`w-4 h-4 ml-1 transform ${showDetails ? 'rotate-90' : ''}`} />
        </button>
        <button
          onClick={() => onDeleteMatch(match._id)}
          className="text-red-600 hover:text-red-800 focus:outline-none"
          title="Delete Match"
          disabled={loading}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
      {showDetails && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-semibold mb-2">Goal Scorers</h4>
          {goalScorers.map((scorer, index) => (
            <div key={index} className="flex items-center justify-between mb-2">
              <span>
                {scorer.team === 1
                  ? match.team1?.players?.find(p => p._id === scorer.player)?.name
                  : match.team2?.players?.find(p => p._id === scorer.player)?.name} 
                (Team {scorer.team})
              </span>
              <button
                onClick={() => handleRemoveGoalScorer(index)}
                className="text-red-600 hover:text-red-800"
                disabled={loading}
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex items-center space-x-2 mb-4">
            <select
              value={selectedScorer1}
              onChange={(e) => setSelectedScorer1(e.target.value)}
              className="border rounded"
              disabled={loading}
            >
              <option value="">Select Team 1 Scorer</option>
              {match.team1?.players?.map(player => (
                <option key={player._id} value={player._id}>{player.name}</option>
              ))}
            </select>
            <button
              onClick={() => handleAddGoalScorer(1)}
              className="px-2 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50"
              disabled={loading}
            >
              Add Goal
            </button>
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <select
              value={selectedScorer2}
              onChange={(e) => setSelectedScorer2(e.target.value)}
              className="border rounded"
              disabled={loading}
            >
              <option value="">Select Team 2 Scorer</option>
              {match.team2?.players?.map(player => (
                <option key={player._id} value={player._id}>{player.name}</option>
              ))}
            </select>
            <button
              onClick={() => handleAddGoalScorer(2)}
              className="px-2 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50"
              disabled={loading}
            >
              Add Goal
            </button>
          </div>
          <h4 className="font-semibold mb-2">Man of the Match</h4>
          <div className="flex items-center space-x-2">
            <select
              value={manOfTheMatch || ''}
              onChange={(e) => handleManOfTheMatchChange(e.target.value)}
              className="border rounded"
              disabled={loading}
            >
              <option value="">Select Man of the Match</option>
              {match.team1?.players?.map(player => (
                <option key={player._id} value={player._id}>{player.name} (Team 1)</option>
              ))}
              {match.team2?.players?.map(player => (
                <option key={player._id} value={player._id}>{player.name} (Team 2)</option>
              ))}
            </select>
            {manOfTheMatch && (
              <Award className="w-5 h-5 text-yellow-500" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesManager;