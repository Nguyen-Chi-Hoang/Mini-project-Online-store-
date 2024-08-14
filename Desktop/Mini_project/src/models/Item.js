const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Item schema
const itemSchema = new Schema({
    name: {
        type: String,
        required: true, // Ensures that name is required
        trim: true // Removes any leading or trailing spaces
    },
    barcode: {
        type: String,
        required: true,
        unique: true, // Ensures that each barcode is unique
        trim: true
    },
    category_type: {
        type: String,
        required: true,
    },
    purchasePrice: {
        type: Number,
        required: true,
        min: 0 // Ensures that the price is non-negative
    },
    importPrice: {
        type: Number,
        required: true,
        min: 0
    },
    salePrice: {
        type: Number,
        required: true,
        min: 0
    },
    inventoryQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    ordered: {
        type: Number,
        required: true,
        default: 0
    },
    weight: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: String,
        trim: true // Path to the image
    },
    description: {
        type: String,
        trim: true // Allows for a detailed description
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set to current date when created
    },
    updatedAt: {
        type: Date,
        default: Date.now // Automatically set to current date when created
    }
});

// Pre-save hook to update the `updatedAt` field
itemSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Create the Item model
module.exports = mongoose.model('items', itemSchema);