const Category = require('../../models/Category');
const categoryService = require('../../services/manage/categoryService');

//load category list
const loadCategory = async (req, res) => {
    const list = await Category.find().sort({ position: 1 });
    res.render('manage/category/categories', {categories: list});
}

//create new category
const storeCategory = async (req ,res) => {
    try {
        await categoryService.createCategory(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

//update a category
const updateCategory = async (req, res) => {
    try {
        await categoryService.updateCategory(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

//export modules
module.exports = {
    loadCategory,
    storeCategory,
    updateCategory
}