const Flashsale = require('../../models/Flashsale');
const Item = require('../../models/Item');
const Category = require('../../models/Category');
const Cart = require("../../models/Cart");
const cron = require('node-cron');

async function flashsalePageController(req, res) {
    await Flashsale.checkExpiration();
    const managerId = req.session.managerId;
    const searchQuery = req.query.search || '';
    const selectedCategory = req.query.category || "";
    const sortField = req.query.sort || 'createdAt'; // Default sorting field
    const sortOrder = req.query.order === 'desc' ? -1 : 1;
    const selectedState = req.query.state === 'true' ? true : req.query.state === 'false' ? false : "";
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = 3;

    let query = {};
    if(selectedState!== "") {
        query.isSale = selectedState;
    }

    if (selectedCategory) {
        query.category_type = selectedCategory;
    }

    // Filter items based on the search query
    if (searchQuery) {
        query.name = new RegExp(searchQuery, 'i');
    }

    const items = await Item.find(query)
        .sort({ [sortField]: sortOrder })
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage);

    // Get total number of items for pagination
    const totalItems = await Item.countDocuments(query);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Retrieve all categories for the dropdown
    const categoryList = await Category.find();


    res.render('manage/flashsale/flashsale', {
        items,
        categories: categoryList,
        selectedCategory,
        selectedState,
        searchQuery,
        managerId,
        currentPage,
        totalPages,
        sortField,
        sortOrder: req.query.order || 'asc'
    });
}

async function renderCreateflashsalePageController(req, res) {
    const itemId = req.params.itemId;
    const item = await Item.findOne({_id:itemId});
    const managerId = req.session.managerId;
    res.render('manage/flashsale/createflashsale', {managerId, itemName: item.name, itemId});
}

async function createflashsaleController(req, res) {
    const itemId = req.params.itemId;
    const { salePercent, endDate, quantity } = req.body;
    const item = await Item.findOne({_id:itemId});
    const salePrice = item.purchasePrice * (100 - salePercent) / 100;

    const newFlashSale = new Flashsale({
        itemId: itemId,
        salePercent,
        endDate,
        quantity,
        remainingQuantity: quantity
    });

    // Check if quantity exceeds inventory
    if (item.inventoryQuantity < quantity) {
        return res.status(400).send('Quantity cannot be greater than item inventory quantity');
    }

    // Save flash sale and update the item's sale status and sale price
    await newFlashSale.save();
    await Item.updateOne({ _id: itemId }, { $set: { isSale: true, salePrice } });

    // Find all unpaid carts
    const carts = await Cart.find({ isPay: false });

    for (const cart of carts) {
        let cartTotal = 0;  // Start fresh total for each cart

        for (const cartItem of cart.items) {
            // Check if the item in the cart is the one that is part of the flash sale
            if (cartItem.item_name === item.name) {
                // Update the cart item to the sale price and mark it as on sale
                cartItem.isSale = true;
                cartItem.price = salePrice;
            }

            // Regardless of the sale, update the total for the entire cart
            cartTotal += cartItem.price * cartItem.number; // Update the total with the (possibly new) price
        }

        // Update the cart's total value
        cart.total = cartTotal;
        console.log(`Updated cart total for cart of user ${cart.user_name}:`, cart.total);

        // Save the updated cart
        await cart.save();
    }

    res.redirect(`/manage/flashsale`);
}

async function renderUpdateflashsalePageController(req, res) {
    const itemId = req.params.itemId;
    const managerId = req.session.managerId;
    const flashsale = await Flashsale.findOne({itemId}).populate('itemId');
    res.render('manage/flashsale/updateflashsale', {flashsale, managerId, itemId});
}

async function updateflashsaleController(req, res) {
    const itemId = req.params.itemId;
    const { salePercent, quantity, endDate } = req.body;

    const existingFlashsale = await Flashsale.findOne({ itemId }).populate('itemId');
    if (!existingFlashsale) {
        return res.status(404).send('Flash sale not found');
    }

    const purchasePrice = existingFlashsale.itemId.purchasePrice;
    const salePrice = purchasePrice * (100 - salePercent) / 100;
    const newRemainingQuantity = existingFlashsale.remainingQuantity + (quantity - existingFlashsale.quantity);

    // Validate inventory quantity
    if (existingFlashsale.itemId.inventoryQuantity < quantity) {
        return res.status(400).send('Quantity cannot be greater than item inventory quantity');
    }

    // Update the flash sale
    const updateFields = {
        salePercent,
        endDate,
        quantity,
        remainingQuantity: newRemainingQuantity
    };

    await Flashsale.updateOne({ itemId }, { $set: updateFields });
    await Item.updateOne({ _id: itemId }, { $set: { salePrice } });

    // Update carts that haven't been paid yet
    const carts = await Cart.find({ isPay: false });
    for (const cart of carts) {
        let cartTotal = 0;

        for (const cartItem of cart.items) {
            // Check if the cart item matches the item in the updated flash sale
            if (cartItem.item_name === existingFlashsale.itemId.name) {
                cartItem.isSale = true;
                cartItem.price = salePrice;
            }

            // Recalculate the total for the entire cart
            cartTotal += cartItem.price * cartItem.number;
        }

        // Update the cart's total value
        cart.total = cartTotal;
        console.log(`Updated cart total for cart of user ${cart.user_name}:`, cart.total);

        // Save the updated cart
        await cart.save();
    }

    res.redirect(`/manage/flashsale`);
}

async function deleteflashsaleController(req, res) {
    const itemId = req.params.itemId;

    // Find the item associated with the flash sale
    const item = await Item.findOne({ _id: itemId });
    if (!item) {
        return res.status(404).send('Item not found');
    }

    // Revert the item back to its original state (no sale)
    await Item.updateOne({ _id: itemId }, { salePrice: 0, isSale: false });

    // Find all carts that are unpaid (isPay: false)
    const carts = await Cart.find({ isPay: false });

    for (const cart of carts) {
        let cartTotal = 0;

        for (const cartItem of cart.items) {
            // Check if the cart item matches the item in the flash sale
            if (cartItem.item_name === item.name) {
                // Revert the price of the cart item to the item's original purchase price
                cartItem.isSale = false;
                cartItem.price = item.purchasePrice;  // assuming you want to reset it to the original price
            }

            // Recalculate the total for the entire cart
            cartTotal += cartItem.price * cartItem.number;
        }

        // Update the cart's total value
         cart.total = cartTotal;
        console.log(`Reverted cart total for user ${cart.user_name}:`, cart.total);

        // Save the updated cart
        await cart.save();
    }
    // Delete the flash sale entry
    await Flashsale.deleteOne({ itemId: itemId });
    res.redirect(`/manage/flashsale`);
}

// Schedule a task to check voucher expiration status every day at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        await Flashsale.checkExpiration();
        console.log('Voucher expiration check completed.');
    } catch (error) {
        console.error('Error checking voucher expiration:', error);
    }
});

module.exports = {
    flashsalePageController,
    renderCreateflashsalePageController,
    createflashsaleController,
    renderUpdateflashsalePageController,
    updateflashsaleController,
    deleteflashsaleController
}