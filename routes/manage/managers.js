const express = require('express');
const router = express.Router();
const managerController = require('../../src/controllers/manage/managerController')

//login for manager page
router.get('/login', (req, res) => res.render('manage/manager/login'));

//login function
router.post('/login', managerController.loginManager);

//signup new manager page
router.get('/signup', (req, res) => res.render('manage/manager/signup'));

//signup function
router.post('/signup', managerController.registerManager);

//logout funtion
router.post('/logout', (req, res) => {
    req.session.isLogin = false;
    req.session.managerId = null;
    res.redirect('/manage/login');
})
module.exports = router;