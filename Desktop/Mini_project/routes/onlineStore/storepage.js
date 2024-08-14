const express = require('express');
const router = express.Router();
const pageService = require('../../src/services/onlineStore/pageService');

//Store page
router.get('/', pageService.displayItemCategory);
//Item detail page
router.get('/item/:itemId', pageService.displayItemDetail);

module.exports = router;