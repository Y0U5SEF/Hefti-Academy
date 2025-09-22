// services/menuService.js
import axios from "axios";

const API_URL = "http://localhost:1337";

export const getMenuData = async (language) => {
  try {
    const response = await axios.get(`${API_URL}/api/menus`, {
      params: {
        locale: language,
        populate: "*", // Ensure sub-menus are populated
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching menu data:", error);
    return [];
  }
};
