const emailverifyService = require('../emailverifyService');
//mongodb user model
const User = require("../../models/User");
const validator = require('validator');
const Item = require('../../models/Item');
const Category = require('../../models/Category');
const Cart = require("../../models/Cart");

//login a account function
async function loginUser(req, res) {
    const { username, password } = req.body;
    User.findOne({ username, password })
        .then((data) => {
            if(data) {
                //check if user is verified
                if(!data.verified) {
                    res.json({
                        status: "FAILED",
                        message: "Email hasn't been verified yet. Check your inbox",
                    });
                }
                else {
                    res.redirect('/user/customer/'+data._id);
                }
            }
            else {
                return res.status(409).json({
                    status: 'error',
                    message: 'Username or password in not correct'
                })
            }
        })
}

//create new user function
async function createUser(req, res) {
    const { username, email, password, passwordVerity } = req.body;
    const verified = false;
    if(username.length<6){
        return res.status(500).json({
            status: 'error',
            message: 'please enter more than 5 letter in your username'
        })
    }
    if(!validator.isEmail(email)) {
        return res.status(500).json({
            status: 'error',
            message: 'please enter the right format of email'
        })
    }
    if(password.length<6){
        return res.status(500).json({
            status: 'error',
            message: 'please enter more than 5 letter in your pasword',
        });
    }
    if(password !== passwordVerity) {
        return res.status(500).json({
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
        const newUser = new User({ username, email, password, passwordVerity, verified });
        newUser
            .save()
            .then((result) => {
            //handle account verification
            emailverifyService.sendVerificationEmail(result._id, result.email);
            })
            .catch((err) => {
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

// Function to render the user's profile
async function renderPage(req, res) {
    const userId = req.params.userId;
    
    const categoryList = await Category.find({state: true});

    // Extract the category names that have state=true
    const activeCategoryNames = categoryList.map(category => category.category_name);

    // Find items that belong to the active categories
    const itemList = await Item.find({ category_type: { $in: activeCategoryNames } });
  
    // Find user by ID (in a real application, fetch from the database)
    const user = await User.findOne({ _id: userId });
    if (user) {
      // Render the profile view with user data
      res.render('onlineStore/afterlogin/customerpage', {login_info: user, items : itemList, banners: categoryList, userId: userId});
    } else {
      res.status(404).send('User not found');
    }
}

async function renderItemDetailPage(req, res) {
    //find item from itemid from url
    const itemId = req.params.itemId;
    const itemDetail = await Item.findOne({_id: itemId});

    //find user with id from url
    const userId = req.params.userId;
    const user = await User.findOne({ _id: userId });
    if (itemDetail) {
        res.render(`onlineStore/afterlogin/detailItemPage`, {item:itemDetail, login_info: user, userId: userId});
    } else {
        res.status(404).send('Item not found');
    }

}

async function addItemToCart(req, res) {
    const itemId = req.params.itemId;
    const userId = req.params.userId;

    const user = await User.findOne({_id:userId});
    const item = await Item.findOne({_id:itemId});
    const cart = await Cart.findOne({user_name: user.username});

    const quantityValue = +req.body.quantity; // Convert input to number
    const price = item.purchasePrice;
    const total = quantityValue * price;

    //change ordered state
    item.ordered += 1;
    await item.save();

    if(cart) {
        //store new total
        cart.total += total;
        if (!cart.items) {
            cart.items = [];
        }
        //push new item to itemlist
        cart.items.push({
            item_name: item.name,
            imageUrl: item.image,
            number: quantityValue,
            price: price
        });
        await cart.save();
    } else {
        const cartList = new Cart({
            user_name: user.username,
            total: total,
        })
        cartList.items.push({
            item_name: item.name,
            imageUrl: item.image,
            number: quantityValue,
            price: price
        });
        console.log(cartList);
        // Save the updated cart
        await cartList.save();
    }
}

async function gotoCartPage(req, res) {
    //get user identity
    const userId = req.params.userId;
    const user = await User.findOne({_id:userId});
    //get list of cart that user had bought using user.username
    const cart = await Cart.findOne({user_name: user.username});
    res.render('onlineStore/afterlogin/cart.pug', {cartItems: cart.items, total: cart.total, login_info: user, userId: userId});
}

module.exports = {
    createUser,
    loginUser,
    renderPage,
    renderItemDetailPage,
    addItemToCart,
    gotoCartPage
};