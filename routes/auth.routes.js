// routes/auth.routes.js
const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Order = require("../models/Order");

const router = express.Router();

// ===== Middleware bắt buộc đăng nhập =====
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  next();
}

// ===== Cấu hình mail (dùng chung cho OTP, đơn hàng, ...) =====
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ===================================================================
//  ĐĂNG KÝ
// ===================================================================
router.get("/register", (req, res) => {
  res.render("auth/register", { error: null, form: {} });
});

router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, line1, city, phone } = req.body;

    const existing = await User.findOne({ email });

    if (existing && !existing.isGuest) {
      return res.render("auth/register", {
        error: "Email đã được sử dụng.",
        form: { email, fullName, line1, city, phone },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let user;
    if (existing && existing.isGuest) {
      existing.passwordHash = passwordHash;
      existing.fullName = fullName;
      existing.defaultAddress = { fullName, line1, city, phone, isDefault: true };
      existing.isGuest = false;
      existing.provider = "local";
      user = await existing.save();
    } else {
      user = await User.create({
        email,
        passwordHash,
        fullName,
        defaultAddress: { fullName, line1, city, phone, isDefault: true },
        provider: "local",
        isGuest: false,
      });
    }

    req.session.user = {
      id: user._id.toString(),
      fullName: user.fullName,
      role: user.role,
    };

    res.redirect("/");
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).send("Lỗi server");
  }
});

// ===================================================================
//  ĐĂNG NHẬP
// ===================================================================
router.get("/login", (req, res) => {
  res.render("auth/login", { error: null, email: "" });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(400).render("auth/login", {
        error: "Sai email hoặc mật khẩu",
        email,
      });
    }

    const ok = await user.checkPassword(password);
    if (!ok) {
      return res.status(400).render("auth/login", {
        error: "Sai email hoặc mật khẩu",
        email,
      });
    }

    req.session.user = {
      id: user._id.toString(),
      fullName: user.fullName,
      role: user.role,
    };

    res.redirect("/");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Lỗi server");
  }
});

// ===================================================================
//  ĐĂNG XUẤT
// ===================================================================
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// ===================================================================
//  HỒ SƠ / TÀI KHOẢN (thông tin + đơn hàng + địa chỉ)
// ===================================================================
// GET /auth/profile
router.get("/profile", requireLogin, async (req, res) => {
  try {
    const userDoc = await User.findById(req.session.user.id).lean();
    if (!userDoc) {
      return res.redirect("/auth/login");
    }

    const orders = await Order.find({ user: userDoc._id })
      .sort({ createdAt: -1 })
      .lean();

    const ordersByStatus = {
      pending: orders.filter(o => o.status === "pending"),
      processing: orders.filter(o => o.status === "processing"),
      completed: orders.filter(o => o.status === "completed"),
      cancelled: orders.filter(o => o.status === "cancelled")
    };

    const addresses = userDoc.addresses || [];
    const defaultAddress =
      userDoc.defaultAddress ||
      addresses.find(a => a.isDefault) ||
      null;

    res.render("auth/profile", {
      user: userDoc,
      ordersByStatus,
      addresses,
      defaultAddress
    });
  } catch (err) {
    console.error("Lỗi lấy thông tin tài khoản:", err);
    res.status(500).send("Có lỗi khi tải trang tài khoản.");
  }
});


// ===================================================================
//  QUẢN LÝ ĐỊA CHỈ GIAO HÀNG
// ===================================================================

// Thêm địa chỉ mới
router.post("/addresses/add", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) return res.redirect("/auth/login");

    const {
      fullName,
      phone,
      line1,
      city,
      district,
      ward,
      isDefault
    } = req.body;

    const newAddress = {
      fullName,
      phone,
      line1,
      city,
      district,
      ward,
      isDefault: !!isDefault
    };

    // nếu địa chỉ mới là mặc định → clear các địa chỉ cũ
    if (newAddress.isDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
      user.defaultAddress = { ...newAddress, isDefault: true };
    }

    user.addresses.push(newAddress);
    await user.save();

    res.redirect("/auth/profile#shipping");
  } catch (err) {
    console.error("Lỗi thêm địa chỉ:", err);
    res.status(500).send("Lỗi thêm địa chỉ.");
  }
});

