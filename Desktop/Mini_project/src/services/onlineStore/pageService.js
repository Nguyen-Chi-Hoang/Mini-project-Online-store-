const Item = require('../../models/Item');
const Category = require('../../models/Category')

async function displayItemCategory(req, res) {
    const categoryList = await Category.find({state: true});
    
    // Extract the category names that have state=true
    const activeCategoryNames = categoryList.map(category => category.category_name);

    // Find items that belong to the active categories
    const itemList = await Item.find({ category_type: { $in: activeCategoryNames } });
    
    res.render("onlineStore/default/storepage", {items : itemList, banners: categoryList});
}
 
async function displayItemDetail(req, res) {
    const itemId = req.params.itemId;
    const itemInfo  = await Item.findOne({ _id: itemId })
    res.render('onlineStore/default/detailItemPage', {item: itemInfo})
}

module.exports = {displayItemCategory, displayItemDetail}