const Cart = require('../../models/Cart');

async function loadOrder(req, res) {
    const managerId = req.session.managerId; // Assuming managerId is part of the URL parameters
        const { customerName, isPay, sort, order = 'asc', page = 1, limit = 2 } = req.query;

        // Build the filter object
        const filter = {};
        if (customerName) {
            filter.user_name = { $regex: customerName, $options: 'i' }; // Case-insensitive search
        }
        if (isPay === 'true') {
            filter.isPay = true;
        } else if (isPay === 'false') {
            filter.isPay = false;
        }

        // Build the sort object
        const sortOptions = {};
        if (sort) {
            const sortOrder = order === 'desc' ? -1 : 1;
            sortOptions[sort] = sortOrder;
        }

        // Pagination calculations
        const currentPage = parseInt(page) || 1;
        const itemsPerPage = parseInt(limit) || 2;
        const skip = (currentPage - 1) * itemsPerPage;

        // Query the database
        const [orders, totalOrders] = await Promise.all([
            Cart.find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(itemsPerPage)
                .exec(),
            Cart.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalOrders / itemsPerPage);

        // Render the Pug template with the retrieved data
        res.render('manage/Order/orderPage', {
            orders,
            managerId,
            customerName: customerName || '',
            isPay: isPay || '',
            sortField: sort || '',
            sortOrder: order,
            currentPage,
            totalPages
        });
}

module.exports = {
    loadOrder
}