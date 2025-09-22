import { getAllRegions, getRegionCities } from 'moroccan-regions-cities';

// Custom cities to add
const customCities = {
  // Example format (replace with your actual region ID and city data):
  // "region_id": [
  //   {
  //     city_id: 999, // Use a unique ID that doesn't conflict with existing ones
  //     city_arabic: "اسم المدينة",
  //     city_french: "Nom de la ville",
  //     city_english: "City name"
  //   }
  // ]
};

// Extended getAllRegions function
export const getAllRegionsExtended = (language = 'english') => {
  const regions = getAllRegions(language);
  return regions;
};

// Extended getRegionCities function
export const getRegionCitiesExtended = (regionId, language = 'english') => {
  const cities = getRegionCities(regionId, language);
  
  // Add custom cities if they exist for this region
  if (customCities[regionId]) {
    const customCitiesForRegion = customCities[regionId].map(city => {
      switch (language) {
        case 'arabic':
          return city.city_arabic;
        case 'french':
          return city.city_french;
        default:
          return city.city_english;
      }
    });
    return [...cities, ...customCitiesForRegion];
  }
  
  return cities;
}; 