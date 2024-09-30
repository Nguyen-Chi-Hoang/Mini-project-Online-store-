const express = require('express');
const path = require('path');
const app = express();
const connectMongoDB = require('./src/services/databaseService');
const session = require('express-session');

// Set up session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Connect MongoDB
connectMongoDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

function checkAuthentication(req, res, next) {
    if (req.path === '/login' || req.path === '/signup') {
        return next();
    }
    if (!req.session.isLogin) {
        return res.redirect('/manage/login');
    }
    next();
}

// Routes
app.use('/verify', require('./routes/emailVerify'));

// Manage routes with authentication check
app.use('/manage', checkAuthentication);
app.use('/manage', require('./routes/manage/managepage'));
app.use('/manage', require('./routes/manage/category'));
app.use('/manage', require('./routes/manage/managers'));
app.use('/manage', require('./routes/manage/item'));
app.use('/manage', require('./routes/manage/order'));
app.use('/manage', require('./routes/manage/voucher'));
app.use('/manage', require('./routes/manage/flashsale'));

// Online store routes
app.use('/', require('./routes/onlineStore/onlineStore'));

// View engine setup
app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "pug");

// Static file handling
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Only start the server if the script is not imported for testing
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, console.log(`Server running on port ${PORT}`));
}

// Export app for testing
module.exports = app;
