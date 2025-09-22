import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiBarChart2 } from 'react-icons/fi';
import LoadingSpinner from '../Loading/LoadingSpinner';
import StandingsTable from './StandingsTable';
import { calculateStandings } from './standingsUtils';
import { useTheme } from '../../context/ThemeContext';

const Standings = ({ 
  sheetId = '1DnLi1q25KLTjCzchi3uRMMEDJ3AQ2e__w9yVmF2WQbQ', // Example sheet ID
  competitionId = 1,
  showFilters = true,
  className = '',
  language = 'en'
}) => {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [standings, setStandings] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(competitionId);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupedStandings, setGroupedStandings] = useState({});
  const [showCompetitionSelector, setShowCompetitionSelector] = useState(true);

  // Fetch data from Google Sheets via opensheet.elk.sh
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch competitions
        const competitionsResponse = await axios.get(
          `https://opensheet.elk.sh/${sheetId}/Competitions`
        );
        setCompetitions(competitionsResponse.data);
        
        // Fetch teams
        const teamsResponse = await axios.get(
          `https://opensheet.elk.sh/${sheetId}/Teams`
        );
        
        // Fetch matches
        const matchesResponse = await axios.get(
          `https://opensheet.elk.sh/${sheetId}/Matches`
        );
        
        // Fetch groups if available
        let groupsData = [];
        try {
          const groupsResponse = await axios.get(
            `https://opensheet.elk.sh/${sheetId}/Groups`
          );
          groupsData = groupsResponse.data;
          
          // Filter groups for the selected competition
          const competitionGroups = groupsData.filter(group => 
            group.competitionId === selectedCompetition.toString()
          );
          setGroups(competitionGroups);
          
          // Check if the selected competition has groups
          const selectedComp = competitionsResponse.data.find(comp => 
            parseInt(comp.id) === selectedCompetition
          );
          
          // If the competition has groups but no group is selected, select the first group
          if (selectedComp && selectedComp.hasGroups === "TRUE" && competitionGroups.length > 0 && !selectedGroup) {
            setSelectedGroup(competitionGroups[0].id);
          }
        } catch (error) {
          // Groups sheet might not exist, which is fine
          setGroups([]);
          console.log('No groups found or error:', error);
        }
        
        // Calculate standings
        const calculatedStandings = calculateStandings(
          teamsResponse.data,
          matchesResponse.data,
          selectedCompetition,
          selectedGroup,
          'all' // We no longer use the activeTab filter
        );
        
        // Handle grouped standings if groups exist
        let hasGroups = false;
        try {
          // If we have groups and no specific group is selected, organize standings by group
          const competitionGroups = groupsResponse.data.filter(
            group => group.competitionId === selectedCompetition.toString()
          );
          
          if (competitionGroups.length > 0 && !selectedGroup) {
            hasGroups = true;
            // Group standings by groupId
            const standingsByGroup = {};
            const groupsMap = {};
            
            // Create a map of group IDs to group names
            groupsResponse.data.forEach(group => {
              if (group.competitionId === selectedCompetition.toString()) {
                groupsMap[group.id] = group.name;
              }
            });
            
            // Filter teams by competition
            const competitionTeams = teamsResponse.data.filter(
              team => team.competitionId === selectedCompetition.toString()
            );
            
            // Initialize groups with empty arrays
            Object.keys(groupsMap).forEach(groupId => {
              standingsByGroup[groupId] = {
                name: groupsMap[groupId],
                teams: []
              };
            });
            
            // Calculate standings for each group
            Object.keys(groupsMap).forEach(groupId => {
              const groupStandings = calculateStandings(
                competitionTeams,
                matchesResponse.data,
                selectedCompetition,
                groupId,
                'all' // We no longer use the activeTab filter
              );
              
              standingsByGroup[groupId].teams = groupStandings;
            });
            
            setGroupedStandings(standingsByGroup);
          }
        } catch (error) {
          console.log('No groups found or error processing groups:', error);
        }
        
        // Reset grouped standings if we're not showing groups
        if (!hasGroups) {
          setGroupedStandings({});
        }
        
        setStandings(calculatedStandings);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load standings data. Please try again later.');
        setLoading(false);
      }
    };

    // Use cached data if available and not older than 15 minutes
    const cachedData = localStorage.getItem(`standings_${sheetId}_${selectedCompetition}_${selectedGroup}`);
    const cachedTimestamp = localStorage.getItem(`standings_timestamp_${sheetId}_${selectedCompetition}_${selectedGroup}`);
    
    if (cachedData && cachedTimestamp) {
      const now = new Date().getTime();
      const cacheTime = parseInt(cachedTimestamp);
      
      // If cache is less than 15 minutes old (900000 ms)
      if (now - cacheTime < 900000) {
        setStandings(JSON.parse(cachedData));
        setLoading(false);
        
        // Refresh in background after using cache
        fetchData().catch(console.error);
        return;
      }
    }
    
    fetchData();
  }, [sheetId, selectedCompetition, selectedGroup]);

  // Save to local storage for caching
  useEffect(() => {
    if (standings.length > 0) {
      localStorage.setItem(
        `standings_${sheetId}_${selectedCompetition}_${selectedGroup}`,
        JSON.stringify(standings)
      );
      localStorage.setItem(
        `standings_timestamp_${sheetId}_${selectedCompetition}_${selectedGroup}`,
        new Date().getTime().toString()
      );
    }
  }, [standings, sheetId, selectedCompetition, selectedGroup]);

  // Handle competition change
  const handleCompetitionChange = (e) => {
    const compId = parseInt(e.target.value);
    setSelectedCompetition(compId);
    
    // Check if the selected competition has groups
    const selectedComp = competitions.find(comp => parseInt(comp.id) === compId);
    const hasGroups = selectedComp && selectedComp.hasGroups === "TRUE";
    
    // Update groups for the selected competition
    const competitionGroups = groups.filter(group => 
      group.competitionId === compId.toString()
    );
    
    if (hasGroups && competitionGroups.length > 0) {
      // If the competition has groups, select the first group
      setSelectedGroup(competitionGroups[0].id);
    } else {
      // If the competition doesn't have groups, clear the group selection
      setSelectedGroup(null);
    }
  };
  
  // Toggle competition selector
  const toggleCompetitionSelector = () => {
    setShowCompetitionSelector(!showCompetitionSelector);
  };

  // Handle group change
  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  // Handle group tab change
  const handleGroupTabChange = (groupId) => {
    setSelectedGroup(groupId === 'all' ? null : groupId);
  };

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} text-${darkMode ? 'white' : 'gray-900'} rounded-lg overflow-hidden shadow-lg transition-colors duration-200 ${className}`}>
      {/* Competition Selector with language-based names */}
      {showCompetitionSelector && competitions.length > 0 && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-200`}>
          <select 
            value={selectedCompetition} 
            onChange={handleCompetitionChange}
            className={`w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
              darkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            }`}
          >
            {competitions.map(comp => {
              // Use name_ar for Arabic, name_en for English and French
              const displayName = language === 'ar' ? comp.name_ar : comp.name_en;
              
              return (
                <option key={comp.id} value={comp.id}>
                  {displayName}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <LoadingSpinner color={darkMode ? 'white' : 'gray'} />
        </div>
      ) : (
        <>
          {/* Group tabs for competitions with groups */}
          {groups.length > 0 && (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} px-4 overflow-x-auto transition-colors duration-200`}>
              <div className="flex space-x-2 py-2">
                {groups.map(group => (
                  <button
                    key={group.id}
                    className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
                      selectedGroup === group.id 
                        ? 'bg-blue-600 text-white' 
                        : darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                    onClick={() => handleGroupTabChange(group.id)}
                  >
                    {group.name || `Group ${group.id}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Standings table */}
          {standings.length > 0 && (
            <StandingsTable 
              standings={standings} 
              language={language} 
              loading={loading}
            />
          )}
          
          {/* Empty state for when a group is selected but no standings */}
          {groups.length > 0 && selectedGroup && standings.length === 0 && (
            <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}>
              {language === 'ar' ? 'لا توجد بيانات متاحة لهذه المجموعة' : 'No data available for this group.'}
            </div>
          )}

          {/* Empty state */}
          {standings.length === 0 && Object.keys(groupedStandings).length === 0 && (
            <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}>
              No standings data available for the selected competition.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Standings;
