const categoryService = require('../../services/manage/categoryService');

//load category list
const loadCategory = async (req, res) => {
    try {
        categoryService.loadCategory(req, res);
    } catch(err) {
        req.status(400).json({message: err.message});
    }
}

//load create category page
const loadCategoryCreatePage = async (req, res) => {
    try {
        categoryService.loadCategoryCreatePage(req, res);
    } catch(err) {
        req.status(400).json({message: err.message});
    }
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

//render update category page
const routeToUpdateCategoryPage = async (req, res) => {
    try {
        categoryService.routeToUpdateCategoryPage(req, res);
    } catch(err) {
        req.status(400).json({message: err.message});
    }
}

//delete a category
const deleteCategory = async (req, res) => {
    try {
        categoryService.deleteCategory(req, res);
    } catch(err) {
        req.status(400).json({message: err.message});
    }
}

//export modules
module.exports = {
    loadCategory,
    storeCategory,
    updateCategory,
    loadCategoryCreatePage,
    routeToUpdateCategoryPage,
    deleteCategory
}