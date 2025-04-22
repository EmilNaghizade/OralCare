// frontend/services/profileApi.js
import { fetchWithAuth } from "./fetchWithAuth";

export const profileApi = {
  getProfile: (token) => {
    return fetchWithAuth("/api/profile/profile", token);
  },

  uploadProfileImage: async (token, imageSource, base64Data) => {
    if (!token) {
      throw new Error("Authentication token is required");
    }

    console.log("Starting profile image upload process using base64 JSON");

    const uploadUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/profile/upload-photo-base64-json`;

    // Construct the payload with the base64 image.
    const payload = {
      image: base64Data, // expected to be a base64-encoded string (optionally with the data URI prefix)
      // You can include a filename here if desired, otherwise the server will generate one.
    };

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Check for an HTML error page.
      const respContentType = response.headers.get("content-type");
      if (respContentType && respContentType.includes("text/html")) {
        console.error(
          "Server returned HTML instead of JSON. Status:",
          response.status
        );
        console.log(
          "First 500 characters of response:",
          await response.text().then((text) => text.substring(0, 500))
        );
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      if (!response.ok) {
        console.error("Upload failed with status:", response.status);
        throw new Error(result.message || "Failed to upload profile image");
      }

  
      return result;
    } catch (error) {
      console.error("Error in profileApi.uploadProfileImage:", error);
      throw error;
    }
  },

  deleteProfileImage: async (token) => {
    if (!token) {
      throw new Error("Token is required");
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/profile/delete-photo`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to delete image");
      }
      return result;
    } catch (error) {
      console.error("Error in deleteProfileImage:", error);
      throw error;
    }
  },
};
