// routes/order.routes.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Order = require("../models/Order");

// cấu hình mail từ .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// GET /orders/checkout – hiển thị form thanh toán
router.get("/checkout", (req, res) => {
  const cart = req.session.cart || [];
  if (!cart.length) {
    return res.redirect("/cart");
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const user = req.session.user || null;

  res.render("order/checkout", {
  user: req.session.user || null,
  cart,
  total,
  errors: [],
  form: {}
  });
});

// POST /orders/checkout – xử lý đặt hàng
router.post("/checkout", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,   // input name="address"
      city,      // Tỉnh/Thành phố – name="city"
      district,
      ward
    } = req.body;

    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const user = req.session.user || null;

    const errors = [];

    if (!fullName || !email || !phone || !address) {
      errors.push("Vui lòng nhập đầy đủ họ tên, email, số điện thoại và địa chỉ.");
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone || "")) {
      errors.push("Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số.");
    }

    if (!city) errors.push("Vui lòng chọn tỉnh/thành phố.");
    if (!district) errors.push("Vui lòng chọn quận/huyện.");
    if (!ward) errors.push("Vui lòng chọn phường/xã.");

    if (!cart.length) {
      errors.push("Giỏ hàng đang trống.");
    }

    if (errors.length > 0) {
      return res.status(400).render("order/checkout", {
        user,
        cart,
        total,
        errors,
        form: req.body
      });
    }

    // Lưu đơn hàng vào MongoDB
    const order = await Order.create({
      user: user ? user._id : null,
      email,
      items: cart.map(item => ({
        product: item.productId,
        variantId: item.variantId,
        variantName: item.variantName,
        qty: item.qty,
        price: item.price
      })),
      totalAmount: total,
      shippingAddress: {
        fullName,
        phone,
        line1: address,
        line2: "",
        city,
        district,
        ward
      },
      status: "pending"
    });

    // Chuẩn bị nội dung mail
    const itemsHtml = cart.map(item => `
      <tr>
        <td>${item.name} - ${item.variantName}</td>
        <td style="text-align:center;">${item.qty}</td>
        <td style="text-align:right;">${item.price.toLocaleString("vi-VN")}₫</td>
        <td style="text-align:right;">${(item.price * item.qty).toLocaleString("vi-VN")}₫</td>
      </tr>
    `).join("");

    const htmlBody = `
      <p>Chào ${fullName},</p>
      <p>Cảm ơn bạn đã đặt hàng tại HuongHan Store. Dưới đây là thông tin đơn hàng của bạn:</p>
      <h4>Thông tin giao hàng</h4>
      <p>
        ${fullName}<br>
        ${address}, ${ward}, ${district}, ${city}<br>
        SĐT: ${phone}<br>
        Email: ${email}
      </p>
      <h4>Chi tiết đơn hàng</h4>
      <table width="100%" border="1" cellspacing="0" cellpadding="5" style="border-collapse:collapse;">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Số lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <h3>Tổng thanh toán: ${total.toLocaleString("vi-VN")}₫</h3>
      <p>Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
    `;

    // Gửi mail cho khách
    await transporter.sendMail({
      from: `"HuongHan Store" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Xác nhận đơn hàng #${order._id}`,
      html: htmlBody
    });

    // Xoá giỏ sau khi đặt
    req.session.cart = [];

    res.render("order/thank-you", { order });

  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).send("Có lỗi xảy ra khi xử lý đơn hàng.");
  }
});

// GET /orders/my-order – xem danh sách đơn hàng của user hiện tại
router.get("/my-order", async (req, res) => {
  const user = req.session.user;
  if (!user) {
    // nếu chưa đăng nhập thì cho login
    return res.redirect("/auth/login");
  }

  try {
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 });

    res.render("order/my-order", {
      user,
      orders
    });
  } catch (err) {
    console.error("Lỗi lấy đơn hàng:", err);
    res.status(500).send("Không lấy được đơn hàng.");
  }
});


module.exports = router;
