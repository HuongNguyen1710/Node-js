// seed/products.seed.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/Product");

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Đã kết nối MongoDB, xoá dữ liệu sản phẩm cũ...");
    await Product.deleteMany({});

    const products = [
      // ===================== ĐIỆN THOẠI (APPLE) =====================
      {
        name: "iPhone 15 Pro Max",
        brand: "Apple",
        category: "dien-thoai",
        basePrice: 32990000,
        variants: [
          {
            name: "8GB/256GB",
            sku: "IP15PM-8-256",
            price: 32990000,
            stock: 20
          },
          {
            name: "8GB/512GB",
            sku: "IP15PM-8-512",
            price: 36990000,
            stock: 15
          }
        ],
        thumbnail: "/images/iphone-15-pm-thumb.jpg",
        images: [
          "/images/iphone-15-pm-1.jpg",
          "/images/iphone-15-pm-2.jpg",
          "/images/iphone-15-pm-3.jpg"
        ],
        shortDescription: "iPhone 15 Pro Max với viền titan, chip A17 Pro, camera zoom xa, màn hình OLED 120Hz.",
        description:
          "iPhone 15 Pro Max là mẫu iPhone cao cấp với thiết kế khung viền titan sang trọng.\n" +
          "Máy được trang bị chip A17 Pro mạnh mẽ, tối ưu cho chơi game và xử lý đồ hoạ nặng.\n" +
          "Cụm camera cho khả năng chụp đêm, chụp chân dung và zoom xa ấn tượng.\n" +
          "Màn hình OLED tần số quét cao mang lại trải nghiệm mượt mà khi lướt web, chơi game.\n" +
          "Thời lượng pin được tối ưu, thoải mái sử dụng nguyên ngày với nhu cầu nặng.",
        specs: {
          screen: "OLED 6.7'' 120Hz",
          chip: "Apple A17 Pro",
          ram: "8GB",
          storage: "256GB / 512GB",
          battery: "4422 mAh"
        },
        isFeatured: true,
        isNew: true,
        isBestSeller: true,
        ratingAverage: 4.8,
        ratingCount: 120
      },
      {
        name: "iPhone 15",
        brand: "Apple",
        category: "dien-thoai",
        basePrice: 22990000,
        variants: [
          {
            name: "6GB/128GB",
            sku: "IP15-6-128",
            price: 22990000,
            stock: 25
          },
          {
            name: "6GB/256GB",
            sku: "IP15-6-256",
            price: 25990000,
            stock: 18
          }
        ],
        thumbnail: "/images/iphone-15-thumb.jpg",
        images: [
          "/images/iphone-15-1.jpg",
          "/images/iphone-15-2.jpg",
          "/images/iphone-15-3.jpg"
        ],
        shortDescription: "iPhone 15 với Dynamic Island, camera mới, chip A16 Bionic.",
        description:
          "iPhone 15 mang lại thiết kế hiện đại với Dynamic Island, cập nhật so với thế hệ trước.\n" +
          "Chip A16 Bionic vẫn rất mạnh mẽ, đáp ứng tốt mọi nhu cầu hàng ngày.\n" +
          "Camera được nâng cấp cho chất lượng ảnh đẹp và chi tiết hơn.\n" +
          "Màn hình OLED sắc nét, độ sáng cao, hiển thị tốt ngoài trời.\n" +
          "Thời lượng pin ổn, đủ dùng nguyên ngày với nhu cầu thông thường.",
        specs: {
          screen: "OLED 6.1''",
          chip: "Apple A16 Bionic",
          ram: "6GB",
          storage: "128GB / 256GB",
          battery: "Khoảng 3349 mAh"
        },
        isFeatured: true,
        isNew: true,
        isBestSeller: false,
        ratingAverage: 4.6,
        ratingCount: 80
      },

      // ===================== LAPTOP (APPLE) =====================
      {
        name: "MacBook Air 13 M2",
        brand: "Apple",
        category: "laptop",
        basePrice: 27990000,
        variants: [
          {
            name: "8GB/256GB",
            sku: "MBA13-M2-8-256",
            price: 27990000,
            stock: 15
          },
          {
            name: "16GB/512GB",
            sku: "MBA13-M2-16-512",
            price: 34990000,
            stock: 10
          }
        ],
        thumbnail: "/images/macbook-air-m2-thumb.jpg",
        images: [
          "/images/macbook-air-m2-1.jpg",
          "/images/macbook-air-m2-2.jpg",
          "/images/macbook-air-m2-3.jpg"
        ],
        shortDescription: "MacBook Air M2 mỏng nhẹ, pin trâu, hiệu năng đủ cho học tập và văn phòng.",
        description:
          "MacBook Air 13 M2 sở hữu thiết kế mỏng nhẹ, phù hợp cho người thường xuyên di chuyển.\n" +
          "Chip Apple M2 mang lại hiệu năng mạnh mẽ nhưng vẫn tiết kiệm năng lượng.\n" +
          "Màn hình Retina hiển thị sắc nét, màu sắc chính xác, phù hợp cho học tập và làm việc.\n" +
          "Bàn phím và trackpad cho trải nghiệm gõ, điều khiển rất thoải mái.\n" +
          "Thời lượng pin tốt, có thể sử dụng nhiều giờ liên tục mà không cần sạc.",
        specs: {
          screen: "13.6'' Liquid Retina",
          chip: "Apple M2",
          ram: "8GB / 16GB",
          storage: "256GB / 512GB",
          battery: "Khoảng 18 giờ lướt web"
        },
        isFeatured: true,
        isNew: false,
        isBestSeller: true,
        ratingAverage: 4.7,
        ratingCount: 80
      },
      {
        name: "MacBook Pro 14 M3",
        brand: "Apple",
        category: "laptop",
        basePrice: 38990000,
        variants: [
          {
            name: "8GB/512GB",
            sku: "MBP14-M3-8-512",
            price: 38990000,
            stock: 12
          },
          {
            name: "16GB/1TB",
            sku: "MBP14-M3-16-1T",
            price: 45990000,
            stock: 8
          }
        ],
        thumbnail: "/images/macbook-pro-14-m3-thumb.jpg",
        images: [
          "/images/macbook-pro-14-m3-1.jpg",
          "/images/macbook-pro-14-m3-2.jpg",
          "/images/macbook-pro-14-m3-3.jpg"
        ],
        shortDescription: "MacBook Pro 14 M3 dành cho người dùng chuyên nghiệp, hiệu năng mạnh.",
        description:
          "MacBook Pro 14 M3 hướng đến người dùng cần hiệu năng cao cho đồ hoạ, lập trình, dựng phim.\n" +
          "Chip M3 mang lại hiệu suất ấn tượng, khả năng xử lý mượt mà nhiều tác vụ nặng.\n" +
          "Màn hình Liquid Retina XDR cho chất lượng hiển thị xuất sắc, phù hợp chỉnh sửa hình ảnh.\n" +
          "Hệ thống loa, micro, webcam được nâng cấp, phù hợp cho họp online và sáng tạo nội dung.\n" +
          "Thời lượng pin tốt trong phân khúc, vẫn duy trì được sự linh hoạt của dòng Pro.",
        specs: {
          screen: "14.2'' Liquid Retina XDR",
          chip: "Apple M3",
          ram: "8GB / 16GB",
          storage: "512GB / 1TB",
          battery: "Tối đa ~18 giờ xem video"
        },
        isFeatured: true,
        isNew: true,
        isBestSeller: true,
        ratingAverage: 4.9,
        ratingCount: 40
      },

      // ===================== MÀN HÌNH (APPLE) =====================
      {
        name: "Apple Studio Display 27\" 5K",
        brand: "Apple",
        category: "man-hinh",
        basePrice: 41990000,
        variants: [
          {
            name: "Studio Display kính tiêu chuẩn",
            sku: "ASD-27-STD",
            price: 41990000,
            stock: 10
          },
          {
            name: "Studio Display kính chống chói",
            sku: "ASD-27-NANO",
            price: 45990000,
            stock: 6
          }
        ],
        thumbnail: "/images/apple-studio-display-thumb.jpg",
        images: [
          "/images/apple-studio-display-1.jpg",
          "/images/apple-studio-display-2.jpg",
          "/images/apple-studio-display-3.jpg"
        ],
        shortDescription: "Màn hình Apple Studio Display 27\" 5K dành cho dân sáng tạo nội dung.",
        description:
          "Apple Studio Display là màn hình 27 inch độ phân giải 5K, cho hình ảnh cực kỳ sắc nét.\n" +
          "Độ sáng cao, dải màu rộng, phù hợp cho designer, photographer, editor.\n" +
          "Tích hợp loa, micro và webcam chất lượng tốt, hỗ trợ họp trực tuyến rõ ràng.\n" +
          "Thiết kế tối giản, cao cấp, phù hợp với hệ sinh thái Apple.\n" +
          "Phiên bản kính chống chói giúp làm việc tốt hơn trong môi trường nhiều nguồn sáng.",
        specs: {
          screen: "27'' 5K Retina",
          chip: "Apple A13 (xử lý camera/âm thanh)",
          ram: "N/A",
          storage: "N/A",
          battery: "N/A"
        },
        isFeatured: true,
        isNew: false,
        isBestSeller: false,
        ratingAverage: 4.5,
        ratingCount: 25
      },

      // ===================== Ổ CỨNG / LƯU TRỮ (APPLE) =====================
      {
        name: "Apple SSD nâng cấp cho Mac Pro",
        brand: "Apple",
        category: "o-cung",
        basePrice: 12990000,
        variants: [
          {
            name: "1TB SSD kit",
            sku: "AP-SSD-MP-1TB",
            price: 12990000,
            stock: 15
          },
          {
            name: "2TB SSD kit",
            sku: "AP-SSD-MP-2TB",
            price: 19990000,
            stock: 10
          }
        ],
        thumbnail: "/images/apple-ssd-macpro-thumb.jpg",
        images: [
          "/images/apple-ssd-macpro-1.jpg",
          "/images/apple-ssd-macpro-2.jpg",
          "/images/apple-ssd-macpro-3.jpg"
        ],
        shortDescription: "Bộ kit SSD chính hãng Apple dùng để nâng cấp dung lượng cho Mac Pro.",
        description:
          "Bộ kit SSD nâng cấp cho Mac Pro dành cho người dùng cần mở rộng dung lượng lưu trữ.\n" +
          "Chuẩn SSD do Apple thiết kế, đảm bảo tính ổn định và tương thích tốt với macOS.\n" +
          "Thích hợp cho các workflow cần lưu trữ video 4K/8K, project lớn.\n" +
          "Lắp đặt theo hướng dẫn từ Apple, đảm bảo hiệu năng và độ bền.\n" +
          "Tuỳ chọn dung lượng 1TB và 2TB, phù hợp nhiều nhu cầu khác nhau.",
        specs: {
          screen: "N/A",
          chip: "Controller Apple",
          ram: "N/A",
          storage: "1TB / 2TB",
          battery: "N/A"
        },
        isFeatured: false,
        isNew: false,
        isBestSeller: true,
        ratingAverage: 4.3,
        ratingCount: 18
      }
    ];

    await Product.insertMany(products);
    console.log("🌱 Seed dữ liệu sản phẩm Apple-only hoàn tất!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi seed dữ liệu:", err);
    process.exit(1);
  }
}

seed();
