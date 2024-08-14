const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const userController = require('../../src/controllers/onlineStore/userController');

//xử lý dữ liệu JSON và URL-encoded
router.use(bodyParser.json());
router.use(
  bodyParser.urlencoded({
    extended: false,
  }),
)

//Login page
router.get('/login', (req, res) => res.render("onlineStore/user/login"));
//authenticate a user
router.post('/login', userController.loginUser);

//Register page
router.get('/register', (req, res) => res.render('onlineStore/user/register'));
//creatae new user
router.post('/register', userController.registerUser);

module.exports = router;