// Cập nhật 1 địa chỉ
router.post("/addresses/:id/update", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) return res.redirect("/auth/login");

    const key = req.params.id;

    // Thử tìm theo _id subdocument trước
    let addr = user.addresses.id(key);

    // Nếu không có _id (đang dùng index 0,1,2,...) thì tìm theo index
    if (!addr) {
      const idx = parseInt(key, 10);
      if (!Number.isNaN(idx) && idx >= 0 && idx < user.addresses.length) {
        addr = user.addresses[idx];
      }
    }

    if (!addr) {
      return res.status(404).send("Không tìm thấy địa chỉ.");
    }

    const { fullName, phone, line1, city, district, ward, isDefault } = req.body;

    addr.fullName = fullName;
    addr.phone = phone;
    addr.line1 = line1;
    addr.city = city;
    addr.district = district;
    addr.ward = ward;

    const willDefault = !!isDefault;
    if (willDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
      addr.isDefault = true;

      user.defaultAddress = {
        fullName: addr.fullName,
        phone: addr.phone,
        line1: addr.line1,
        city: addr.city,
        district: addr.district,
        ward: addr.ward,
        isDefault: true
      };
    }

    await user.save();
    res.redirect("/auth/profile#shipping");
  } catch (err) {
    console.error("Lỗi cập nhật địa chỉ:", err);
    res.status(500).send("Lỗi cập nhật địa chỉ.");
  }
});


// Đặt 1 địa chỉ làm mặc định (nút "Đặt làm mặc định")
router.post("/addresses/:id/default", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) return res.redirect("/auth/login");

    const key = req.params.id;
    let addr = user.addresses.id(key);

    if (!addr) {
      const idx = parseInt(key, 10);
      if (!Number.isNaN(idx) && idx >= 0 && idx < user.addresses.length) {
        addr = user.addresses[idx];
      }
    }

    if (!addr) {
      return res.status(404).send("Không tìm thấy địa chỉ.");
    }

    // Clear cũ
    user.addresses.forEach(a => (a.isDefault = false));
    addr.isDefault = true;

    // Đồng bộ sang defaultAddress
    user.defaultAddress = {
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1,
      city: addr.city,
      district: addr.district,
      ward: addr.ward,
      isDefault: true
    };

    await user.save();
    res.redirect("/auth/profile#shipping");
  } catch (err) {
    console.error("Lỗi đặt mặc định địa chỉ:", err);
    res.status(500).send("Lỗi đặt mặc định địa chỉ.");
  }
});


// Xoá địa chỉ
router.post("/addresses/:id/delete", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) return res.redirect("/auth/login");

    const key = req.params.id;
    let addr = user.addresses.id(key);
    let idx = -1;

    if (!addr) {
      idx = parseInt(key, 10);
      if (!Number.isNaN(idx) && idx >= 0 && idx < user.addresses.length) {
        addr = user.addresses[idx];
      }
    }

    if (!addr) {
      return res.status(404).send("Không tìm thấy địa chỉ.");
    }

    const wasDefault = addr.isDefault;

    if (addr.remove) {
      // nếu là subdocument thật
      addr.remove();
    } else if (idx >= 0) {
      // nếu đang dùng index
      user.addresses.splice(idx, 1);
    }

    if (wasDefault) {
      user.defaultAddress = null;
    }

    await user.save();
    res.redirect("/auth/profile#shipping");
  } catch (err) {
    console.error("Lỗi xoá địa chỉ:", err);
    res.status(500).send("Lỗi xoá địa chỉ.");
  }
});



// ===================================================================
//  ĐỔI MẬT KHẨU (user đang đăng nhập) – OTP 6 số, 1 phút
// ===================================================================

// GET: form nhập mật khẩu cũ + mật khẩu mới
router.get("/change-password", requireLogin, (req, res) => {
  res.render("auth/change-password", {
    error: null,
    success: null,
  });
});

