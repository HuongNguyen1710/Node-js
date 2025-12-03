const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  variantId: { type: mongoose.Schema.Types.ObjectId },
  variantName: String,
  qty: Number,
  price: Number
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  line1: String,   // địa chỉ
  line2: String,
  city: String,    // ở form mình sẽ label là Tỉnh/Thành phố
  district: String,
  ward: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: String, // thêm dòng này cho tiện gửi mail & tra cứu
  items: [orderItemSchema],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "cancelled"],
    default: "pending"
  },
  shippingAddress: shippingAddressSchema,
  note: String
}, {
  timestamps: true
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
