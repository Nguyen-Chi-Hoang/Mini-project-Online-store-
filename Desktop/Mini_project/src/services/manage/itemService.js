const Item = require('../../models/Item');
const generateBarcode = require('../../services/generateBarcode');
const Category = require('../../models/Category');
const Imagehander = require('../../services/Imagehander');

async function createItem(req, res) {
    const { name, purchasePrice, weight, description, category_type, importPrice, inventoryQuantity } = req.body;

    const newItem = new Item({
        name,
        purchasePrice,  
        weight, 
        salePrice: purchasePrice,
        description,
        category_type,
        importPrice,
        inventoryQuantity
    });
    
    // Generate the barcode image
    newItem.barcode = await generateBarcode(newItem.name);
    if (req.file) {
        newItem.image = req.file.path;
    }

    // Save the Item to the database
    await newItem.save();
    res.redirect(`/manage/item`);
}

//update item function
async function updateitem(req, res) {
    const itemId = req.params.itemId;
    const findResult = await Item.findOne({ _id: itemId });

    //update item
    const {name, description, purchasePrice, weight, category_type} = req.body;
    const updateFields = {
        name, 
        description,
        purchasePrice,
        weight,
        category_type,
        updateAt: Date.now()
    }
    //update barcode
    updateFields.barcode = await generateBarcode(updateFields.name);
    if (req.file) {
        //remove picture from folder item_images
        Imagehander.removeImage(findResult.image, res);
        //add another item image
        updateFields.image = req.file.path;
        
    }
    await Item.updateOne(
        { _id: itemId },
        { $set: updateFields }
    );
    res.redirect(`/manage/item`);
}
//get input value of item
async function routeToUpdateItemPage(req, res) {
    const itemId = req.params.itemId;

    const categoryList = await Category.find();
    const listItem = await Item.findOne({_id: itemId});
    res.render('manage/item/updateItem', {item: listItem, categories: categoryList});
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

module.exports = {createItem, updateitem, routeToUpdateItemPage, deleteItem}