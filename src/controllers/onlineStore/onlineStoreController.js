const onlineStoreService = require('../../services/onlineStore/onlineStoreService');

//render online store
const onlineStoreController = async (req, res) => {
    try {
        await onlineStoreService.onlineStorePageService(req,res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

//render item page
const itemPageController = async (req, res) => {
    try {
        await onlineStoreService.itemPageService(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

//login
const loginPageController = async (req, res) => {
    try {
       await onlineStoreService.loginPageService(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
};

//create user
const registerPageController = async (req, res) => {
    try {
        await onlineStoreService.registerPageService(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

const itemDetailPageController_get = async (req, res) => {
    try {
        await onlineStoreService.itemDetailPageService_get(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

const itemDetailPageController_post = async (req, res) => {
    try {
        await onlineStoreService.addItemToCart(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

const cartPageController_get  = async (req, res) => {
    try {
        await onlineStoreService.gotoCartPage(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

const cartPageController_post = async (req, res) => {
    try {
        await onlineStoreService.checkoutService(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

const cartPageController_delete = async (req, res) => {
    try {
        await onlineStoreService.removeItemFromCartService(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

module.exports = {
    onlineStoreController,
    itemPageController,
    loginPageController,
    registerPageController,
    itemDetailPageController_get,
    itemDetailPageController_post,
    cartPageController_get,
    cartPageController_post,
    cartPageController_delete
}