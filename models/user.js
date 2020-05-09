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
    this.cart = {itme:[]};
    return this.save();
}
module.exports = mongoose.model('User',userSchema);
/*
class User{
    constructor(username, email, password,cart,id){
        this.name = username;
        this.email = email;
        this.password = password;
        this.cart=cart;
        this._id = id;
    }

    save(){
        const db = getDb();
        return db.collection('users').insertOne(this);
    }

    addToCart(product){
        const cartProductIndex = this.cart.item.findIndex(cp=>{
            return cp.productId.toString() === product._id.toString();
        })
        let newQuantity =1;
        const updatedCartItems = [...this.cart.items];
        if(cartProductIndex >=0){
            newQuantity = this.cart.items[cartProductndex].quantity+1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        }else{
            updatedCartItems.push({productId: new ObjectId(product._id),quantity: newQuantity})
        }
        updatedCartItems
        const updatedCart ={items:updatedCartItems}
        const db =getDb();
        return db.collection('users').updateOne({_id: new ObjectId(this._id)},{
            $set:{cart:updatedCart}
        });
    }
    getCart(){
        const db = getDb();
        const productIds = this.cart.items.map(i =>{
            return i.productId;
        })
        return db.collection('products').find({_id: {$in:productIds}}).toArray().then(products =>{
            return products.map(p=>{
                return {...p, quantity: this.cart.items.find( i =>{
                    return i.productId.toString() === p._id.toString();
                }).quantity};
            })
        });
        return this.cart;
    }
    static findUser(email,password){
        email = user.email;
        password = user.pw;
        const db = getDb();
        return db
        .collection('users')
        .findOne({
            "email": email,
            "password":password
        }).then(result=>{
            return result!==null;
        }).catch(err=>{
            console.log(err);
        })
    }
    static checkEmail(checkemail){
        const db = getDb();
            return db.collection('users').findOne({email: checkemail}).then(result=>{
                return result !== null;
            })
    }
    static findOne(pemail){
        const db = getDb();
        return db
        .collection('users')
        .findOne({
            email:pemail
        }).then(result=>{
            return result!==null;
        })
    }
}


module.exports = User;
*/