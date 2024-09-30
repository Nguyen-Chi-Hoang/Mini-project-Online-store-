const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Voucher schema
const voucherSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 0
    },
    minOrderValue: {
        type: Number,
        required: true,
        min: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalQuantity: {
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
voucherSchema.statics.checkExpiration = async function () {
    const currentDate = new Date();
    await this.deleteMany({
        $or: [{ remainingQuantity: 0 }, { endDate: { $lt: currentDate } }]
    });
};

// Create the Voucher model
module.exports = mongoose.model('vouchers', voucherSchema);
