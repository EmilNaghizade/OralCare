import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Register new user
router.post("/register", authController.registerUser);

// Login user
router.post("/login", authController.loginUser);

// Logout user (Stateless - Client Responsibility)
router.post("/logout", protectRoute, authController.logoutUser);

// Get user profile
router.get("/profile", protectRoute, authController.getUserProfile);

// get all users
router.get("/all", protectRoute, authController.getAllUsers);

// Update user profile
router.put("/profile", protectRoute, authController.updateUserProfile);

// Update user role
router.put("/profile/:userId", protectRoute, authController.updateUserRole);

// Check if email exists
router.get("/check-email", authController.checkUserEmail);

// Verify user password
router.get("/verify-password", protectRoute, authController.verifyPassword);

// Update user password
router.put("/update-password", protectRoute, authController.updateUserPassword);

// Delete user account
router.delete(
  "/delete-user/:userId",
  protectRoute,
  authController.deleteUserAccount
);

router.post("/send-otp", authController.sendOtpToEmail); // body: { email, isReset }
router.post("/verify-email-otp", authController.verifyEmailOtp); // body: { email, otp }
router.post("/reset-password", authController.resetPasswordWithOtp); // body: { email, otp, newPassword }

export default router;
