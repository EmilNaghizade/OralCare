import mongoose from "mongoose";    

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        required: true,
        default: "",
    },
    readingTime: {
        type: String,
    },

},{timestamps:true});

export default mongoose.model("Blog", blogSchema);