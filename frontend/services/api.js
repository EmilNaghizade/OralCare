import axios from "axios";
import * as SecureStore from "expo-secure-store";

const getAuthToken = async () => {
  try {
    return await SecureStore.getItemAsync("authToken");
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    console.error("API Error:", error);
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  try {
    return await response.json();
  } catch (e) {
    console.error("JSON Parse Error:", e);
    throw new Error("Invalid JSON response");
  }
};

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Auth API functions
export const authApi = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (userData) => {
    console.log("Register API URL:", `${API_URL}/api/auth/register`); // Kayıt URL'sini konsola yazdır
    console.log("Register User Data:", userData); // Kullanıcı verilerini konsola yazdır
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  logout: async (token) => {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return handleResponse(response);
  },

  getProfile: async (token) => {
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return handleResponse(response);
  },

  updateProfile: async (token, userData) => {
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  checkEmail: async (email) => {
    console.log("API URL:", API_URL); // API URL'sini konsola yazdır
    const response = await fetch(
      `${API_URL}/api/auth/check-email?email=${email}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return handleResponse(response);
  },
};

export const quizApi = {
  // In your quizApi.js, make sure you're sending the token correctly
  markQuizCompleted: async (quizId) => {
    try {
      const token = await getAuthToken();

      // Check if token exists before making the request
      if (!token) {
        console.error("No auth token available");
        throw new Error("Authentication token is missing");
      }

      console.log("Using token:", token); // Debug logging

      const response = await axios.post(
        `${API_URL}/api/quizzes/${quizId}/finish`,
        {}, // Empty object as request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error marking quiz as completed:", error);
      // Log more details
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  },

  getCompletedQuizzes: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/quizzes/finished`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching completed quizzes:", error);
      throw error;
    }
  },
};

// Export getProfileApi for backward compatibility
export const getProfileApi = authApi.getProfile;
