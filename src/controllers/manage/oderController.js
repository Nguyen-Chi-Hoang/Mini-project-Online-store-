const orderService = require('../../services/manage/orderService');

const loadOrder = async (req, res) => {
    try {
        orderService.loadOrder(req, res);
    } catch (error) {
        console.error('Error loading orders:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    loadOrder,
};
