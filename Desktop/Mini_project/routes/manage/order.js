const express = require('express');
const router = express.Router();
const oderController = require('../../src/controllers/manage/oderController');

//order page
router.get('/', oderController.loadOrder);

module.exports = router;