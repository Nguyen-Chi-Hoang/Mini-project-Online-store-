const express = require('express');
const router = express.Router();
const onlineStoreController = require('../../src/controllers/onlineStore/onlineStoreController');
const bodyParser = require('body-parser');
const Voucher = require('../../src/models/Voucher');
const Cart = require('../../src/models/Cart');
const User = require('../../src/models/User');

//xử lý dữ liệu JSON và URL-encoded
router.use(bodyParser.json());
router.use(
  bodyParser.urlencoded({
    extended: false,
  }),
)

//Store page
router.get('/', onlineStoreController.onlineStoreController);
//item page
router.get('/item', onlineStoreController.itemPageController);
//cart page
router.get('/cart', onlineStoreController.cartPageController_get);
//Checkout function
router.post('/cart', onlineStoreController.cartPageController_post);
//remove item from cart
router.post(`/cart/delete/:itemName`, onlineStoreController.cartPageController_delete);
//Item detail page
router.get('/item/:itemId', onlineStoreController.itemDetailPageController_get);
//add to cart
router.post(`/item/:itemId`, onlineStoreController.itemDetailPageController_post);
//Login page
router.get('/login', (req, res) => res.render("onlineStore/user/login"));
//authenticate a user
router.post('/login', onlineStoreController.loginPageController);
//add user id and authenticated state to session 
router.get('/store-item-id/:userId', (req, res) => {
    req.session.userId = req.params.userId;
    req.session.isAuthenticated = true;
    res.redirect('/');
});
//logout
router.post('/logout', (req, res) => {
    req.session.isAuthenticated = false;
    req.session.userId = null;
    res.redirect('/login');
});
//Register page
router.get('/register', (req, res) => res.render('onlineStore/user/register'));
//creatae new user
router.post('/register', onlineStoreController.registerPageController);

module.exports = router;