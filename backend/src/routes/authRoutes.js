import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
  }

  try {
    // Make sure userId is a string and trim any whitespace
    const userIdStr = userId.toString().trim();
    console.log("Generating token for user ID:", userIdStr);

    const token = jwt.sign({ userId: userIdStr }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    // Verify the token is valid before returning it
    jwt.verify(token, process.env.JWT_SECRET);

    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Failed to generate authentication token");
  }
};

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;

    // Basic validation
    if (!name || !email || !password || !gender) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists (case-insensitive email)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create new user instance
    const user = new User({
      name,
      email: email.toLowerCase(),
      password, // Password hashing should be handled by pre-save hook in User model
      gender,
      profileImage: "", // Default or handle image upload separately
    });

    // Save the user to the database
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Send successful response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        profileImage: user.profileImage,
        role: user.role, // Include role if it exists on the model
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    // Handle specific errors like duplicate key
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    // Generic server error
    res
      .status(500)
      .json({ error: "Internal server error during registration" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });

    // Check if user exists and password matches
    // Assumes user.matchPassword method exists and handles password comparison
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" }); // Use a generic message for security
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Send successful response
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

// Logout user (Stateless - Client Responsibility)
router.post("/logout", protectRoute, async (req, res) => {
  try {
    console.log(`User ${req.user._id} logging out.`); // Optional logging
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error during logout" });
  }
});

// Get user profile
router.get("/profile", protectRoute, async (req, res) => {
  try {
    const userProfile = await User.findById(req.user._id).select("-password");

    if (!userProfile) {
      // This case should be rare if protectRoute middleware works correctly
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      user: {
        id: userProfile._id,
        name: userProfile.name,
        email: userProfile.email,
        gender: userProfile.gender,
        profileImage: userProfile.profileImage,
        role: userProfile.role,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error fetching profile" });
  }
});

// Update user profile
router.put("/profile", protectRoute, async (req, res) => {
  try {
    const { name, gender, profileImage, preferences } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields only if they are provided in the request body
    if (name !== undefined) user.name = name;
    if (gender !== undefined) user.gender = gender;
    if (profileImage !== undefined) user.profileImage = profileImage; // Handle image upload/storage appropriately
    if (preferences !== undefined) {
      // Merge preferences carefully, ensuring nested objects are handled
      user.preferences = { ...user.preferences, ...preferences };
      // Mark preferences as modified if it's a mixed type or nested object
      user.markModified("preferences");
    }

    // Save the updated user document
    const updatedUser = await user.save();

    // Send back the updated user data (excluding password)
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email, // Email typically shouldn't be updated here
      gender: updatedUser.gender,
      profileImage: updatedUser.profileImage,
      preferences: updatedUser.preferences,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    // Handle potential validation errors from the save operation
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error updating profile" });
  }
});

// Check if email exists
router.get("/check-email", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res
        .status(400)
        .json({ error: "Email query parameter is required" });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Email exists - send 200 OK (no body needed, or send minimal confirmation)
      return res.status(200).json({ exists: true }); // Indicate existence explicitly
    } else {
      // Email does not exist - send 404 Not Found
      return res.status(404).json({ error: "User not found", exists: false }); // Indicate non-existence
    }
  } catch (error) {
    console.error("Error checking email:", error);
    // *** IMPORTANT: Send a JSON response in the catch block ***
    res.status(500).json({ error: "Internal server error checking email" });
  }
});

export default router;
