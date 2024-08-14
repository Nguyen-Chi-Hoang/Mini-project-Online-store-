const express = require('express');
const router = express.Router();
const emailverifyController = require('../src/controllers/emailverifyController');

//Store page
router.get("/:userId", emailverifyController.verifyE);

module.exports = router;