const Item = require('../../models/Item');
const generateBarcode = require('../../services/generateBarcode');
const Category = require('../../models/Category');
const Imagehander = require('../../services/Imagehander');
const Cart = require('../../models/Cart');
const Flashsale = require('../../models/Flashsale');

//render item page sorting, selecting, finding and paging functions
async function loadItem(req, res) {
    //find username of manager throught managerId
    const managerId = req.session.managerId;
    
    const searchQuery = req.query.search || '';
    const selectedCategory = req.query.category || "";
    const sortField = req.query.sort || 'createdAt'; // Default sorting field
    const sortOrder = req.query.order === 'desc' ? -1 : 1;
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = 3;

    // Construct the query based on the selected category
    let query = {};
    if (selectedCategory) {
        query.category_type = selectedCategory;
    }

    // Filter items based on the search query
    if (searchQuery) {
        query.name = new RegExp(searchQuery, 'i');
    }

    // Find and sort items
    const items = await Item.find(query)
        .sort({ [sortField]: sortOrder })
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage);

    // Get total number of items for pagination
    const totalItems = await Item.countDocuments(query);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Retrieve all categories for the dropdown
    const categoryList = await Category.find();

    // Render the template with paginated items and pagination data
    res.render('manage/item/Item', {
        items,
        categories: categoryList,
        selectedCategory,
        searchQuery,
        managerId,
        currentPage,
        totalPages,
        sortField,
        sortOrder: req.query.order || 'asc' // Pass the sorting order to the template
    });
}

async function loadCreateItemPage(req, res) {
    //find username of manager throught managerId
    const managerId = req.session.managerId;
    
    const categories = await Category.find();
    res.render("manage/item/createItem", {categories, managerId});
}

async function createItem(req, res) {
    const { name, purchasePrice, weight, description, category_type, importPrice, inventoryQuantity } = req.body;

    try {
        // Create the new item instance without saving
        const newItem = new Item({
            name,
            purchasePrice,  
            weight, 
            description,
            category_type,
            importPrice,
            inventoryQuantity
        });

        // Perform validation before proceeding
        await newItem.validate();

        // Generate the barcode image only after validation
        newItem.barcode = await generateBarcode(newItem.name);
        
        // Add the image file path if provided
        if (req.file) {
            newItem.image = req.file.path;
        }

        // Save the Item to the database
        await newItem.save();
        res.redirect(`/manage/item`);

    } catch (error) {
        // Handle duplicate key error (E11000)
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Item with this name or barcode already exists.'
            });
        }

        // Handle validation error for fields like purchasePrice, weight, etc.
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation failed. Ensure that values like price, weight, and inventory are non-negative.',
                error: error.message
            });
        }

        // Generic error handler
        return res.status(500).json({
            message: 'An unexpected error occurred.',
            error: error.message
        });
    }
}

//update item function
async function updateitem(req, res) {
    try {
        const itemId = req.params.itemId;
        const findResult = await Item.findOne({ _id: itemId });

        //update item
        const {name, description, purchasePrice, weight, category_type,importPrice, inventoryQuantity} = req.body;

        // Validate number fields
        if (purchasePrice < 0 || weight < 0 || importPrice <0 || inventoryQuantity < 0) {
            return res.status(400).json({
                message: 'Validation failed. Ensure that values like price, weight, and inventory are non-negative.'
            });
        }
        
        const updateFields = {
            name, 
            description,
            purchasePrice,
            weight,
            inventoryQuantity,
            importPrice,
            category_type,
            updateAt: Date.now()
        }
        let unique = true;
        const items = await Item.find();
        for (const item of items) {
            if(name===item.name)
                unique = false
        }
        //update barcode
        if(unique)
            updateFields.barcode = await generateBarcode(updateFields.name, true, findResult.barcode, res);
        if (req.file) {
            //remove picture from folder item_images
            Imagehander.removeImage(findResult.image, res);
            //add another item image
            updateFields.image = req.file.path;
        }
        const flashsale = await Flashsale.findOne({itemId});
        if(flashsale) {
            const salePrice = purchasePrice*(100-flashsale.salePercent)/100;
            await Item.updateOne(
                { _id: itemId },
                { $set: updateFields, salePrice }
            );
        } else {
            await Item.updateOne(
                { _id: itemId },
                { $set: updateFields }
            );
        }
        
        res.redirect(`/manage/item`);
    } catch(err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: 'Item with this name or barcode already exists.'
            });
        }
    }
}

//get input value of item
async function routeToUpdateItemPage(req, res) {
    const managerId = req.session.managerId;
    const itemId = req.params.itemId;

    const categoryList = await Category.find();
    const listItem = await Item.findOne({_id: itemId});
    res.render(`manage/item/updateItem`, {item: listItem, categories: categoryList, managerId});
}

async function deleteItem(req, res) {
    const itemId = req.params.itemId;
    const findResult = await Item.findOne({ _id: itemId });

    //delete record from database
    if(findResult.ordered==0) {
        //remove picture from folder item_images
        Imagehander.removeImage(findResult.image, res);
        //remove pictue barcode
        Imagehander.removeImage(findResult.barcode, res);
        await Item.deleteOne({ _id: itemId });
    }
    else
        console.log("Item are in cart");
    res.redirect(`/manage/item`);
}

async function listCustomersPage(req, res) {
    const itemId = req.params.itemId;
    const item = await Item.findOne({_id: itemId});

    // Find carts where the item was purchased and payment was made
    const carts = await Cart.find({ 'items.item_name': item.name, isPay: true });

    // Filter the cart's items array to only include the item that matches the name
    const cartsWithFilteredItems = carts.map(cart => {
        const filteredItems = cart.items.filter(i => i.item_name === item.name);
        return { ...cart._doc, items: filteredItems };
    });

    res.render('manage/item/itemUser', { carts: cartsWithFilteredItems });
}

module.exports = {
    createItem, 
    updateitem, 
    routeToUpdateItemPage, 
    deleteItem,
    loadItem,
    loadCreateItemPage,
    listCustomersPage
}