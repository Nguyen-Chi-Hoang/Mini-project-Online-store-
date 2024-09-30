//mongo connecttion
const mongoose = require("mongoose");

const connectMongoDB = async () => {
    try {
        mongoose.connect("mongodb+srv://chihoangnguyen2709:hoang2003@cluster0.3ugeoqe.mongodb.net/OnlineStore?retryWrites=true&w=majority&appName=Cluster0");
        console.log('connected to mongoDB');
    } catch(err) {
        console.error('Error connecting to MongoDB: ', err);
    }
}

module.exports = connectMongoDB;