const express = require('express');
const path = require('path');
const app = express();
const connectMongoDB = require('./src/services/databaseService');
const Category = require('./src/models/Category');

//Connect MongoDB
connectMongoDB();

// Middleware
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(express.json()); // For parsing application/json
app.use(express.static(path.join(__dirname, 'uploads')));

//routes
app.use('/verify', require('./routes/emailVerify'));
//routes/manage
app.use('/manage', require('./routes/manage/managepage'));
app.use('/manage/category', require('./routes/manage/category'));
app.use('/manage/manager', require('./routes/manage/managers'));
app.use('/manage/item', require('./routes/manage/item'));
app.use('/manage/order', require('./routes/manage/order'));
//routes/onlineStore
app.use('/', require('./routes/onlineStore/storepage'));
app.use('/user', require('./routes/onlineStore/users'));
app.use('/user/customer', require('./routes/onlineStore/customer-page'));

app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "pug");

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

//start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server chay tren cong ${PORT}`));

// API Endpoint để lưu thứ tự danh mục
app.post('/save-order', async (req, res) => {
    const order = req.body.order; // Dữ liệu thứ tự từ client

    try {
        // Xóa các mục hiện tại và cập nhật theo thứ tự mới
        await Category.updateMany({}, { $set: { position: 0 } }); // Reset position
        const updatePromises = order.map((id, index) => {
            return Category.findByIdAndUpdate(id, { position: index }, { new: true });
        });

        const updatedCategories = await Promise.all(updatePromises);
        console.log('Updated categories:', updatedCategories);

        res.sendStatus(200);
    } catch (error) {
        console.error('Lỗi:', error);
        res.sendStatus(500);
    }
});