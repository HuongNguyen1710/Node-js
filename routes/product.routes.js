// routes/product.routes.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Product = require("../models/Product");
const Review = require("../models/Review");
const Comment = require("../models/Comment");

// Middleware kiểm tra đăng nhập
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  next();
}

// Danh sách sản phẩm + filter + sort + paging
// routes/product.routes.js

router.get("/", async (req, res) => {
  try {
    const {
      q,
      category,
      minRating,
      sort,
      page = 1,
      limit = 12,
      ram,
      storage,
      screen,
      chip,
      battery
    } = req.query;

    const filter = {};

    // Tìm theo tên (chứa chuỗi, không phân biệt hoa thường)
    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }

    // Loại sản phẩm
    if (category) {
      filter.category = category;
    }

    // Đánh giá tối thiểu
    if (minRating) {
      filter.ratingAverage = { $gte: Number(minRating) };
    }

    // RAM – giả sử field là `ram`
    if (ram) {
      filter.ram = ram;
      // nếu bạn đang lưu trong specs.ram thì đổi thành:
      // filter["specs.ram"] = ram;
    }

    // ROM / Storage – giả sử field là `storage`
    if (storage) {
      filter.storage = storage;
      // hoặc filter["specs.storage"] = storage;
    }

    // Màn hình – giả sử field là `screenSize`
    if (screen) {
      filter.screenSize = Number(screen);
      // nếu là string "13\"" thì giữ nguyên: filter.screenSize = screen;
    }

    // Chip – giả sử field là `chip`
    if (chip) {
      filter.chip = chip;
      // hoặc filter["specs.chip"] = chip;
    }

    // Pin: phân loại theo dung lượng
    // Giả sử trường là `batteryMah` (Number, đơn vị mAh)
    if (battery === "high") {
      // >= 6000 mAh
      filter.batteryMah = { $gte: 6000 };
    } else if (battery === "medium") {
      // 4000 - 5999
      filter.batteryMah = { $gte: 4000, $lt: 6000 };
    } else if (battery === "low") {
      // < 4000
      filter.batteryMah = { $lt: 4000 };
    }

    // Sắp xếp
    let sortOption = {};
    switch (sort) {
      case "name_asc":
        sortOption.name = 1;
        break;
      case "name_desc":
        sortOption.name = -1;
        break;
      case "price_asc":
        sortOption.basePrice = 1;
        break;
      case "price_desc":
        sortOption.basePrice = -1;
        break;
      default:
        sortOption.createdAt = -1;
    }

    const currentPage = Number(page) || 1;
    const perPage = Number(limit) || 12;
    const skip = (currentPage - 1) * perPage;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(perPage),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / perPage);

    res.render("product-list", {
      title: "Danh sách sản phẩm",
      products,
      currentPage,
      totalPages,
      query: req.query
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});


// Chi tiết sản phẩm + review + comment
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id);
    if (!product) return res.status(404).send("Không tìm thấy sản phẩm");

    const [reviews, comments] = await Promise.all([
      Review.find({ product: id })
        .populate("user", "fullName")
        .sort({ createdAt: -1 }),
      Comment.find({ product: id }).sort({ createdAt: -1 })
    ]);

    res.render("product-detail", {
      product,
      reviews,
      comments
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});

// Thêm comment (không cần login)
router.post("/:id/comments", async (req, res) => {
  try {
    const productId = req.params.id;
    const { authorName, content } = req.body;

    const comment = new Comment({
      product: productId,
      authorName: authorName || "Khách",
      content
    });
    await comment.save();

    res.redirect(`/products/${productId}#comments`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});

// Thêm review (cần login)
router.post("/:id/reviews", requireLogin, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.user.id;
    const { rating, title, content } = req.body;

    const review = new Review({
      product: productId,
      user: userId,
      rating: Number(rating),
      title,
      content
    });
    await review.save();

    // Tính lại ratingAverage + ratingCount
    const agg = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    if (agg.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        ratingAverage: agg[0].avgRating,
        ratingCount: agg[0].count
      });
    }

    res.redirect(`/products/${productId}#reviews`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});

module.exports = router;
