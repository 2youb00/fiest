import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { User, Loader } from 'lucide-react';

const TopScorers = ({ matches }) => {
  const [playerPhotos, setPlayerPhotos] = useState({});

  const topScorers = useMemo(() => {
    const scorers = {};
    matches.forEach(match => {
      const matchPlayers = new Set();
      match.goalScorers.forEach(scorer => {
        const playerId = scorer.player._id;
        if (!scorers[playerId]) {
          scorers[playerId] = {
            id: playerId,
            name: scorer.player.name,
            goals: 0,
            matchesPlayed: 0,
            photos: scorers[playerId],
            team: match[`team${scorer.team}`].name
          };
        }
        scorers[playerId].goals++;
        if (!matchPlayers.has(playerId)) {
          scorers[playerId].matchesPlayed++;
          matchPlayers.add(playerId);
        }
      });
    });

    return Object.values(scorers)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10);
  }, [matches]);

  useEffect(() => {
    const fetchPlayerPhotos = async () => {
      const photoPromises = topScorers.map(scorer =>
        axios.get(`http://localhost:5000/api/team-management/player/${scorer.id}/photo`, {
          responseType: 'blob'
        })
        .then(response => {
          const url = URL.createObjectURL(response.data);
          return { id: scorer.id, url };
        })
        .catch(() => ({ id: scorer.id, url: null }))
      );

      const photos = await Promise.all(photoPromises);
      const photoMap = photos.reduce((acc, photo) => {
        acc[photo.id] = photo.url;
        return acc;
      }, {});

      setPlayerPhotos(photoMap);
    };

    fetchPlayerPhotos();

    return () => {
      // Cleanup object URLs
      Object.values(playerPhotos).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [topScorers]);

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex justify-between items-center text-gray-400 text-sm">
          <span className="w-16 text-center">#</span>
          <span className="flex-1">Player</span>
          <span className="w-16 text-center">Stats</span>
        </div>
      </div>
      <div className="divide-y divide-gray-800">
        {topScorers.map((scorer, index) => (
          <div 
            key={scorer.id}
            className="px-6 py-4 flex items-center hover:bg-gray-800/50 transition-colors"
          >
            <span className="w-16 text-center text-lg font-semibold text-gray-400">
              {index + 1}
            </span>
            <div className="flex-1 flex items-center">
              <div className="relative w-12 h-12 mr-4">
                {playerPhotos[scorer.id] ? (
                  <img
                    src={playerPhotos[scorer.id]}
                    alt={scorer.name}
                    className="rounded-full bg-gray-700 object-cover w-12 h-12"
                  />
                ) : (
                  <div className="rounded-full bg-gray-700 w-12 h-12 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-100">{scorer.name}</div>
                <div className="text-sm text-gray-400">{scorer.team}</div>
              </div>
            </div>
            <div className="w-32 text-right">
              <div className="text-lg font-semibold text-gray-100">
                {scorer.goals} goals
              </div>
              <div className="text-sm text-gray-400">
                All On Matches: {scorer.matchesPlayed}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopScorers;