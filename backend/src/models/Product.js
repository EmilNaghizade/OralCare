import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      en: {
        type: String,
        required: true,
      },
      ru: {
        type: String,
        required: true,
      },
    },
    imageUrl: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

export default Product;
