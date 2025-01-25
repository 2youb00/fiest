import React from 'react';
import { User } from 'lucide-react';

const LineupVisualization = ({ players, goalScorers, manOfTheMatch, matchLineup }) => {
  // Define positions and their coordinates
  const positions = {
    'Goalkeeper': { bottom: '5%', left: '50%', transform: 'translateX(-50%)'   },
    'Left Wing': { bottom: '30%', left: '20%' },
    'Right Wing': { bottom: '30%', right: '20%' },
    'Center Forward': { bottom: '55%', left: '50%', transform: 'translateX(-50%)' },
    'Left Midfielder': { bottom: '80%', left: '15%' },
    'Right Midfielder': { bottom: '80%', right: '15%' }
  };

  // Filter players by position
  const getPlayersByPosition = () => {
    if (matchLineup) {
      const fieldPlayers = {};
      const reservePlayers = [];

      players.forEach(player => {
        const position = Object.keys(matchLineup).find(pos => matchLineup[pos] === player._id);
        if (position) {
          fieldPlayers[position] = player;
        } else {
          reservePlayers.push(player);
        }
      });

      return {
        goalkeeper: fieldPlayers['goalkeeper'],
        fieldPlayers: Object.values(fieldPlayers).filter(player => player.position !== 'Goalkeeper'),
        reservePlayers
      };
    } else {
      return {
        goalkeeper: players.find(player => player.position === 'Goalkeeper'),
        fieldPlayers: players.filter(player => 
          player.position !== 'Goalkeeper' && 
          player.position !== 'Reserve' &&
          positions[player.position]
        ),
        reservePlayers: players.filter(player => 
          player.position === 'Reserve' || !positions[player.position]
        )
      };
    }
  };

  const { goalkeeper, fieldPlayers, reservePlayers } = getPlayersByPosition();

  // Count goals for each player
  const goalCounts = goalScorers.reduce((counts, scorer) => {
    counts[scorer.player._id] = (counts[scorer.player._id] || 0) + 1;
    return counts;
  }, {});

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full h-96 bg-green-700 rounded-lg overflow-hidden mb-4">
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

        {/* Goalkeeper */}
        {goalkeeper && (
          <PlayerIcon
            player={goalkeeper}
            style={positions['Goalkeeper']}
            goalCount={goalCounts[goalkeeper._id] || 0}
            isManOfTheMatch={manOfTheMatch && manOfTheMatch._id === goalkeeper._id}
          />
        )}

        {/* Field players */}
        {fieldPlayers.map((player) => (
          <PlayerIcon
            key={player._id}
            player={player}
            style={positions[player.position]}
            goalCount={goalCounts[player._id] || 0}
            isManOfTheMatch={manOfTheMatch && manOfTheMatch._id === player._id}
          />
        ))}
      </div>

      {/* Reserve players */}
      <div className="w-full bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white text-lg font-semibold mb-2">Reserves</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {reservePlayers.map((player) => (
            <ReservePlayerIcon 
              key={player._id} 
              player={player}
              goalCount={goalCounts[player._id] || 0}
              isManOfTheMatch={manOfTheMatch && manOfTheMatch._id === player._id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const PlayerIcon = ({ player, style, goalCount, isManOfTheMatch }) => (
  <div
    className="absolute w-16 h-16 rounded-full flex flex-col items-center justify-center"
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
    {goalCount > 0 && (
      <div className="absolute -top-2 -right-2 w-auto h-5 bg-yellow-400 rounded-full flex items-center justify-center px-1">
        <span className="text-xs font-bold mr-1">{goalCount > 1 ? goalCount : ''}</span>⚽
      </div>
    )}
    {isManOfTheMatch && (
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-8 h-8">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gold" className="w-8 h-8">
          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
        </svg>
      </div>
    )}
    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs whitespace-nowrap bg-black bg-opacity-50 px-2 py-1 rounded">
      {player.name}
    </div>
  </div>
);

const ReservePlayerIcon = ({ player, goalCount, isManOfTheMatch }) => (
  <div className="flex flex-col items-center relative">
    <div className="w-16 h-16 rounded-full mb-2 relative">
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
      {goalCount > 0 && (
        <div className="absolute -top-2 -right-2 w-auto h-6 bg-yellow-400 rounded-full flex items-center justify-center px-1">
          <span className="text-xs font-bold mr-1">{goalCount > 1 ? goalCount : ''}</span>⚽
        </div>
      )}
      {isManOfTheMatch && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-8 h-8">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gold" className="w-8 h-8">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
    <div className="text-white text-sm text-center">
      {player.name}
    </div>
    <div className="text-yellow-400 text-xs">
      Reserve
    </div>
  </div>
);

export default LineupVisualization;