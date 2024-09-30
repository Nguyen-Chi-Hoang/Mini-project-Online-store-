const mongoose = require('mongoose');
const { Schema, model} = mongoose;

const managerSchema = new Schema({
    
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
    verified: Boolean
});

module.exports = mongoose.model('managers', managerSchema);