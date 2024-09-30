const Category = require('../../models/Category');
const Item = require('../../models/Item');
const Imagehander = require('../../services/Imagehander');

//create new category function
async function createCategory(req, res) {
    try {
        const { category_name, description } = req.body;

        const existingCategory = await Category.findOne({ category_name: category_name });
        if (existingCategory) {
            return res.status(409).json({
                message: 'Category with this name already exists.'
            });
        }
        
        const newCategory = new Category({category_name, description});
        if(req.file) {
            newCategory.bannerUrl = req.file.path;
        } else {
            console.log("can't read file")
        }
        newCategory
        .save()
        .then(() => {
            console.log("new category created");
            res.redirect(`../category`);
        })
    } catch(err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: 'Category with this name already exists.'
            });
        }
    }
}

//update a category function
async function updateCategory(req, res) {
    const { category_name, description, state } = req.body;

    const categoryId = req.params.categoryId;

    //find and fix all item have the category name is updating
    const findResult = await Category.findOne({ _id: categoryId });
    // Check if the category_name has changed
    if(category_name !== findResult.category_name) {
        await Item.updateMany(
            { category_type: findResult.category_name },
            { $set: { category_type: category_name } }
        );
    }
    
    const booleanState = state === 'true';
    const updateFields = {
        category_name,
        description,
        state: booleanState,
        updateAt: Date.now()
    };

    if (req.file) {
        updateFields.bannerUrl = req.file.path;
        
        //remove picture from folder banner_images
        Imagehander.removeImage(findResult.bannerUrl, res);
        
    }

    await Category.updateOne(
        { _id: categoryId },
        { $set: updateFields }
    );
    res.redirect(`/manage/category`);
}

//route to a update category page
async function routeToUpdateCategoryPage(req, res) {
    const categoryId = req.params.categoryId;

    //find username of manager throught managerId
    const managerId = req.session.managerId;

    const category = await Category.findOne({ _id: categoryId });
    if (category) {
      // Render the profile view with category data
      res.render('manage/category/update_category', {category: category, managerId});
    } else {
      res.status(404).send('User not found');
    }
}

async function deleteCategory(req, res) {
    const categoryId = req.params.categoryId;

    try {
        // Find the category by ID
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).send('Category not found');
        }

        // Find all items associated with the category
        const items = await Item.find({ category_type: category.category_name });

        // Check if any item has ordered > 0
        const hasOrderedItems = items.some(item => item.ordered > 0);

        if (hasOrderedItems) {
            console.log("Some items are still ordered");
            return res.redirect(`/manage/category?error=items-ordered`);
        }

        // Remove images associated with items before deleting them
        for (const item of items) {
            if (item.image) {
                Imagehander.removeImage(item.image, res);
            }
            Imagehander.removeImage(item.barcode, res);
        }

        // Delete all items with ordered == 0
        await Item.deleteMany({ category_type: category.category_name, ordered: 0 });

        // Remove the category banner image (if applicable)
        if (category.bannerUrl) {
            Imagehander.removeImage(category.bannerUrl, res);
        }

        // Delete the category
        const deleteResult = await Category.deleteOne({ _id: categoryId });
        if (deleteResult.deletedCount === 0) {
            return res.status(404).send('Category not found');
        }

        res.redirect(`/manage/category?success=category-deleted`);
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).send('Internal server error');
    }
}

async function loadCategory(req, res) {
    //find username of manager throught managerId
    const managerId = req.session.managerId;

    const searchQuery = req.query.search || '';
    const sortField = req.query.sort || 'position';
    const sortOrder = req.query.order === 'desc' ? -1 : 1;
    const selectedState = req.query.state === 'true' ? true : req.query.state === 'false' ? false : "";
    const currentPage = parseInt(req.query.page) || 1;
    const categoriesPerPage = 3;

    let query = {};
    if(selectedState!== "") {
        query.state = selectedState;
    }

    if(searchQuery) {
        query.category_name = new RegExp(searchQuery, 'i');
    }

    const categoryList = await Category.find(query).sort({ [sortField]: sortOrder }).skip((currentPage-1)*categoriesPerPage).limit(categoriesPerPage);

    const totalCategories = await Category.countDocuments(query);
    const totalPages = Math.ceil(totalCategories / categoriesPerPage);

    res.render('manage/category/categories', {categories: categoryList, managerId, selectedState, searchQuery, sortField, sortOrder: req.query.oder || 'asc', currentPage, totalPages});
}

async function loadCategoryCreatePage(req, res) {
    //find username of manager throught managerId
    const managerId = req.session.managerId;

    res.render('manage/category/category_create', {managerId});
}

//export modules
module.exports = {
    createCategory,
    routeToUpdateCategoryPage,
    updateCategory,
    deleteCategory,
    loadCategory,
    loadCategoryCreatePage
}