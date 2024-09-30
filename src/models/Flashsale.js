const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Item = require('../models/Item'); // Import the Item model

// Define the Flash Sale schema
const flashSaleSchema = new Schema({
    itemId: {
        type: Schema.Types.ObjectId,
        ref: 'items', // Assuming you have a model for items
        required: true,
    },
    salePercent: {
        type: Number,
        required: true,
        min: 0
    },
    endDate: {
        type: Date,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    remainingQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Static method to check and update expiration status for a voucher
flashSaleSchema.statics.checkExpiration = async function () {
    const currentDate = new Date();
    
    // Find the flash sales that are expired or have zero remaining quantity
    const expiredSales = await this.find({
        $or: [{ remainingQuantity: 0 }, { endDate: { $lt: currentDate } }]
    });
    
    // Iterate over each expired flash sale and update the associated item's state
    for (const sale of expiredSales) {
        await Item.updateOne({ _id: sale.itemId }, { $set: { isSale: false, salePrice: 0 } });
    }
    
    //delete the expired flash sales
    await this.deleteMany({
        $or: [{ remainingQuantity: 0 }, { endDate: { $lt: currentDate } }]
    });
};


// Create the Flash Sale model
module.exports = mongoose.model('flashsales', flashSaleSchema);
