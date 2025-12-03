// models/Product.js
const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  name: String,      // Ví dụ: "8GB/128GB", "16GB/512GB"
  sku: String,
  price: Number,
  stock: Number
}, { _id: true });

const specsSchema = new mongoose.Schema({
  screen: String,
  chip: String,
  ram: String,
  storage: String,
  battery: String
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  category: String,          // "dien-thoai", "laptop", "man-hinh", "o-cung", ...
  basePrice: Number,         // dùng để sort theo giá
  variants: [variantSchema], // Ít nhất 2 biến thể
  thumbnail: String,
  images: [String],          // Ít nhất 3 ảnh minh họa
  shortDescription: String,
  description: String,
  specs: specsSchema,
  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
