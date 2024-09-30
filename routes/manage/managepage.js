const express = require('express');
const router = express.Router();
const Item = require('../../src/models/Item');
const Manager = require('../../src/models/Manager');
const Category = require('../../src/models/Category');
const Voucher = require('../../src/models/Voucher');
const Flashsale = require('../../src/models/Flashsale');
const User = require('../../src/models/User');
const Cart = require('../../src/models/Cart');

//route to login page
router.get('/', async (req, res) => {
    const managerId = req.session.managerId;
    const managerCount = await Manager.countDocuments();
    const categoryCount = await Category.countDocuments();
    const itemCount = await Item.countDocuments();
    const voucherCount = await Voucher.countDocuments();
    const availableFlashSaleCount = await Flashsale.countDocuments({ remainingQuantity: { $gt: 0 } });
    const userCount = await User.countDocuments();
    
    // Aggregate only carts where isPlay is true and sum the total field
    const totalSales = await Cart.aggregate([
        { $match: { isPay: true } },  // Filter by isPlay: true
        { $group: { _id: null, totalSales: { $sum: "$total" } } }  // Sum the total field
    ]);

    res.render('manage/manageMain', {
        managerId,
        page: 'main',
        managerCount,
        categoryCount,
        itemCount,
        voucherCount,
        availableFlashSaleCount,
        userCount,
        totalSales: totalSales[0] ? totalSales[0].totalSales : 0  // Ensure there's a valid total
    });
});

module.exports = router;