const mongoose = require('mongoose');
const { Schema, model} = mongoose;

const itemsBuySchema = new Schema({
    item_name: {
        type: String,
    },
    imageUrl: String,
    number: Number,
    price: Number,
    isSale: {
        type: Boolean,
        default: false
    }
  });

const cartSchema = new Schema({
    user_name: {
        type: String,
        required: true,
    },
    items: [itemsBuySchema],
    total: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default:() => Date.now()
    },
    isPay: {
        type: Boolean,
        default: false,
    },
    applyVoucher: {
        type: Boolean,
        default: false
    },
    voucherId: {
        type: String,
        default: ""
    },
    payDate: {
        type: Date,
        default: ""
    }
});

module.exports = mongoose.model('carts', cartSchema);