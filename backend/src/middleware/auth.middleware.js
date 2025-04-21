// In backend/src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
  let token;
  try {
    // Check if Authorization header exists and has correct format
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        // Extract token
        token = req.headers.authorization.split(" ")[1];

        // Validate token format (simple check before verification)
        if (!token || token.split(".").length !== 3) {
          console.error("Invalid token format received:", token);
          return res.status(401).json({ error: "Invalid token format" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        req.user = await User.findById(decoded.userId).select("-password");

        if (!req.user) {
          console.error(`User not found for userId: ${decoded.userId}`);
          return res.status(404).json({ error: "User not found" });
        }

        // Continue with request
        next();
      } catch (error) {
        console.error("Token verification error:", error.message);

        // Return appropriate error based on the error type
        if (error.name === "JsonWebTokenError") {
          return res.status(401).json({ error: "Invalid token" });
        } else if (error.name === "TokenExpiredError") {
          return res.status(401).json({ error: "Token expired" });
        } else {
          return res.status(401).json({ error: "Authentication failed" });
        }
      }
    } else {
      // No authentication header or wrong format
      return res.status(401).json({ error: "No token provided" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export default protectRoute;
