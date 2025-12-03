// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const addressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  line1: String,
  city: String,
  district: String,
  ward: String,
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  fullName: String,
  defaultAddress: {
    fullName: String,
    phone: String,
    line1: String,
    city: String,
    district: String,
    ward: String,
    isDefault: { type: Boolean, default: true }
    },
  addresses: [addressSchema],
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  provider: { type: String, enum: ["local", "google", "facebook"], default: "local" },
  providerId: String,
  isGuest: { type: Boolean, default: false },
  resetPasswordOTP: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

userSchema.methods.checkPassword = async function (password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
