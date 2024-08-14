const Cart = require('../../models/Cart');

const loadOrder = async (req, res) => {
    cartList = await Cart.find();
    res.render('manage/Order/orderPage', {orders: cartList});
}

module.exports = {loadOrder}