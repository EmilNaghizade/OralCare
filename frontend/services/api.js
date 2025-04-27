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
  // Get all quizzes (for admin)
  getAllQuizzes: async (token, page = 1, limit = 10) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/quizzes?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      throw error;
    }
  },

  // Get a specific quiz
  getQuizById: async (quizId, token) => {
    try {
      const response = await axios.get(`${API_URL}/api/quizzes/${quizId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching quiz with ID ${quizId}:`, error);
      throw error;
    }
  },

  // Create a new quiz
  createQuiz: async (quizData, token) => {
    try {
      const response = await axios.post(`${API_URL}/api/quizzes`, quizData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating quiz:", error);
      throw error;
    }
  },

  // Update an existing quiz
  updateQuiz: async (quizId, quizData, token) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/quizzes/${quizId}`,
        quizData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating quiz with ID ${quizId}:`, error);
      throw error;
    }
  },

  // Delete a quiz
  deleteQuiz: async (quizId, token) => {
    try {
      const response = await axios.delete(`${API_URL}/api/quizzes/${quizId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting quiz with ID ${quizId}:`, error);
      throw error;
    }
  },

  // Add a question to a quiz
  addQuestion: async (quizId, questionData, token) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/quizzes/${quizId}/questions`,
        questionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding question:", error);
      throw error;
    }
  },

  // Update a question
  updateQuestion: async (quizId, questionId, questionData, token) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/quizzes/${quizId}/questions/${questionId}`,
        questionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating question:", error);
      throw error;
    }
  },

  // Delete a question
  deleteQuestion: async (quizId, questionId, token) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/quizzes/${quizId}/questions/${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting question:", error);
      throw error;
    }
  },
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
      console.log("Completed quizzes API response:", response.data);
      return response.data;
    } catch (error) {}
  },
};

// Add these functions to your existing api.js file within the appropriate export object
export const videoApi = {
  //get all videos
  getAllVideos: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/videos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching videos:", error);
      throw error;
    }
  },

  // Mark a video as watched
  markVideoAsWatched: async (videoId) => {
    try {
      const token = await getAuthToken();

      // Check if token exists before making the request
      if (!token) {
        console.error("No auth token available");
        throw new Error("Authentication token is missing");
      }

      console.log("Using token to mark video as watched:", token);

      const response = await axios.post(
        `${API_URL}/api/videos/${videoId}/watch`,
        {}, // Empty object as request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error marking video as watched:", error);
      // Log more details
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  },

  // Get all watched videos for the current user
  getWatchedVideos: async (token) => {
    try {
      if (!token) {
        return { watchedVideosId: [], count: 0 };
      }

      const response = await axios.get(`${API_URL}/api/videos/user/watched`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Watched videos API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching watched videos:", error);
      // Return a default value instead of throwing
      return { watchedVideosId: [], count: 0 };
    }
  },
  // New admin methods for video management
  getVideoById: async (videoId, token) => {
    try {
      // Use provided token or get it from secure storage
      const authToken = token || (await getAuthToken());

      if (!authToken) {
        console.error("No auth token available");
        throw new Error("Authentication token is missing");
      }

      console.log(`Fetching video with ID: ${videoId} using token`);

      const response = await axios.get(`${API_URL}/api/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching video with ID ${videoId}:`, error);

      // Handle specific error cases
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);

        if (error.response.status === 404) {
          throw new Error("Video not found");
        }
      }

      throw new Error("Failed to load video. Please try again later.");
    }
  },

  createVideo: async (videoData, token) => {
    try {
      // videoData should be FormData with all required fields and files
      const response = await axios.post(`${API_URL}/api/videos`, videoData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating video:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  },

  updateVideo: async (videoId, videoData, token) => {
    try {
      // videoData should be FormData with all required fields and possibly files
      const response = await axios.put(
        `${API_URL}/api/videos/${videoId}`,
        videoData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating video with ID ${videoId}:`, error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  },

  deleteVideo: async (videoId, token) => {
    try {
      const response = await axios.delete(`${API_URL}/api/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting video with ID ${videoId}:`, error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  },
};
export const productApi = {
  getAllProducts: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },
  getProductById: async (productId, token) => {
    try {
      const response = await axios.get(`${API_URL}/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with ID ${productId}:`, error);
      throw error;
    }
  },
  createProduct: async (productData, token) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/products`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },
  updateProduct: async (productId, productData, token) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/products/${productId}`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating product with ID ${productId}:`, error);
      throw error;
    }
  },
  deleteProduct: async (productId, token) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting product with ID ${productId}:`, error);
      throw error;
    }
  },
};

export const articleApi = {
  getAllArticles: async (token, page = 1, limit = 10) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/articles?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }
  },

  getArticleById: async (articleId, token) => {
    try {
      const response = await axios.get(`${API_URL}/api/articles/${articleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching article with ID ${articleId}:`, error);
      throw error;
    }
  },
};

export const newsApi = {
  getAllNews: async (token, page = 1, limit = 10) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/news?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching news:", error);
      throw error;
    }
  },

  getNewsById: async (newsId, token) => {
    try {
      const response = await axios.get(`${API_URL}/api/news/${newsId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching news with ID ${newsId}:`, error);
      throw error;
    }
  },
};

// frontend/services/api.js - Add to your existing api.js
export const notificationApi = {
  getNotifications: async (token, page = 1, limit = 20) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/notifications?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  markAsRead: async (token, notificationId) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  markAllAsRead: async (token) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  deleteNotification: async (token, notificationId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },
};

// Export getProfileApi for backward compatibility
export const getProfileApi = authApi.getProfile;
