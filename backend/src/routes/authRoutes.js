import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import protectRoute from "../middleware/auth.middleware.js";


const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;

    if (!name || !email || !password || !gender) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    //check if user already exists

    await User.findOne({ email: email }).then((user) => {
      if (user) {
        return res.status(400).json({ error: "User already exists" });
      }
    });

    const user = new User({
      name,
      email,
      password,
      gender,
      profileImage: "",
    });

    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    //check if user exists
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    //check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    //generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profile", protectRoute, async (req, res) => {
  try {
    // protectRoute middleware already found the user and attached it to req.user
    // It selects '-password' by default, which is good.
    // We need to populate the fields if we want the full video/blog objects
    // But for counts, just sending req.user is enough.

    const userProfile = await User.findById(req.user._id).select("-password"); // Ensure password is excluded
    // Optional: Populate details if needed elsewhere, but increases payload size
    // .populate('watchedVideos', 'title thumbnailUrl') // Example: Populate title/thumbnail
    // .populate('readArticles', 'title image'); // Example: Populate title/image

    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send back user data including the arrays of watched/read IDs
    res.json({
      id: userProfile._id,
      name: userProfile.name,
      email: userProfile.email,
      gender: userProfile.gender,
      profileImage: userProfile.profileImage,
      watchedVideoIds: userProfile.watchedVideos, // Send array of IDs
      readArticleIds: userProfile.readArticles, // Send array of IDs
      // You can calculate counts here or let frontend do it:
      watchedVideoCount: userProfile.watchedVideos.length,
      readArticleCount: userProfile.readArticles.length,
      createdAt: userProfile.createdAt,
      // Add any other fields needed for the profile
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
