const mongoose = require('mongoose');
const { Schema, model} = mongoose;

const itemSchema = new Schema({
    item_name: String,
    imageUrl: String,
    number: Number,
    price: Number,
    addTime: {
        type: Date,
        default:() => Date.now()
    }
  });

const cartSchema = new Schema({
    
    user_name: {
        type: String,
        required: true,
    },
    items: [itemSchema],
    total: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default:() => Date.now()
    }
});

module.exports = mongoose.model('carts', cartSchema);