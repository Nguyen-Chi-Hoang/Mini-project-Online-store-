const mongoose = require('mongoose');
const { Schema, model} = mongoose;

const userSchema = new Schema({
    
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    passwordVerity: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default:() => Date.now()
    },
    verified: Boolean,
    phone_number: {
        type: String,
        unique: true,
    },
    address: {
        type: String,
    },
});

module.exports = mongoose.model('users', userSchema);