const itemService = require('../../services/manage/itemService');
const Item = require('../../models/Item');
const Category = require('../../models/Category');

const loadItem = async (req, res) => {
    const itemList = await Item.find();
    res.render("manage/item/Item", {items: itemList});
}

const loadCategory = async (req, res) => {
    const categoryList = await Category.find();
    res.render("manage/item/createItem", {categories: categoryList});
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

const removeItem = async (req, res) => {
    try {
        await itemService.deleteItem(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}
module.exports = {loadItem, newItem, loadCategory, updateItem, removeItem}