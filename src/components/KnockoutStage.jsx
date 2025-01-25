import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Clock, Play, CheckCircle, X, User } from 'lucide-react';
import LineupVisualization from './LineupVisualization';

export default function KnockoutStage({ teams, matches, champion }) {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState({ team1: [], team2: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (champion) {
      createKnockoutRounds();
    }
  }, [champion, matches]);

  const createKnockoutRounds = () => {
    const roundMatches = {
      'Round of 16': matches.filter(match => match.stage === 'r16'),
      'Quarter-Finals': matches.filter(match => match.stage === 'quarter'),
      'Semi-Finals': matches.filter(match => match.stage === 'semi'),
      'Final': matches.filter(match => match.stage === 'final')
    };

    if (champion.startingRound === 'Quarterfinal') {
      return [
        { name: 'Quarter-Finals', matches: roundMatches['Quarter-Finals'] },
        { name: 'Semi-Finals', matches: roundMatches['Semi-Finals'] },
        { name: 'Final', matches: roundMatches['Final'] }
      ];
    } else {
      return [
        { name: 'Round of 16', matches: roundMatches['Round of 16'] },
        { name: 'Quarter-Finals', matches: roundMatches['Quarter-Finals'] },
        { name: 'Semi-Finals', matches: roundMatches['Semi-Finals'] },
        { name: 'Final', matches: roundMatches['Final'] }
      ];
    }
  };

  const knockoutRounds = createKnockoutRounds();

  const handleMatchClick = async (match) => {
    setSelectedMatch(match);
    if (match.team1 && match.team2) {
      try {
        const [team1Response, team2Response] = await Promise.all([
          axios.get(`http://localhost:5000/api/teams/${match.team1._id}/players?includePosition=true`),
          axios.get(`http://localhost:5000/api/teams/${match.team2._id}/players?includePosition=true`)
        ]);
        setTeamPlayers({
          team1: team1Response.data,
          team2: team2Response.data
        });
      } catch (error) {
        console.error('Error fetching team players:', error);
        setTeamPlayers({ team1: [], team2: [] });
        setError('Failed to fetch team players. Please try again later.');
      }
    } else {
      setTeamPlayers({ team1: [], team2: [] });
    }
  };

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="relative w-full max-w-7xl flex flex-col items-center">
        <h2 className="text-3xl font-bold text-white mb-8">Knockout Stage</h2>

        {knockoutRounds.map((round, roundIndex) => (
          <div key={round.name} className="w-full mb-8">
            <h3 className="text-lg font-semibold mb-4 text-white">{round.name}</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {round.matches.map((match, matchIndex) => (
                <MatchCard 
                  key={`${round.name}-${matchIndex}`} 
                  match={match} 
                  teams={teams}
                  isFinal={round.name === 'Final'}
                  onClick={() => handleMatchClick(match)}
                />
              ))}
            </div>
          </div>
        ))}

        {selectedMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full text-white max-h-[90vh] overflow-y-auto">
              <div className="flex justify-end mb-4">
                <button onClick={() => setSelectedMatch(null)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex justify-between items-center mb-6">
                <TeamDisplay team={selectedMatch.team1} />
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">
                    {selectedMatch.score1} - {selectedMatch.score2}
                  </div>
                  <div className="text-gray-400">Full time</div>
                </div>
                <TeamDisplay team={selectedMatch.team2} />
              </div>
              <div className="text-center text-gray-400 mb-6">
                <h4 className="text-xl font-semibold mb-2">Goal Scorers</h4>
                {selectedMatch.goalScorers && selectedMatch.goalScorers.length > 0 ? (
                  selectedMatch.goalScorers.map((scorer, index) => (
                    <div key={index}>
                      {scorer.player.name} ({scorer.team === 1 ? selectedMatch.team1.name : selectedMatch.team2.name}) {scorer.minute}'
                      {scorer.isPenalty && ' (Pen)'}
                    </div>
                  ))
                ) : (
                  <div>No goals scored</div>
                )}
              </div>
              {selectedMatch.manOfTheMatch && (
                <div className="text-center text-yellow-400 mb-6">
                  <h4 className="text-xl font-semibold mb-2">Man of the Match</h4>
                  <div>{selectedMatch.manOfTheMatch.name} ({selectedMatch.manOfTheMatch.team === 1 ? selectedMatch.team1.name : selectedMatch.team2.name})</div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-semibold mb-4">{selectedMatch.team1?.name || 'Team 1'} Lineup</h4>
                  <LineupVisualization 
                    players={teamPlayers.team1} 
                    goalScorers={selectedMatch.goalScorers?.filter(scorer => scorer.team === 1) || []}
                    manOfTheMatch={selectedMatch.manOfTheMatch?.team === 1 ? selectedMatch.manOfTheMatch : null}
                  />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-4">{selectedMatch.team2?.name || 'Team 2'} Lineup</h4>
                  <LineupVisualization 
                    players={teamPlayers.team2} 
                    goalScorers={selectedMatch.goalScorers?.filter(scorer => scorer.team === 2) || []}
                    manOfTheMatch={selectedMatch.manOfTheMatch?.team === 2 ? selectedMatch.manOfTheMatch : null}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const MatchCard = ({ match, teams, isFinal, onClick }) => {
  const getStatusIcon = () => {
    switch (match.status) {
      case 'Not Started':
        return <Clock className="w-5 h-5 text-gray-400" />;
      case 'Playing':
        return <Play className="w-5 h-5 text-green-400" />;
      case 'Ended':
        return <CheckCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getTeamName = (team) => {
    if (!team) return 'TBD';
    return team.name || 'TBD';
  };

  const getTeamLogo = (team) => {
    return team?.logo ? `http://localhost:5000${team.logo}` : null;
  };

  return (
    <div 
      className={`flex flex-col w-full md:w-[20rem] p-4 ${isFinal ? 'bg-yellow-500' : 'bg-gray-800'} text-white rounded-lg shadow-md mb-4 md:mb-0 cursor-pointer`}
      onClick={() => onClick(match)}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex flex-col items-center w-[45%]">
          {getTeamLogo(match.team1) ? (
            <img 
              src={getTeamLogo(match.team1)} 
              alt={getTeamName(match.team1)} 
              className="w-8 h-8 mb-2 object-contain bg-white rounded-full"
            />
          ) : (
            <div className="w-8 h-8 mb-2 bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <span className="text-sm text-center">{getTeamName(match.team1)}</span>
          <span className="font-bold text-lg">{match.score1 !== undefined ? match.score1 : '-'}</span>
        </div>
        <span className="font-bold mx-2 text-lg">vs</span>
        <div className="flex flex-col items-center w-[45%]">
          {getTeamLogo(match.team2) ? (
            <img 
              src={getTeamLogo(match.team2)} 
              alt={getTeamName(match.team2)} 
              className="w-8 h-8 mb-2 object-contain bg-white rounded-full"
            />
          ) : (
            <div className="w-8 h-8 mb-2 bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <span className="text-sm text-center">{getTeamName(match.team2)}</span>
          <span className="font-bold text-lg">{match.score2 !== undefined ? match.score2 : '-'}</span>
        </div>
      </div>
      <div className="flex justify-center items-center mt-2">
        {getStatusIcon()}
        <span className="ml-2  text-sm">{match.status}</span>
      </div>
    </div>
  );
};

const TeamDisplay = ({ team }) => (
  <div className="flex flex-col items-center">
    {team?.logo ? (
      <img 
        src={`http://localhost:5000${team.logo}`} 
        alt={team?.name} 
        className="w-16 h-16 object-contain mb-2"
      />
    ) : (
      <div className="w-16 h-16 mb-2 bg-gray-700 rounded-full flex items-center justify-center">
        <User className="w-8 h-8 text-gray-400" />
      </div>
    )}
    <span className="text-lg font-semibold">{team?.name || 'TBD'}</span>
  </div>
);