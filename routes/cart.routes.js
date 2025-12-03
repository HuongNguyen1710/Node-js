// routes/cart.routes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Xem giỏ hàng
router.get("/", (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  res.render("cart", { cart, total });
});

// Thêm vào giỏ (API JSON cho fetch)
router.post("/add", async (req, res) => {
  try {
    const { productId, variantId, qty } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu productId" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    let variant = null;
    if (variantId) {
      variant = product.variants.id(variantId);
      if (!variant) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy biến thể" });
      }
    }

    const quantity = parseInt(qty || "1", 10);

    if (!req.session.cart) req.session.cart = [];
    const cart = req.session.cart;

    const existing = cart.find(
      (item) =>
        item.productId === productId && item.variantId === (variantId || null)
    );

    const price = variant ? variant.price : product.basePrice;
    const variantName = variant ? variant.name : "Mặc định";

    if (existing) {
      existing.qty += quantity;
    } else {
      cart.push({
        productId,
        variantId: variantId || null,
        name: product.name,
        variantName,
        price,
        qty: quantity
      });
    }

    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

    return res.json({
      success: true,
      message: "Đã thêm vào giỏ hàng",
      cartCount
    });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Xoá 1 item khỏi giỏ
router.post("/remove", (req, res) => {
  const { productId, variantId } = req.body;
  req.session.cart = (req.session.cart || []).filter(
    (item) =>
      !(item.productId === productId && item.variantId === (variantId || null))
  );
  res.redirect("/cart");
});

// Xoá hết giỏ
router.post("/clear", (req, res) => {
  req.session.cart = [];
  res.redirect("/cart");
});

module.exports = router;
