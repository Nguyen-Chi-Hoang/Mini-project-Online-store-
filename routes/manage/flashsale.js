const express = require('express');
const router = express.Router();
const flashsaleController = require('../../src/controllers/manage/flashsaleController');

//flashsale page
router.get('/flashsale', flashsaleController.flashsalePageController);

//create flashsale page
router.get('/flashsale/:itemId/add', flashsaleController.renderCreateflashsalePageController);

//create flashsale function
router.post('/flashsale/:itemId/add', flashsaleController.createflashsaleController);

//route to update flashsale page
router.get('/flashsale/:itemId/update', flashsaleController.renderUpdateflashsalePageController);

//update flashsale function
router.post('/flashsale/:itemId/update', flashsaleController.updateflashsaleController);

//delete flashsale function
router.post('/flashsale/:itemId/delete', flashsaleController.deleteflashsaleController);

module.exports = router