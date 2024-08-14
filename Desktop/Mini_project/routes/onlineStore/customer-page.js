const express = require('express');
const router = express.Router();
const userController = require('../../src/controllers/onlineStore/userController');

//Customer page
router.get('/:userId', userController.renderProfile);
//cart page
router.get('/:userId/cart', userController.renderCartPage);
//Item detail page
router.get('/:userId/item/:itemId', userController.renderItemDetail);
//add to cart
router.post(`/:userId/item/:itemId`, userController.addToCart);

module.exports = router;