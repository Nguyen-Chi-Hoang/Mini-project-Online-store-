const express = require('express');
const router = express.Router();

//Store page
router.get('/', (req, res) => res.render("storepage"));

module.exports = router;