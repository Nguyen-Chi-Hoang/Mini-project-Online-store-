const itemService = require('../../services/manage/itemService');

const loadItem = async (req, res) => {
    try {
        await itemService.loadItem(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
};


const loadCreateItemPage = async (req, res) => {
    try {
        await itemService.loadCreateItemPage(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

//create item
const newItem = async (req ,res) => {
    try {
        await itemService.createItem(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

//update item
const updateItem = async (req, res) => {
    try {
        await itemService.updateitem(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

//render update item page
const routeToUpdateItemPage = async (req, res) => {
    try {
        await itemService.routeToUpdateItemPage(req, res);
    } catch {
        req.status(400).json({message: err.message});
    }
}

const removeItem = async (req, res) => {
    try {
        await itemService.deleteItem(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

const listCustomersPage = async (req,res) => {
    try {
        await itemService.listCustomersPage(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

module.exports = {
    loadItem, 
    newItem, 
    loadCreateItemPage, 
    updateItem, 
    removeItem,
    routeToUpdateItemPage,
    listCustomersPage
}