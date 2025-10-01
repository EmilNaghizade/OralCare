import User from "../models/User.js";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import { sendEmail } from "../utils/sendEmail.js";
import Otp from "../models/Otp.js"; // yeni model

export const sendOtpToEmail = async (req, res) => {
  const { email } = req.body;
  const otpCode = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Əgər eyni email üçün OTP varsa, sil
  await Otp.findOneAndDelete({ email });

  // Yeni OTP saxla
  await Otp.create({ email, code: otpCode, expiresAt });

  await sendEmail({
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${otpCode}\nIt will expire in 10 minutes.`,
  });

  res.json({ message: "OTP sent to email" });
};

// Verify OTP for signup or reset
export const verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;

  const record = await Otp.findOne({ email });

  if (!record || record.code !== otp)
    return res.status(400).json({ error: "Invalid OTP" });

  if (record.expiresAt < new Date())
    return res.status(400).json({ error: "OTP expired" });

  // OTP doğrulandı, artıq istəyə uyğun davam et
  await Otp.deleteOne({ email });

  res.json({ verified: true });
};

// Reset password using OTP
export const resetPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.resetPasswordOtp || user.resetPasswordOtp.code !== otp)
    return res.status(400).json({ error: "Invalid OTP" });

  if (user.resetPasswordOtp.expiresAt < new Date())
    return res.status(400).json({ error: "OTP expired" });

  user.password = newPassword;
  user.resetPasswordOtp = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
};

// Generate JWT token
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
      expiresIn: "90d",
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
export const registerUser = async (req, res) => {
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
};

// Login user
export const loginUser = async (req, res) => {
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
};

// Logout user
export const logoutUser = async (req, res) => {
  try {
    console.log(`User ${req.user._id} logging out.`); // Optional logging
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error during logout" });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
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
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    if (!users) {
      return res.status(404).json({ error: "No users found" });
    }
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Internal server error fetching users" });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, gender, profileImage, preferences, email } = req.body;
    // Validate input

    // Basic email validation
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
    }

    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields only if they are provided in the request body
    if (name !== undefined) user.name = name;
    if (gender !== undefined) user.gender = gender;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (email !== undefined) user.email = email; // Add email update functionality
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
      email: updatedUser.email,
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
    // Handle duplicate email errors (MongoDB error code 11000)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ error: "Email address is already in use" });
    }
    res.status(500).json({ error: "Internal server error updating profile" });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    // Check if current user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const userId = req.params.userId;
    const { role } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Validate role if provided
    if (role && !["admin", "user"].includes(role)) {
      return res.status(400).json({ error: "Invalid role value" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the role if provided
    if (role) {
      user.role = role;
    }

    // Save the updated user
    const updatedUser = await user.save();

    // Return the updated user (excluding password)
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      gender: updatedUser.gender,
      profileImage: updatedUser.profileImage,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Internal server error updating user" });
  }
};

// Check user email
export const checkUserEmail = async (req, res) => {
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
};

// Verify password
export const verifyPassword = async (req, res) => {
  try {
    const { password } = req.query;

    if (!password) {
      return res
        .status(400)
        .json({ error: "Password query parameter is required" });
    }

    // Find user by email (case-insensitive)
    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(password))) {
      return res.status(200).json({ verified: true });
    } else {
      return res
        .status(401)
        .json({ error: "Invalid password", verified: false });
    }
  } catch (error) {
    console.error("Error verifying password:", error);
    res.status(500).json({ error: "Internal server error verifying password" });
  }
};

// Update user password
export const updateUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current and new passwords are required" });
    }

    // Find user by ID
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if current password matches
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    // Update password
    user.password = newPassword; // Hashing should be handled by pre-save hook in User model
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal server error updating password" });
  }
};

// Delete user account
export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if current user is admin or the user themselves
    if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Find and delete the user
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({ error: "Internal server error deleting account" });
  }
};

// Refresh token endpoint
export const refreshToken = async (req, res) => {
  try {
    // Token already verified by middleware, user is in req.user
    const user = req.user;

    // Generate new token
    const newToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "90d" }
    );

    res.json({
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get current token info (for debugging)
export const getTokenInfo = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Decode without verification to get info
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const issuedAt = new Date(decoded.payload.iat * 1000);
    const expiresAt = new Date(decoded.payload.exp * 1000);
    const now = new Date();
    const isExpired = now > expiresAt;

    res.json({
      user: req.user ? {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      } : null,
      tokenInfo: {
        issuedAt: issuedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        currentTime: now.toISOString(),
        isExpired,
        timeUntilExpiry: isExpired ? "expired" : `${Math.round((expiresAt - now) / (1000 * 60 * 60))} hours`,
      }
    });
  } catch (error) {
    console.error("Error getting token info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// TEMPORARY: Generate admin token (remove in production)
export const generateAdminToken = async (req, res) => {
  try {
    const { secretKey } = req.body;
    
    // Simple security check
    if (secretKey !== "temp-admin-access-2025") {
      return res.status(401).json({ error: "Invalid secret key" });
    }

    // Find or create admin user
    let adminUser = await User.findOne({ role: "admin" });
    
    if (!adminUser) {
      // Create a temporary admin user
      adminUser = await User.create({
        name: "Temp Admin",
        email: "temp-admin@oralcare.app",
        password: "temp-password-123", // Will be hashed by the model
        role: "admin"
      });
      console.log("Created temporary admin user");
    }

    // Generate token
    const token = jwt.sign(
      { userId: adminUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "90d" }
    );

    res.json({
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
      message: "TEMPORARY admin token generated. Remove this endpoint in production!"
    });
  } catch (error) {
    console.error("Error generating admin token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
