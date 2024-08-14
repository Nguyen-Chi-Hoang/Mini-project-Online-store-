const express = require('express');
const router = express.Router();
const categoryService = require('../../src/services/manage/categoryService');
const categoryController = require('../../src/controllers/manage/categoryController');
const Imagehander = require('../../src/services/Imagehander')

//category page
router.get('/', categoryController.loadCategory);
//create category page
router.get('/new', (req, res) => res.render('manage/category/category_create'));
// Create a new category
router.post('/new', Imagehander.upload.single('bannerUrl'), categoryController.storeCategory);
//update category page
router.get('/:categoryId/update', categoryService.routeToUpdateCategoryPage);
//update a category
router.post('/:categoryId/update',Imagehander.upload.single('bannerUrl'), categoryController.updateCategory);
//delete a category
router.get('/:categoryId/delete', categoryService.deleteCategory);

module.exports = router;