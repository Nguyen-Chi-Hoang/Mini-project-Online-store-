const Category = require('../../models/Category');
const Item = require('../../models/Item');
const Imagehander = require('../../services/Imagehander');

//create new category function
async function createCategory(req, res) {
    const { category_name, description } = req.body;
    const newCategory = new Category({category_name, description});
    if(req.file) {
        newCategory.bannerUrl = req.file.path;
    } else {
        console.log("can't read file")
    }
    newCategory
    .save()
    .then((result) => {
        console.log("new category created");
        res.redirect('../../manage/category');
    })
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

    const result = await Category.updateOne(
        { _id: categoryId },
        { $set: updateFields }
    );
    res.redirect(`/manage/category`);
}

//route to a update category page
async function routeToUpdateCategoryPage(req, res) {
    const categoryId = req.params.categoryId;
    const category = await Category.findOne({ _id: categoryId });
    if (category) {
      // Render the profile view with category data
      res.render('manage/category/update_category', {category: category});
    } else {
      res.status(404).send('User not found');
    }
}

//delete category function
async function deleteCategory(req, res) {
    const categoryId = req.params.categoryId;
    const findResult = await Category.findOne({ _id: categoryId });
    //remove picture from folder banner_images
    Imagehander.removeImage(findResult.bannerUrl, res);

    //delete record from database
    try {
        const result = await Category.deleteOne({ _id: categoryId });

        if (result.deletedCount <= 0) {
            res.status(404).send('Category not found');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).send('Internal server error');
    }
    res.redirect(`/manage/category`);
}

//export modules
module.exports = {
    createCategory,
    routeToUpdateCategoryPage,
    updateCategory,
    deleteCategory
}