// routes/index.routes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Trang chủ: sản phẩm mới, bán chạy, + 3 danh mục
router.get("/", async (req, res) => {
  try {
    const [newProducts, bestSellers, laptops, monitors, storages] = await Promise.all([
      Product.find({ isNew: true }).limit(8),
      Product.find({ isBestSeller: true }).limit(8),
      Product.find({ category: "laptop" }).limit(8),
      Product.find({ category: "man-hinh" }).limit(8),
      Product.find({ category: "o-cung" }).limit(8)
    ]);

    res.render("home", {
      newProducts,
      bestSellers,
      laptops,
      monitors,
      storages
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});

module.exports = router;
