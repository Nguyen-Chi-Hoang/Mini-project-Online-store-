//mongo connecttion
const mongoose = require("mongoose");

const connectMongoDB = async () => {
    try {
        mongoose.connect("connect string")
        console.log('connected to mongoDB');
    } catch(err) {
        console.error('Error connecting to MongoDB: ', err);
    }
}

module.exports = connectMongoDB;