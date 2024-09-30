const Item = require('../../models/Item');
const Category = require('../../models/Category');
const emailverifyService = require('../emailverifyService');
const User = require("../../models/User");
const validator = require('validator');
const Cart = require("../../models/Cart");
const Voucher = require("../../models/Voucher");
const fs = require('fs');
const Flashsale = require('../../models/Flashsale');

async function onlineStorePageService(req, res) {
    const userId = req.session?.userId;
    const isAuthenticated = req.session?.isAuthenticated;

    // Get all active categories (state: true)
    const activeCategories = await Category.find({ state: true });
    
    // Extract the category names
    const activeCategoryNames = activeCategories.map(category => category.category_name);

    // Find items that belong to active categories
    const items = await Item.find({ category_type: { $in: activeCategoryNames } });

    // Render the store page with items, banners, and session data (if available)
    res.render("onlineStore/default/storepage", {
        items,
        banners: activeCategories,
        userId,
        isAuthenticated
    });
}
 
async function itemDetailPageService_get(req, res) {
    const { itemId } = req.params;
    const isAuthenticated = req.session?.isAuthenticated;

    // Find the item by ID
    const item = await Item.findOne({ _id: itemId });

    if (!item) {
        return res.status(404).send('Item not found');
    }

    // Fetch related items excluding the current item
    const relatedItems = await Item.find({
        category_type: item.category_type,
        _id: { $ne: itemId }
    });

    // Render the item detail page
    res.render('onlineStore/default/detailItemPage', {
        item,
        relatedItems,
        isAuthenticated
    });
}

async function itemPageService(req, res) {
    // Check expiration of flash sales
    await Flashsale.checkExpiration();

    const isAuthenticated = req.session?.isAuthenticated
    
    // Find all categories where state is true
    const activeCategories = await Category.find({ state: true }, 'category_name');
        
    // Extract the category names
    const categoryNames = activeCategories.map(category => category.category_name);
    
    // Find items where category_type matches one of the active categories
    const items = await Item.find({ category_type: { $in: categoryNames } });
    const bannerDir = './public/banner_images';
    fs.readdir(bannerDir, (err, files) => {
        if(err) {
            console.error('Could not list the directory.', err);
            res.status(500).send('Server Error');
        } else {
            const randomBanner = files[Math.floor(Math.random()*files.length)];
            res.render('onlineStore/default/itempage', {banner: `./public/banner_images/${randomBanner}`, items, isAuthenticated});
        }
    })
}

//login a account function
async function loginPageService(req, res) {
    const { username, password } = req.body;

    // Find the user by username and password
    const user = await User.findOne({ username, password });

    if (!user) {
        return res.status(409).json({
            status: 'error',
            message: 'Username or password is not correct'
        });
    }

    // Check if the user's email is verified
    if (!user.verified) {
        return res.status(400).json({
            status: "FAILED",
            message: "Email hasn't been verified yet. Check your inbox."
        });
    }

    // Redirect to the store page with user ID if the login is successful
    res.redirect(`/store-item-id/${user._id}`);
}

//create new user function
async function registerPageService(req, res) {
    const { username, email, password, passwordVerity, phone_number, address } = req.body;
    const verified = false;
    if(username.length<6){
        return res.status(409).json({
            status: 'error',
            message: 'please enter more than 5 letter in your username'
        })
    }
    if(!validator.isEmail(email)) {
        return res.status(409).json({
            status: 'error',
            message: 'please enter the right format of email'
        })
    }
    if(password.length<6){
        return res.status(409).json({
            status: 'error',
            message: 'please enter more than 5 letter in your pasword',
        });
    }
    if(password !== passwordVerity) {
        return res.status(409).json({
            status: 'error',
            message: 'Password do not match'
        })
    }

    const foundUser = await User.findOne({ username });
    if(foundUser) {
        return res.status(409).json({
            status: 'error',
            message: 'Already a user! Please use another username'
        })
    }
    const foundEmail = await User.findOne({ email });
    if(foundEmail) {
        return res.status(409).json({
            status: 'error',
            message: 'Email already used! Please use another email'
        })
    }
    try {
        const newUser = new User({ username, email, password, passwordVerity, verified, phone_number, address });
        newUser
            .save()
            .then((result) => {
            //handle account verification
            emailverifyService.sendVerificationEmail(result._id, result.email, User);
            })
            .catch(() => {
                res.json({
                    status: "FAILED",
                    message: "An error occurred while saving user account!",
                })
            })
        return res.status(201).json("New user created");
    } catch(err) {
        res.status(500).json("Database error:" + err.message);
    }
    res.render('register');
}

