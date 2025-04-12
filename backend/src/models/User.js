import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
    },
    profileImage: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    watchedVideos: [
      {
        video: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Video",
        },
        watchedAt: {
          type: Date,
          default: Date.now,
        },
        watchDuration: {
          type: Number, // Duration in seconds
          default: 0,
        },
      },
    ],
    finishedQuizzes: [
      {
        type: Number,
        ref: "Quiz",
      },
    ],
  },
  { timestamps: true }
);

//hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

//compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get user statistics
userSchema.methods.getStats = function () {
  return {
    totalWatchedVideos: this.watchedVideos.length,
    totalFinishedQuizes: this.finishedQuizzes.length,
    lastActive: this.lastLogin,
    memberSince: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

export default User;
