const userService = require('../../services/onlineStore/userService');

//login
const loginUser = async (req, res) => {
    try {
       await userService.loginUser(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
};

//create user
const registerUser = async (req, res) => {
    try {
        await userService.createUser(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

//render page with customer id
const renderProfile = async (req, res) => {
    try {
        await userService.renderPage(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
};

const renderItemDetail = async (req, res) => {
    try {
        await userService.renderItemDetailPage(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

const addToCart = async (req, res) => {
    try {
        await userService.addItemToCart(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

const renderCartPage  = async (req, res) => {
    try {
        await userService.gotoCartPage(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

module.exports = {
    loginUser,
    registerUser,
    renderProfile,
    renderItemDetail,
    addToCart,
    renderCartPage
}