// POST: gửi OTP vào email nếu mật khẩu cũ đúng
router.post("/change-password", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.redirect("/auth/login");

    const ok = await user.checkPassword(currentPassword);
    if (!ok) {
      return res.render("auth/change-password", {
        error: "Mật khẩu hiện tại không đúng.",
        success: null,
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.render("auth/change-password", {
        error: "Mật khẩu mới phải từ 6 ký tự.",
        success: null,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render("auth/change-password", {
        error: "Xác nhận mật khẩu mới không khớp.",
        success: null,
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Tạo OTP 6 số
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu vào session, 1 phút
    req.session.changePasswordOtp = {
      userId: user._id.toString(),
      email: user.email,
      code,
      newPasswordHash,
      expiresAt: Date.now() + 60 * 1000,
    };

    // Gửi mail OTP
    await transporter.sendMail({
      from: `"HuongHan Store" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Mã xác thực đổi mật khẩu",
      html: `<p>Mã OTP đổi mật khẩu của bạn là: <strong>${code}</strong></p>
             <p>Mã có hiệu lực trong 1 phút.</p>`,
    });

    res.render("auth/change-password-verify", {
      error: null,
    });
  } catch (err) {
    console.error("Change password (send OTP) error:", err);
    res.render("auth/change-password", {
      error: "Có lỗi xảy ra, vui lòng thử lại.",
      success: null,
    });
  }
});

// GET: nếu user refresh lại trang verify
router.get("/change-password/verify", requireLogin, (req, res) => {
  if (!req.session.changePasswordOtp) {
    return res.redirect("/auth/change-password");
  }
  res.render("auth/change-password-verify", { error: null });
});

// POST: xác thực OTP và update mật khẩu
router.post("/change-password/verify", requireLogin, async (req, res) => {
  try {
    const { otp } = req.body;
    const otpData = req.session.changePasswordOtp;

    if (!otpData) {
      return res.redirect("/auth/change-password");
    }

    if (Date.now() > otpData.expiresAt) {
      req.session.changePasswordOtp = null;
      return res.render("auth/change-password-verify", {
        error: "Mã OTP đã hết hạn. Vui lòng thử lại.",
      });
    }

    if (otp !== otpData.code) {
      return res.render("auth/change-password-verify", {
        error: "Mã OTP không chính xác.",
      });
    }

    const user = await User.findById(otpData.userId);
    if (!user) {
      req.session.changePasswordOtp = null;
      return res.redirect("/auth/login");
    }

    user.passwordHash = otpData.newPasswordHash;
    await user.save();

    req.session.changePasswordOtp = null;

    res.render("auth/change-password", {
      error: null,
      success: "Đổi mật khẩu thành công.",
    });
  } catch (err) {
    console.error("Change password verify error:", err);
    res.render("auth/change-password-verify", {
      error: "Có lỗi xảy ra, vui lòng thử lại.",
    });
  }
});

// ===================================================================
//  QUÊN MẬT KHẨU – OTP 6 số, 1 phút
// ===================================================================

// B1: nhập email
router.get("/forgot-password", (req, res) => {
  res.render("auth/forgot-password", { error: null });
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.passwordHash) {
      return res.render("auth/forgot-password", {
        error: "Email không tồn tại hoặc tài khoản không hợp lệ.",
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    req.session.resetPasswordOtp = {
      userId: user._id.toString(),
      email: user.email,
      code,
      expiresAt: Date.now() + 60 * 1000,
    };

    await transporter.sendMail({
      from: `"HuongHan Store" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Mã xác thực đặt lại mật khẩu",
      html: `<p>Mã OTP đặt lại mật khẩu của bạn là: <strong>${code}</strong></p>
             <p>Mã có hiệu lực trong 1 phút.</p>`,
    });

    res.render("auth/reset-password", {
      error: null,
      email: user.email,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.render("auth/forgot-password", {
      error: "Có lỗi xảy ra, vui lòng thử lại.",
    });
  }
});

// B2: nhập OTP + mật khẩu mới
router.get("/reset-password", (req, res) => {
  const otpData = req.session.resetPasswordOtp;
  if (!otpData) {
    return res.redirect("/auth/forgot-password");
  }
  res.render("auth/reset-password", {
    error: null,
    email: otpData.email,
  });
});

router.post("/reset-password", async (req, res) => {
  try {
    const { otp, newPassword, confirmPassword } = req.body;
    const otpData = req.session.resetPasswordOtp;

    if (!otpData) {
      return res.redirect("/auth/forgot-password");
    }

    if (Date.now() > otpData.expiresAt) {
      req.session.resetPasswordOtp = null;
      return res.render("auth/reset-password", {
        error: "Mã OTP đã hết hạn. Vui lòng thử lại.",
        email: otpData.email,
      });
    }

    if (otp !== otpData.code) {
      return res.render("auth/reset-password", {
        error: "Mã OTP không chính xác.",
        email: otpData.email,
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.render("auth/reset-password", {
        error: "Mật khẩu mới phải từ 6 ký tự.",
        email: otpData.email,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render("auth/reset-password", {
        error: "Xác nhận mật khẩu mới không khớp.",
        email: otpData.email,
      });
    }

    const user = await User.findById(otpData.userId);
    if (!user) {
      req.session.resetPasswordOtp = null;
      return res.redirect("/auth/forgot-password");
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    req.session.resetPasswordOtp = null;

    res.render("auth/login", {
      error: null,
      email: user.email,
      success: "Đặt lại mật khẩu thành công, hãy đăng nhập.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    const email = (req.session.resetPasswordOtp && req.session.resetPasswordOtp.email) || "";
    res.render("auth/reset-password", {
      error: "Có lỗi xảy ra, vui lòng thử lại.",
      email,
    });
  }
});

module.exports = router;
