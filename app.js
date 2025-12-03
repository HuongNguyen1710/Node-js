const express = require('express');
const app = express();
const path = require('path');

// Cấu hình EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route trang Dashboard
app.get('/admin', (req, res) => {
    // 1. Giả lập dữ liệu từ Database (Sau này thay bằng Model.countDocuments())
    const stats = {
        monthlyEarnings: 250000000, // 250 triệu
        annualEarnings: 3000000000, // 3 tỷ
        pendingOrders: 18,          // Đơn chờ xử lý
        totalProducts: 450          // Tổng sản phẩm
    };

    // 2. Render giao diện và truyền dữ liệu stats qua
    res.render('admin/dashboard', { 
        title: 'Admin Dashboard',
        stats: stats 
    });
});

app.listen(3000, () => {
    console.log('Server Admin chạy tại http://localhost:3000/admin');
});