async function addItemToCart(req, res) {
    const itemId = req.params.itemId;
    const userId = req.session.userId;
    
    let price = 0;
    const flashSale = await Flashsale.findOne({ itemId });
    const user = await User.findOne({ _id: userId });
    const item = await Item.findOne({ _id: itemId });
    const cart = await Cart.findOne({ user_name: user.username, isPay: false });

    const quantityValue = +req.body.quantity; // Convert input to number
    if(quantityValue>item.inventoryQuantity) {
        return res.status(409).send('item in store is not enough!!!');
    }
    if (!item.isSale) {
        price = item.purchasePrice;
    } else {
        price = ((100 - flashSale.salePercent) * item.purchasePrice / 100);
    }
    const total = quantityValue * price;

    if (cart) {
        let check = false;
        for (const cartItem of cart.items) {
            if (cartItem.item_name === item.name) {
                check = true;
                // Update the quantity and price of the existing item
                cartItem.number += quantityValue;
                cartItem.price = price; // Update the price in case of changes
                cart.total += total; // Update the total cart price
                await cart.save();
                break; // Exit loop once the item is found and updated
            }
        }
        if (!check) {
            // Item not found, add it to the cart
            item.ordered += 1;
            await item.save();
            // Store new total
            cart.total += total;
            if (!cart.items) {
                cart.items = [];
            }
            // Push new item to item list
            cart.items.push({
                item_name: item.name,
                imageUrl: item.image,
                number: quantityValue,
                price: price
            });
            await cart.save();
        }
    } else {
        // Create a new cart if none exists
        item.ordered += 1;
        await item.save();
        const cartList = new Cart({
            user_name: user.username,
            total: total,
        });
        cartList.items.push({
            item_name: item.name,
            imageUrl: item.image,
            number: quantityValue,
            price: price
        });
        // Save the updated cart
        await cartList.save();
    }
    res.redirect(`/item`);
}

async function gotoCartPage(req, res) {
    await Voucher.checkExpiration();
    const applyVoucher = req.query.applyVoucher === 'true';
    const userId = req.session.userId;
    const isAuthenticated = req.session.isAuthenticated;
    const vouchers = await Voucher.find();
    const user = await User.findOne({_id: userId});

    const cart = await Cart.findOne({ user_name: user?.username, isPay: false });

    if (!applyVoucher) {
        req.session.voucherId = "";
        req.session.newTotal = null;
        return res.render('onlineStore/afterlogin/cart.pug', {
            cartItems: cart?.items || [], // Fallback to empty array if cart is null
            total: cart?.total || 0,      // Fallback to 0 if cart is null
            login_info: user,
            userId: userId,
            cartId: cart?._id || null,    // Fallback to null if cart is null
            isAuthenticated,
            vouchers
        });
    } else {
        const code = req.query.voucher || '';
        const voucher = await Voucher.findOne({ code });

        if (!voucher) {
            return res.render('onlineStore/afterlogin/cart', {
                applyVoucher: false, 
                error: 'Invalid voucher code', 
                total: cart?.total?.toFixed(2) || 0, 
                isAuthenticated,
                cartItems: cart?.items || [], // Fallback to empty array if cart is null
                vouchers
            });
        }

        if (!cart) {
            return res.render('onlineStore/afterlogin/cart', {
                applyVoucher: false, 
                error: 'No active cart found', 
                isAuthenticated,
                cartItems: [], // No cart items if cart is null
                vouchers
            });
        }

        const newTotal = ((100 - voucher.discountPercentage) * cart.total / 100).toFixed(2);
        req.session.newTotal = newTotal;
        req.session.voucherId = voucher._id;

        return res.render('onlineStore/afterlogin/cart', {
            applyVoucher: true, 
            newTotal, 
            total: cart.total.toFixed(2), 
            isAuthenticated,
            cartItems: cart.items,
            vouchers
        });
    }
}

