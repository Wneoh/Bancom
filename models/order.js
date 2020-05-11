const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products:[{
        productData: {type: Object, required:true},
        quantity: {type:Number, required:true},
        subTotal:{type:Number,required:true}

    }],
    user:{
        name:{
            type:String,
            require:true
        },
        userId:{
            type: Schema.Types.ObjectId,
            required: true,
            ref:'User'
        }
    },
    total:{
        type:Number,
        required:true
    },
    orderDate:{
        type:String,
        require:true
    }

});

module.exports = mongoose.model('Order',orderSchema);