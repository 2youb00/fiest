import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Plus, X, Camera, Trash2, Edit } from 'lucide-react';

const TeamManagement = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState({ name: '', photo: null, position: 'Reserve' });
  const [error, setError] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/team-management/team/${teamId}`);
      if (response.data) {
        setTeam(response.data);
        setPlayers(response.data.players || []);
      } else {
        setError('Team not found');
        navigate('/team-access');
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      setError('Failed to fetch team data. Please try again.');
      navigate('/team-access');
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    
    if (players.length >= 9) {
      setError('You have reached the maximum number of players (9).');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newPlayer.name);
      formData.append('position', newPlayer.position);
      if (newPlayer.photo) {
        formData.append('photo', newPlayer.photo);
      }

      const response = await axios.post(`http://localhost:5000/api/team-management/team/${teamId}/players`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPlayers([...players, response.data]);
      setNewPlayer({ name: '', photo: null, position: 'Reserve' });
      setError('');
      setIsAddingPlayer(false);
    } catch (error) {
      console.error('Error adding player:', error);
      setError('Failed to add player. Please try again.');
    }
  };

  const handleDeletePlayer = async (playerId) => {
    try {
      const player = players.find(p => p._id === playerId);
      if (player.matchesPlayed && player.matchesPlayed > 0) {
        setError('Cannot delete a player who has played in a match.');
        return;
      }

      await axios.delete(`http://localhost:5000/api/team-management/team/${teamId}/players/${playerId}`);
      setPlayers(players.filter(player => player._id !== playerId));
      setError('');
    } catch (error) {
      console.error('Error deleting player:', error);
      setError('Failed to delete player. Please try again.');
    }
  };

  const handlePlayerPositionChange = async (playerId, newPosition) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/team-management/team/${teamId}/players/${playerId}`, {
        position: newPosition
      });
      setPlayers(players.map(player => player._id === playerId ? response.data : player));
      
      // Update the lineup in the team object
      const updatedTeam = { ...team };
      const updatedLineup = { ...updatedTeam.lineup };
      
      // Remove the player from their old position
      Object.keys(updatedLineup).forEach(pos => {
        if (updatedLineup[pos] === playerId) {
          updatedLineup[pos] = null;
        }
      });
      
      // Add the player to their new position
      if (newPosition !== 'Reserve') {
        updatedLineup[newPosition.toLowerCase().replace(/\s+/g, '')] = playerId;
      }
      
      updatedTeam.lineup = updatedLineup;
      setTeam(updatedTeam);
      
      // Update the lineup on the server
      await axios.put(`http://localhost:5000/api/team-management/team/${teamId}/lineup`, updatedLineup);
    } catch (error) {
      console.error('Error updating player position:', error);
      setError('Failed to update player position. Please try again.');
    }
  };

  const handleEditPlayerImage = async (playerId, newImage) => {
    try {
      const formData = new FormData();
      formData.append('photo', newImage);

      const response = await axios.put(`http://localhost:5000/api/team-management/team/${teamId}/players/${playerId}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPlayers(players.map(player => player._id === playerId ? response.data : player));
      setEditingPlayerId(null);
      setError('');
    } catch (error) {
      console.error('Error updating player image:', error);
      setError('Failed to update player image. Please try again.');
    }
  };

  if (!team) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">{team.name} Management</h1>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">Team Lineup</h2>
            <LineupVisualization 
              players={players} 
              lineup={team.lineup}
              onPositionChange={handlePlayerPositionChange}
            />
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-blue-700">All Players</h2>
              <button
                onClick={() => setIsAddingPlayer(!isAddingPlayer)}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-300"
              >
                {isAddingPlayer ? 'Cancel' : 'Add Player'}
              </button>
            </div>
            {isAddingPlayer && (
              <form onSubmit={handleAddPlayer} className="mb-6 bg-gray-100 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={newPlayer.name}
                      onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <select
                      id="position"
                      value={newPlayer.position}
                      onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Reserve">Reserve</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">Photo (optional)</label>
                    <input
                      type="file"
                      id="photo"
                      onChange={(e) => setNewPlayer({ ...newPlayer, photo: e.target.files[0] })}
                      accept="image/*"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300">
                  Add Player
                </button>
              </form>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player) => (
                <PlayerCard
                  key={player._id}
                  player={player}
                  onDelete={handleDeletePlayer}
                  onEdit={() => setEditingPlayerId(player._id)}
                />
              ))}
            </div>
          </div>
        </div>

        {editingPlayerId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Edit Player Image</h3>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleEditPlayerImage(editingPlayerId, e.target.files[0]);
                  }
                }}
                className="mb-4 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => setEditingPlayerId(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LineupVisualization = ({ players, lineup, onPositionChange }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getPlayerById = (id) => players.find(player => player._id === id);

  const fieldPositions = [
    { position: 'Goalkeeper', top: '75%', left: '40%' },
    { position: 'Left Wing', top: '55%', left: '11%' },
    { position: 'Right Wing', top: '55%', left: '70%' },
    { position: 'Center Forward', top: '35%', left: '40%' },
    { position: 'Left Midfielder', top: '10%', left: '20%' },
    { position: 'Right Midfielder', top: '10%', left: '60%' },
  ];
  const fieldPositions2 = [
    { position: 'Goalkeeper', top: '75%', left: '47%' },
    { position: 'Left Wing', top: '60%', left: '20%' },
    { position: 'Right Wing', top: '60%', left: '80%' },
    { position: 'Center Forward', top: '40%', left: '47%' },
    { position: 'Left Midfielder', top: '20%', left: '30%' },
    { position: 'Right Midfielder', top: '20%', left: '70%' },
  ];
  const isPC = window.innerWidth > 768;
  const selectedFieldPositions = isPC ? fieldPositions2 : fieldPositions;

  const safeLineup = lineup || {};

  const reserves = players.filter(player => 
    !Object.values(safeLineup).includes(player._id)
  );

  const handlePlayerClick = (position) => {
    setSelectedPosition(position);
    setShowModal(true);
  };

  const handleRemoveFromLineup = (playerId) => {
    onPositionChange(playerId, 'Reserve');
  };

  const handleSelectPlayer = (player) => {
    onPositionChange(player._id, selectedPosition);
    setShowModal(false);
  };

  return (
    <div className="relative w-full h-96 bg-green-700 rounded-lg overflow-hidden shadow-inner">
      {/* Field markings */}
      <div className="absolute inset-0 border-2 border-white opacity-70"></div>
      <div className="absolute top-0 left-0 right-0 border-b-2 border-white opacity-70"></div>
      <div className="absolute -top-16 left-1/2 w-32 h-32 border-2 border-white opacity-70 rounded-full transform -translate-x-1/2"></div>
      <div className="absolute bottom-0 left-1/2 w-48 h-36 border-2 border-white opacity-70 transform -translate-x-1/2"></div>
      <div className="absolute bottom-0 left-1/2 w-24 h-16 border-2 border-white opacity-70 transform -translate-x-1/2"></div>
      <div className="absolute bottom-24 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2"></div>
      <div className="absolute bottom-24 left-1/2 w-32 h-16 border-t-2 border-white opacity-70 rounded-t-full transform -translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-r-2 border-white opacity-70 rounded-tr-full"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-l-2 border-white opacity-70 rounded-tl-full"></div>
      <div className="absolute bottom-0 left-1/2 w-16 h-4 border-2 border-white opacity-70 transform -translate-x-1/2"></div>

      {/* Players */}
      {selectedFieldPositions.map(({ position, top, left }) => {
        const playerId = safeLineup[position.toLowerCase().replace(/\s+/g, '')];
        const player = getPlayerById(playerId);
        return player ? (
          
          <PlayerIcon 
            key={player._id} 
            player={player} 
            style={{ top, left }} 
            onRemove={() => handleRemoveFromLineup(player._id)}
          />
        ) : (
          <EmptyPosition key={position} onClick={() => handlePlayerClick(position)} style={{ top, left }} />
        );
      })}

      {/* Reserves */}
      <div className="absolute top-2 left-2 flex flex-col items-start space-y-2">
        {reserves.map((player) => (
          <PlayerIcon key={player._id} player={player} isReserve />
        ))}
      </div>

      {/* Player Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Select Player for {selectedPosition}</h3>
            <div className="max-h-60 overflow-y-auto">
              {reserves.map((player) => (
                <button
                  key={player._id}
                  onClick={() => handleSelectPlayer(player)}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded-md mb-2 flex items-center transition duration-300"
                >
                  {player.photo ? (
                    <img src={`http://localhost:5000${player.photo}`} alt={player.name} className="w-10 h-10 rounded-full mr-3 object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                  <span>{player.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PlayerIcon = ({ player, style, isReserve, onRemove }) => (
  <div
    className={`absolute ${isReserve ? 'w-12 h-12' : 'w-16 h-16'} rounded-full flex flex-col items-center justify-center transition duration-300 transform hover:scale-110`}
    style={style}
  >
    {player.photo ? (
      <img
        src={`http://localhost:5000${player.photo}`}
        alt={player.name}
        className="w-full h-full rounded-full object-cover border-2 border-white"
      />
    ) : (
      <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center border-2 border-white">
        <User className="w-8 h-8 text-gray-200" />
      </div>
    )}
    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs whitespace-nowrap bg-black bg-opacity-50 px-2 py-1 rounded">
      {player.name}
    </div>
    {isReserve && (
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-xs whitespace-nowrap bg-black bg-opacity-50 px-2 py-1 rounded">
        Reserve
      </div>
    )}
    
    {!isReserve && onRemove && (
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-300"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);

const EmptyPosition = ({ onClick, style }) => (
  <div
    className="absolute w-16 h-16 rounded-full bg-gray-400 bg-opacity-50 flex items-center justify-center cursor-pointer transition duration-300 transform hover:scale-110"
    style={style}
    onClick={onClick}
  >
    <Plus className="w-8 h-8 text-white" />
  </div>
);

const PlayerCard = ({ player, onDelete, onEdit }) => (
  <div className="bg-white shadow-lg rounded-lg overflow-hidden transition duration-300 transform hover:scale-105">
    <div className="p-4">
      <div className="relative mb-4">
        {player.photo ? (
          <img src={`http://localhost:5000${player.photo}`} alt={player.name} className="w-24 h-24 object-cover rounded-full mx-auto" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mx-auto">
            <User className="w-12 h-12 text-gray-600" />
          </div>
        )}
        <button
          onClick={onEdit}
          className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 bg-blue-500 rounded-full p-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>
      <h3 className="text-xl font-semibold text-center mb-2">{player.name}</h3>
      <p className="text-gray-600 text-center mb-2">{player.position}</p>
      <p className="text-gray-600 text-center mb-4">Matches played: {player.matchesPlayed || 0}</p>
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => onDelete(player._id)}
          disabled={player.matchesPlayed && player.matchesPlayed > 0}
          className={`px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-300 ${
            player.matchesPlayed && player.matchesPlayed > 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

export default TeamManagement;