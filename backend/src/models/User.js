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
    watchedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video", // Reference to a 'Video' model (created below)
      },
    ],
    readArticles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog", // Reference to the 'Blog' model (corrected below)
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

const User = mongoose.model("User", userSchema);

export default User;
