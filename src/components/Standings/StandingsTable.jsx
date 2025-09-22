import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import LoadingSpinner from '../Loading/LoadingSpinner';

const StandingsTable = ({ standings, language = 'en', loading = false }) => {
  const { darkMode } = useTheme();
  // Translations object
  const translations = {
    en: {
      position: '#',
      team: 'TEAM',
      played: 'P',
      won: 'W',
      drawn: 'D',
      lost: 'L',
      goals: 'GOALS',
      diff: 'DIFF',
      last5: 'LAST 5',
      points: 'PTS',
      form: {
        W: 'W',
        D: 'D',
        L: 'L'
      }
    },
    ar: {
      position: '#',
      team: 'الفريق',
      played: 'لعب',
      won: 'فاز',
      drawn: 'تعادل',
      lost: 'خسر',
      goals: 'الأهداف',
      diff: 'الفرق',
      last5: 'آخر 5',
      points: 'النقاط',
      form: {
        W: 'ف',
        D: 'ت',
        L: 'خ'
      }
    }
  };

  const t = translations[language] || translations.en;
  const isRTL = language === 'ar';

  // Function to render form indicators (W, D, L)
  const renderForm = (form) => {
    if (!form || !Array.isArray(form)) return null;
    
    return (
      <div className="flex space-x-1">
        {form.slice(-5).map((result, index) => {
          let bgColor = 'bg-gray-500'; // Default for no result
          let text = '-';
          
          if (result === 'W') {
            bgColor = 'bg-green-500';
            text = t.form.W;
          } else if (result === 'D') {
            bgColor = 'bg-gray-400';
            text = t.form.D;
          } else if (result === 'L') {
            bgColor = 'bg-red-500';
            text = t.form.L;
          }
          
          return (
            <div 
              key={index} 
              className={`${bgColor} w-5 h-5 flex items-center justify-center text-xs font-bold text-white rounded`}
            >
              {text}
            </div>
          );
        })}
      </div>
    );
  };

  // Function to determine position color based on position
  const getPositionColor = (position, totalTeams) => {
    // Example logic - customize based on your league's rules
    if (position <= 4) return 'bg-blue-500'; // Champions League
    if (position === 5 || position === 6) return 'bg-green-500'; // Europa League
    if (position >= totalTeams - 2) return 'bg-red-500'; // Relegation
    return 'bg-gray-700'; // Default
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner color={darkMode ? 'white' : 'gray'} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto transition-colors duration-200">
      <table className={`min-w-full transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
        <thead>
          <tr className={`text-xs transition-colors duration-200 ${darkMode ? 'text-gray-400 border-b border-gray-800' : 'text-gray-500 border-b border-gray-300'}`}>
            <th className="py-3 px-2 text-left w-10">{t.position}</th>
            <th className="py-3 px-2 text-center">{t.team}</th>
            <th className="py-3 px-2 text-center w-8">{t.played}</th>
            <th className="py-3 px-2 text-center w-8">{t.won}</th>
            <th className="py-3 px-2 text-center w-8">{t.drawn}</th>
            <th className="py-3 px-2 text-center w-8">{t.lost}</th>
            <th className="py-3 px-2 text-center w-16">{t.goals}</th>
            <th className="py-3 px-2 text-center w-12">{t.diff}</th>
            <th className="py-3 px-2 text-center w-32">{t.last5}</th>
            <th className="py-3 px-2 text-center w-12">{t.points}</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, index) => (
            <tr 
              key={team.id} 
              className={`transition-colors duration-200 ${index % 2 === 0 
                ? (darkMode ? 'bg-gray-900' : 'bg-white') 
                : (darkMode ? 'bg-gray-800' : 'bg-gray-50')}`}
            >
              {/* Position */}
              <td className="py-3 px-2 font-medium flex items-center">
                <div 
                  className={`${getPositionColor(index + 1, standings.length)} w-1 h-5 mr-2`}
                ></div>
                {index + 1}
              </td>
              
              {/* Team */}
              <td className="py-3 px-2 font-medium">
                <div className="flex items-center">
                  {team.logo ? (
                    <img 
                      src={`/assets/standings/logo/${team.logo}`} 
                      alt={team.name} 
                      className={`w-8 h-8 ${isRTL ? 'ml-3' : 'mr-3'} object-contain`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/32?text=?';
                      }}
                    />
                  ) : (
                    <div className={`w-8 h-8 ${isRTL ? 'ml-3' : 'mr-3'} transition-colors duration-200 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center text-sm`}>
                      {team.name.charAt(0)}
                    </div>
                  )}
                  <span>{team.name}</span>
                </div>
              </td>
              
              {/* Played */}
              <td className="py-3 px-2 text-center">{team.played}</td>
              
              {/* Won */}
              <td className="py-3 px-2 text-center">{team.won}</td>
              
              {/* Drawn */}
              <td className="py-3 px-2 text-center">{team.drawn}</td>
              
              {/* Lost */}
              <td className="py-3 px-2 text-center">{team.lost}</td>
              
              {/* Goals */}
              <td className="py-3 px-2 text-center">{team.goalsFor}:{team.goalsAgainst}</td>
              
              {/* Goal Difference */}
              <td className="py-3 px-2 text-center">
                <span className={
                  team.goalDifference > 0 
                    ? 'text-green-500' 
                    : team.goalDifference < 0 
                      ? 'text-red-500' 
                      : ''
                }>
                  {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                </span>
              </td>
              
              {/* Form */}
              <td className="py-3 px-2">
                <div className="flex justify-center">
                  {renderForm(team.form)}
                </div>
              </td>
              
              {/* Points */}
              <td className="py-3 px-2 text-center font-bold">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StandingsTable;