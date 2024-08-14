const express = require('express');
const router = express.Router();

//login for manager page
router.get('/login', (req, res) => res.render('manage/manager/login'));

//signup new manager page
router.get('/signup', (req, res) => res.render('manage/manager/signup'));

module.exports = router;