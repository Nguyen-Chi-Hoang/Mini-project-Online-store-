const express = require('express');
const router = express.Router();
const itemController = require('../../src/controllers/manage/itemController');
const Imagehander = require('../../src/services/Imagehander');

//item page
router.get('/item/', itemController.loadItem);
//createItem page
router.get('/item/new', itemController.loadCreateItemPage);
//create new item
router.post('/item/new', Imagehander.upload.single('image'), itemController.newItem);
//goto update item page
router.get('/item/:itemId/update', itemController.routeToUpdateItemPage);
//update an item page
router.post('/item/:itemId/update', Imagehander.upload.single('image'), itemController.updateItem);
//delete item
router.post('/item/:itemId/delete', itemController.removeItem);
//route to page list customers buying the item that have itemID
router.get('/item/:itemId/customers', itemController.listCustomersPage);

module.exports = router