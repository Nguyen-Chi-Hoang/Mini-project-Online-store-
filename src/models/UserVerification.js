const mongoose = require('mongoose');
const { Schema, model} = mongoose;

const UserVertificationSchema = new Schema({
    userId: String,
    createdAt: Date,
});

module.exports = mongoose.model('UserVertification', UserVertificationSchema);