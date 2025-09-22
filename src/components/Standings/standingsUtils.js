/**
 * Calculate standings based on match data
 * @param {Array} teams - Array of team objects from Google Sheets
 * @param {Array} matches - Array of match objects from Google Sheets
 * @param {number} competitionId - ID of the selected competition
 * @param {string|null} groupId - ID of the selected group (if applicable)
 * @param {string} filter - Filter type: 'all', 'home', or 'away'
 * @returns {Array} Sorted standings array
 */
export const calculateStandings = (teams, matches, competitionId, groupId, filter = 'all') => {
  // Create maps for team lookups
  // 1. Map team names to IDs
  const teamNameToId = teams.reduce((acc, team) => {
    acc[team.name.toLowerCase()] = team.id;
    return acc;
  }, {});
  
  // 2. Map team abbreviations to IDs
  const teamAbbrToId = teams.reduce((acc, team) => {
    if (team.abbr) {
      acc[team.abbr.toLowerCase()] = team.id;
    }
    return acc;
  }, {});
  
  // 3. Map team IDs to team objects
  const teamIdToTeam = teams.reduce((acc, team) => {
    acc[team.id] = team;
    return acc;
  }, {});
  
  // 4. Create a fuzzy name matcher for Latin/English team names (fallback)
  // This helps match "Hassania agdz" with "حسنية أكدز"
  const teamMap = {
    "hassania agdz": "1",  // حسنية أكدز
    "amal agdz": "14"      // أمل أكدز
    // Add more mappings as needed
  };

  // Initialize standings object with team data
  const standingsMap = teams
    .filter(team => team.competitionId === competitionId.toString() && 
                   (!groupId || team.groupId === groupId))
    .reduce((acc, team) => {
      acc[team.id] = {
        id: team.id,
        name: team.name,
        logo: team.logoUrl,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        form: []
      };
      return acc;
    }, {});

  // Filter matches by competition and group
  const relevantMatches = matches.filter(match => 
    match.competitionId === competitionId.toString() && 
    (!groupId || match.groupId === groupId) &&
    match.homeScore !== undefined && match.awayScore !== undefined // Only completed matches
  );
  
  // Sort matches by date (newest first) to calculate form
  const sortedMatches = [...relevantMatches].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  // Process each match
  relevantMatches.forEach(match => {
    // Try to find team IDs using multiple methods
    // First try to match by abbreviation (new preferred method)
    let homeTeamId = teamAbbrToId[match.homeTeamId.toLowerCase()];
    let awayTeamId = teamAbbrToId[match.awayTeamId.toLowerCase()];
    
    // If not found by abbreviation, try by full name (backward compatibility)
    if (!homeTeamId) {
      homeTeamId = teamNameToId[match.homeTeamId.toLowerCase()];
    }
    
    if (!awayTeamId) {
      awayTeamId = teamNameToId[match.awayTeamId.toLowerCase()];
    }
    
    // If still not found, try the team mapping for Latin/English names
    if (!homeTeamId) {
      homeTeamId = teamMap[match.homeTeamId.toLowerCase()];
    }
    
    if (!awayTeamId) {
      awayTeamId = teamMap[match.awayTeamId.toLowerCase()];
    }
    
    const homeScore = parseInt(match.homeScore);
    const awayScore = parseInt(match.awayScore);
    
    // Skip if teams don't exist in standings (might be from different competition/group)
    if (!homeTeamId || !awayTeamId || !standingsMap[homeTeamId] || !standingsMap[awayTeamId]) {
      console.warn(`Skipping match: Team not found - Home: ${match.homeTeamId} (ID: ${homeTeamId || 'not found'}), Away: ${match.awayTeamId} (ID: ${awayTeamId || 'not found'})`);
      return;
    }
    
    // Skip based on filter
    if (filter === 'home' && homeTeamId !== match.homeTeamId) return;
    if (filter === 'away' && awayTeamId !== match.awayTeamId) return;
    
    // Update home team stats
    if (filter !== 'away') {
      standingsMap[homeTeamId].played += 1;
      standingsMap[homeTeamId].goalsFor += homeScore;
      standingsMap[homeTeamId].goalsAgainst += awayScore;
      
      if (homeScore > awayScore) {
        standingsMap[homeTeamId].won += 1;
        standingsMap[homeTeamId].points += 3;
        standingsMap[homeTeamId].form.unshift('W');
      } else if (homeScore === awayScore) {
        standingsMap[homeTeamId].drawn += 1;
        standingsMap[homeTeamId].points += 1;
        standingsMap[homeTeamId].form.unshift('D');
      } else {
        standingsMap[homeTeamId].lost += 1;
        standingsMap[homeTeamId].form.unshift('L');
      }
    }
    
    // Update away team stats
    if (filter !== 'home') {
      standingsMap[awayTeamId].played += 1;
      standingsMap[awayTeamId].goalsFor += awayScore;
      standingsMap[awayTeamId].goalsAgainst += homeScore;
      
      if (awayScore > homeScore) {
        standingsMap[awayTeamId].won += 1;
        standingsMap[awayTeamId].points += 3;
        standingsMap[awayTeamId].form.unshift('W');
      } else if (awayScore === homeScore) {
        standingsMap[awayTeamId].drawn += 1;
        standingsMap[awayTeamId].points += 1;
        standingsMap[awayTeamId].form.unshift('D');
      } else {
        standingsMap[awayTeamId].lost += 1;
        standingsMap[awayTeamId].form.unshift('L');
      }
    }
  });
  
  // Calculate goal differences
  Object.values(standingsMap).forEach(team => {
    team.goalDifference = team.goalsFor - team.goalsAgainst;
    
    // Limit form to last 5 matches
    team.form = team.form.slice(0, 5);
  });
  
  // Convert to array and sort
  const standingsArray = Object.values(standingsMap);
  
  // Sort by: points (desc), goal difference (desc), goals scored (desc)
  standingsArray.sort((a, b) => {
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    if (a.goalDifference !== b.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    return b.goalsFor - a.goalsFor;
  });
  
  return standingsArray;
};

/**
 * Create a sample standings data structure for testing
 * @returns {Array} Sample standings data
 */
export const getSampleStandings = () => {
  return [
    {
      id: '1',
      name: 'Manchester City',
      logo: 'https://resources.premierleague.com/premierleague/badges/t43.svg',
      played: 38,
      won: 28,
      drawn: 5,
      lost: 5,
      goalsFor: 94,
      goalsAgainst: 33,
      goalDifference: 61,
      points: 89,
      form: ['W', 'W', 'D', 'W', 'W']
    },
    {
      id: '2',
      name: 'Arsenal',
      logo: 'https://resources.premierleague.com/premierleague/badges/t3.svg',
      played: 38,
      won: 27,
      drawn: 6,
      lost: 5,
      goalsFor: 91,
      goalsAgainst: 29,
      goalDifference: 62,
      points: 87,
      form: ['W', 'W', 'W', 'W', 'L']
    },
    {
      id: '3',
      name: 'Liverpool',
      logo: 'https://resources.premierleague.com/premierleague/badges/t14.svg',
      played: 38,
      won: 24,
      drawn: 10,
      lost: 4,
      goalsFor: 86,
      goalsAgainst: 41,
      goalDifference: 45,
      points: 82,
      form: ['W', 'L', 'D', 'W', 'W']
    },
    {
      id: '4',
      name: 'Aston Villa',
      logo: 'https://resources.premierleague.com/premierleague/badges/t7.svg',
      played: 38,
      won: 22,
      drawn: 7,
      lost: 9,
      goalsFor: 77,
      goalsAgainst: 54,
      goalDifference: 23,
      points: 73,
      form: ['W', 'L', 'W', 'D', 'W']
    },
    {
      id: '5',
      name: 'Tottenham',
      logo: 'https://resources.premierleague.com/premierleague/badges/t6.svg',
      played: 38,
      won: 20,
      drawn: 6,
      lost: 12,
      goalsFor: 74,
      goalsAgainst: 61,
      goalDifference: 13,
      points: 66,
      form: ['W', 'L', 'W', 'L', 'L']
    },
    {
      id: '18',
      name: 'Luton Town',
      logo: 'https://resources.premierleague.com/premierleague/badges/t102.svg',
      played: 38,
      won: 6,
      drawn: 8,
      lost: 24,
      goalsFor: 49,
      goalsAgainst: 89,
      goalDifference: -40,
      points: 26,
      form: ['L', 'L', 'D', 'L', 'W']
    },
    {
      id: '19',
      name: 'Burnley',
      logo: 'https://resources.premierleague.com/premierleague/badges/t90.svg',
      played: 38,
      won: 5,
      drawn: 9,
      lost: 24,
      goalsFor: 39,
      goalsAgainst: 79,
      goalDifference: -40,
      points: 24,
      form: ['L', 'L', 'L', 'D', 'L']
    },
    {
      id: '20',
      name: 'Sheffield United',
      logo: 'https://resources.premierleague.com/premierleague/badges/t49.svg',
      played: 38,
      won: 3,
      drawn: 7,
      lost: 28,
      goalsFor: 36,
      goalsAgainst: 104,
      goalDifference: -68,
      points: 16,
      form: ['L', 'L', 'L', 'L', 'D']
    }
  ];
};
