const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role: {
        type: String,
        enum : ['user','admin'],
        default: 'user'
    },
    resetToken: String,
    resetTokenExpiration:Date,
    cart:{
        items:[
                {
                    productId:{ 
                        type: mongoose.Schema.ObjectId, require:true , ref: 'Product'
                    },
                    quantity:{
                        type:Number, required:true
                    }
                }
            ]
        }
});

// Add the new product id into User.cart check check if its already exist
userSchema.methods.addToCart = function(product){
    const cartProductIndex = this.cart.items.findIndex(cp=>{
        return cp.productId.toString() === product._id.toString();
    })
    let newQuantity =1;
    const updatedCartItems = [...this.cart.items];
    if(cartProductIndex >=0){
        newQuantity = this.cart.items[cartProductIndex].quantity+1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    }else{
        updatedCartItems.push({productId: new mongoose.Types.ObjectId(product._id),quantity: newQuantity})
    }

    const updatedCart ={
        items:updatedCartItems
    };

    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.removeFromCart = function(pId){
    const updatedCartItems = this.cart.items.filter(item=>{
        return item.productId.toString() !== pId.toString();
    })
    if(updatedCartItems){
        for(var i =0;i<updatedCartItems.length;i++){
            if(updatedCartItems[i]._id.toString() === pId.toString()){
                updatedCartItems.splice(i, 1);
            }
        }
    }
    const updatedCart ={
        items:updatedCartItems
    };
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.updateToCart = function(pId,quantity){
    const updatedCartItems = this.cart.items.filter(item=>{
        return item.productId.toString() !== pId.toString();
    })
    if(updatedCartItems){
        for(var i =0;i<updatedCartItems.length;i++){
            if(updatedCartItems[i]._id.toString() === pId.toString()){
                updatedCartItems[i].quantity=quantity;
            }
        }
    }

    return this.save();

}

userSchema.methods.clearCart = function(){
    this.cart = {item:[]};
    return this.save();
}
module.exports = mongoose.model('User',userSchema);
