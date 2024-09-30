const validator = require('validator');
const emailverifyService = require('../emailverifyService');
const Manager = require("../../models/Manager");

async function loginManager(req, res) {
    const { username, password } = req.body;
    Manager.findOne({ username, password })
        .then((data) => {
            if(data) {
                //check if user is verified
                if(!data.verified) {
                    res.json({
                        status: "FAILED",
                        message: "Email hasn't been verified yet. Check your inbox",
                    });
                }
                else {
                    req.session.isLogin = true;
                    req.session.managerId = data._id;
                    res.redirect(`../manage`);
                }
            }
            else {
                return res.status(409).json({
                    status: 'error',
                    message: 'Username or password in not correct'
                })
            }
        })
}

async function createManager(req, res) {
    const { username, email, password, passwordVerity } = req.body;
    const verified = false;
    if(username.length<6){
        return res.status(500).json({
            status: 'error',
            message: 'please enter more than 5 letter in your username'
        })
    }
    if(!validator.isEmail(email)) {
        return res.status(500).json({
            status: 'error',
            message: 'please enter the right format of email'
        })
    }
    if(password.length<6){
        return res.status(500).json({
            status: 'error',
            message: 'please enter more than 5 letter in your pasword',
        });
    }
    if(password !== passwordVerity) {
        return res.status(500).json({
            status: 'error',
            message: 'Password do not match'
        })
    }

    const foundManager = await Manager.findOne({ username });
    if(foundManager) {
        return res.status(409).json({
            status: 'error',
            message: 'Already a Manager! Please use another username'
        })
    }
    const foundEmail = await Manager.findOne({ email });
    if(foundEmail) {
        return res.status(409).json({
            status: 'error',
            message: 'Email already used! Please use another email'
        })
    }
    try {
        const newManager = new Manager({ username, email, password, passwordVerity, verified });
        newManager
            .save()
            .then((result) => {
            //handle account verification
            emailverifyService.sendVerificationEmail(result._id, result.email, Manager);
            })
            .catch((err) => {
                res.json({
                    status: "FAILED",
                    message: "An error occurred while saving user account!",
                })
            })
        return res.status(201).json("New manager created");
    } catch(err) {
        res.status(500).json("Database error:" + err.message);
    }
    res.render('signup');
}

module.exports = {
    loginManager,
    createManager
}