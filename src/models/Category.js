const mongoose = require('mongoose');
const { Schema, model} = mongoose;

const categorySchema = new Schema({
    
    category_name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
    },
    bannerUrl: {
        type: String,
        required: false,
        default: null
    },
    state: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default:() => Date.now()
    },
    updateAt: {
        type: Date,
        default:() => Date.now()
    },
});

module.exports = mongoose.model('categories', categorySchema);