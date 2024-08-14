const express = require('express');
const router = express.Router();
const itemController = require('../../src/controllers/manage/itemController');
const itemService = require('../../src/services/manage/itemService');
const Imagehander = require('../../src/services/Imagehander');

//item page
router.get('/', itemController.loadItem);
//createItem page
router.get('/new', itemController.loadCategory);
//create new item
router.post('/new', Imagehander.upload.single('image'), itemController.newItem);
//goto update item page
router.get('/:itemId/update', itemService.routeToUpdateItemPage);
//update an item page
router.post('/:itemId/update', Imagehander.upload.single('image'), itemController.updateItem);
//delete item
router.get('/:itemId/delete', itemController.removeItem);

module.exports = router