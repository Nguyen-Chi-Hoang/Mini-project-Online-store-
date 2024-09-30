const express = require('express');
const router = express.Router();
const categoryController = require('../../src/controllers/manage/categoryController');
const Imagehander = require('../../src/services/Imagehander')

//category page
router.get('/category/', categoryController.loadCategory);
//create category page
router.get('/category/new', categoryController.loadCategoryCreatePage);
// Create a new category
router.post('/category/new', Imagehander.upload.single('bannerUrl'), categoryController.storeCategory);
//update category page
router.get('/category/:categoryId/update', categoryController.routeToUpdateCategoryPage);
//update a category
router.post('/category/:categoryId/update', Imagehander.upload.single('bannerUrl'), categoryController.updateCategory);
//delete a category
router.post('/category/:categoryId/delete', categoryController.deleteCategory);

module.exports = router;