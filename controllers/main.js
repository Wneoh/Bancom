const Product = require('../models/product');
const Order = require('../models/order');



exports.getIndex =(req,res,next)=>{
    Product.find()
    .then(products =>{
        //console.log(products);
        res.render('Index',{
        title:"Bancom",
        slide_hero:["/images/home/apple-home.jpg","/images/home/controller-home.jpg","/images/home/camera-home.jpg","/images/home/phone-home.jpg"],
        products:products,
        csrfToken: req.csrfToken()
        })
    })
    
}


exports.getProductDetail = (req,res,next)=>{
    var pid = req.query.pid;
    Product.findById(pid).then(
        product=>{
            console.log(product);
            res.render('pdetail',{
                title: "Product Detail",
                edit:false,
                product:product
            })
    })
    .catch(err=>console.log(err));
}


exports.getCart = (req,res,next)=>{  
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user =>{
        products = user.cart.items;
        console.log(products);
        /* For loop to calculate the price.*/
        // for(var i =0; i<products.length){
        //     product
        // }
        res.render('cart',{
            title: "My Cart",
            products:products
        })
    }).catch(err=>{
        console.log(err)
    })      
}

exports.postCart =(req,res,next)=>{
    const pId = req.body.pId;
    console.log(pId);
    console.log(req.user);
    Product.findById(pId).then(product=>{
        return req.user.addToCart(product);
    }).then(result=>{
        res.redirect('/');
    }).catch(err=>{
        console.log(err);
    })
}

exports.postDeleteCart =(req,res,next)=>{
    const pId = req.body.pId;
    req.user
    .removeFromCart(pId)
    .then(result=>{
        res.redirect('/cart');
    }).catch(err => console.log(err));
}


exports.postUpdateCart=(req,res,next)=>{
    const pId = req.body.pId;
    const quantity = req.body.quantity;
    req.user
    .updateToCart(pId,quantity)
    .then(result=>{
        res.redirect('/cart');
    }).catch(err => console.log(err));
}


exports.getOrder = (req,res,next) =>{
    res.render('order',{
        title: "My Order",
    })
}
exports.postOrder = (req,res,next) =>{
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user =>{
        const products = user.cart.items.map(i =>{
            return {quantity: i.quantity, productData: {...i.productId._doc}}
        });
        console.log(products);
        const order = new Order({
            user:{
                name:req.user.name,
                userId:req.user
            },
            products: products
        })
        return order.save();
    }).then(result =>{
        return req.user.clearCart();
    }).then(result =>{
        res.redirect('/cart');
    }).catch(err =>{
        console.log(err);
    })
}