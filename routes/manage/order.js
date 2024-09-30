const express = require('express');
const router = express.Router();
const oderController = require('../../src/controllers/manage/oderController');

//order page
router.get('/order/', oderController.loadOrder);

module.exports = router;