const Voucher = require("../../models/Voucher");
const cron = require('node-cron');

async function voucherPage(req, res) {
    await Voucher.checkExpiration();
    const searchQuery = req.query.search || '';
    const sortField = req.query.sort || 'createdAt'; // Default sorting field
    const sortOrder = req.query.order === 'desc' ? -1 : 1;
    const currentPage = parseInt(req.query.page) || 1;
    const vouchersPerPage = 3;

    let query = {}
    // Filter vouchers based on the search query
    if (searchQuery) {
        query.code = new RegExp(searchQuery, 'i');
    }

    // Find and sort vouchers
    const vouchers = await Voucher.find(query)
        .sort({ [sortField]: sortOrder })
        .skip((currentPage - 1) * vouchersPerPage)
        .limit(vouchersPerPage);

    // Get total number of vouchers for pagination
    const totalVouchers = await Voucher.countDocuments(query);
    const totalPages = Math.ceil(totalVouchers / vouchersPerPage);

    const managerId = req.session.managerId;
    res.render('manage/voucher/voucher', {
        vouchers, 
        managerId,
        currentPage,
        searchQuery,
        totalPages,
        sortField,
        sortOrder: req.query.order || 'asc' // Pass the sorting order to the template
    });
}

// Controller function to create voucher
async function createVoucher(req, res) {
    try {
        const { code, discountPercentage, minOrderValue, startDate, endDate, totalQuantity } = req.body;

        const newVoucher = new Voucher({
            code,
            discountPercentage,
            minOrderValue,
            startDate,
            endDate,
            totalQuantity,
            remainingQuantity: totalQuantity
        });

        if (endDate <= startDate) {
            return res.status(409).json({
                message: 'End date must be after the start date.'
            });
        }
        // Save the voucher to the database
        await newVoucher.save();
        res.redirect(`/manage/voucher`);
    } catch (err) {
        // Handle duplicate key error for code field (error code 11000)
        if (err.code === 11000) {
            return res.status(409).json({
                message: 'Voucher code already exists. Please use a different code.'
            });
        }
    }
}

async function renderUpdateVoucherPage(req, res) {
    const {managerId, voucherId} = req.params;
    const voucher = await Voucher.findOne({_id:voucherId});
    res.render('manage/voucher/update_voucher', {managerId, voucher});
}

async function updateVoucher(req, res) {
    const voucherId = req.params.voucherId;
        const {
            code,
            discountPercentage,
            minOrderValue,
            startDate,
            endDate,
            totalQuantity
        } = req.body;

        // Fetch the existing voucher
        const existingVoucher = await Voucher.findOne({ _id: voucherId });
        if (!existingVoucher) {
            return res.status(404).send('Voucher not found');
        }

        // Calculate the new remaining quantity
        const newRemainingQuantity = existingVoucher.remainingQuantity + (totalQuantity - existingVoucher.totalQuantity);

        // Prepare the fields to update
        const updateFields = {
            code,
            discountPercentage,
            minOrderValue,
            startDate,
            endDate,
            totalQuantity,
            remainingQuantity: newRemainingQuantity
        };

        if (endDate <= startDate) {
            return res.status(409).json({
                message: 'End date must be after the start date.'
            });
        }

        // Update the voucher
        await Voucher.updateOne(
            { _id: voucherId },
            { $set: updateFields }
        );

        res.redirect(`/manage/voucher`);
}

async function deleteVoucherService(req, res) {
    const voucherId = req.params.voucherId;
    await Voucher.deleteOne({_id: voucherId});
    res.redirect(`/manage/voucher`);
}

// Schedule a task to check voucher expiration status every day at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        await Voucher.checkExpiration();
        console.log('Voucher expiration check completed.');
    } catch (error) {
        console.error('Error checking voucher expiration:', error);
    }
});

module.exports = {
    voucherPage,
    createVoucher,
    renderUpdateVoucherPage,
    updateVoucher,
    deleteVoucherService
}