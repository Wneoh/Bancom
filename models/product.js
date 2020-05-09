const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    imageUrl:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    brand:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    catagory:{
        type:String,
        required:true,
    },
    specs:{
        type:String,
        required:true,
    }
});

module.exports = mongoose.model('Product',productSchema);