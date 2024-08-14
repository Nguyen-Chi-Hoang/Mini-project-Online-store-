const express = require('express');
const router = express.Router();

//main page
router.get('/', (req, res) => res.render('manage/manageMain'));

module.exports = router;