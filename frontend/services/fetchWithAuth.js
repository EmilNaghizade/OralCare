export const fetchWithAuth = async (url, token, options = {}) => {
  // Ensure base URL is configured
  if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
    console.error("API_BASE_URL not configured!");
    throw new Error("API Base URL is not configured.");
  }
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! Status: ${response.status}`
    );
  }
  return response.json();
};