async function checkoutService(req, res) {
    const userId = req.session.userId;
    const newTotal = req.session.newTotal;
    const voucherId = req.session.voucherId; // Get voucher ID from session

    // Find the user by ID
    const user = await User.findOne({ _id: userId });
    if (!user) {
        return res.status(404).send('User not found');
    }

    const cart = await Cart.findOne({ user_name: user.username, isPay: false });
    if (!cart) {
        return res.status(404).send('Cart not found');
    }

    for (const cartItem of cart.items) {
        let item = await Item.findOne({ name: cartItem.item_name });
        if (!item) {
            return res.status(404).send(`Item ${cartItem.item_name} not found`);
        }

        if (item.inventoryQuantity === 0) {
            // Remove the out-of-stock item and update cart
            cart.items = cart.items.filter(item => item.item_name !== cartItem.item_name);
            cart.total = cart.items.reduce((acc, item) => acc + item.price * item.number, 0);
            await cart.save();

            // Reduce ordered count for the item
            await Item.updateOne({ name: cartItem.item_name }, { $inc: { ordered: -1 } });
            return res.status(409).send(`${cartItem.item_name} is out of stock`);
        }

        if (item.inventoryQuantity < cartItem.number) {
            // Remove item if inventory is insufficient
            cart.items = cart.items.filter(item => item.item_name !== cartItem.item_name);
            cart.total = cart.items.reduce((acc, item) => acc + item.price * item.number, 0);
            await cart.save();

            // Reduce ordered count for the item
            await Item.updateOne({ name: cartItem.item_name }, { $inc: { ordered: -1 } });
            return res.status(409).send(`${cartItem.item_name} doesn't have enough stock`);
        }
    }

    // Update the cart to mark it as paid, set payDate, and apply voucher if available
    const cartUpdateData = {
        isPay: true,
        payDate: Date.now(), // Set the current date and time
    };

    if (newTotal) {
        cartUpdateData.total = newTotal;
        cartUpdateData.applyVoucher = true;
        cartUpdateData.voucherId = voucherId;
    }

    // Update the cart with the payment information
    await Cart.updateOne(
        { user_name: user.username, isPay: false },
        { $set: cartUpdateData }
    );

    // Iterate over each item in the cart and update inventory
    for (const cartItem of cart.items) {
        await Item.updateOne(
            { name: cartItem.item_name },
            { $inc: { inventoryQuantity: -cartItem.number, ordered: -1 } }
        );

        const item = await Item.findOne({ name: cartItem.item_name });

        // Handle flash sale updates
        if (item.isSale) {
            const flashsale = await Flashsale.findOne({ itemId: item._id });
            if (flashsale && flashsale.remainingQuantity > 0) {
                await Flashsale.updateOne(
                    { _id: flashsale._id },
                    { $inc: { remainingQuantity: -cartItem.number } }
                );

                // Check if flash sale should be removed
                const updatedFlashsale = await Flashsale.findOne({ _id: flashsale._id });
                if (updatedFlashsale.remainingQuantity <= 0) {
                    await Item.updateOne(
                        { _id: item._id },
                        { salePrice: 0, isSale: false }
                    );
                    await Flashsale.deleteOne({ _id: flashsale._id });
                }
            } else {
                console.warn(`No flash sale found or remainingQuantity is 0 for itemId: ${item._id}`);
            }
        }
    }

    // Decrease voucher remainingQuantity if voucher was applied
    if (voucherId) {
        await Voucher.updateOne(
            { _id: voucherId }, 
            { $inc: { remainingQuantity: -1 } }
        );
    }

    res.redirect('/item');
}


async function removeItemFromCartService(req, res) {
    const { itemName } = req.params;
    const userId = req.session.userId;

    const user = await User.findOne({ _id: userId });
    const cart = await Cart.findOne({ user_name: user.username, isPay: false });

    // Filter out the item from the cart's items array
    cart.items = cart.items.filter(item => item.item_name !== itemName);

    // Recalculate the total
    cart.total = cart.items.reduce((acc, item) => acc + item.price * item.number, 0);

    // Save the updated cart
    await cart.save();

    //-1 ordered state
    await Item.updateOne({name: itemName}, {$inc: { ordered: -1 }});
    res.redirect('/cart');
}

module.exports = {
    onlineStorePageService, 
    itemDetailPageService_get,
    itemPageService,
    registerPageService,
    loginPageService,
    addItemToCart,
    gotoCartPage,
    checkoutService,
    removeItemFromCartService
}