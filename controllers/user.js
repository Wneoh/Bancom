const Product = require('../models/product');
const Order = require('../models/order');
var dateFormat = require('dateformat');

const ITEMS_PER_PAGE =8;
exports.getIndex =(req,res,next)=>{
    all =false;
    if(req.query.page==undefined){
        req.query.page=1;
    }
    if(req.query.catagory =="all"){
        req.session.catagory=null;
        all =true;
    }else{
        req.session.catagory= req.query.catagory
    }
    const page =+req.query.page;
    let totalItems;
    if(req.session.catagory){
        Product.find({catagory:req.session.catagory}).countDocuments().then(numProducts =>{
            totalItems = numProducts;
            return Product.find({catagory:req.session.catagory}).skip((page-1)* ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            
        })
        .then(products =>{
            res.render('index',{
            title:"Bancom",
            slide_hero:["/images/home/apple-home.jpg","/images/home/controller-home.jpg","/images/home/camera-home.jpg","/images/home/phone-home.jpg"],
            products:products,
            csrfToken: req.csrfToken(),
            role:req.session.role,
            loggedIn: req.session.loggedIn,
            catagory:req.session.catagory,
            user: req.session.user,
            totalProducts: totalItems,
            currentPage: page,
            hasNextPage:ITEMS_PER_PAGE *page <totalItems,
            hasPreviousPage: page > 1,
            nextPage: page+1,
            previousPage : page -1,
            lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE),
            all:all
            })
        })
    }else{

        Product.find().countDocuments().then(numProducts =>{
            totalItems = numProducts;
            return Product.find().skip((page-1)* ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            
        })
        .then(products =>{
            res.render('index',{
            title:"Bancom",
            slide_hero:["/images/home/apple-home.jpg","/images/home/controller-home.jpg","/images/home/camera-home.jpg","/images/home/phone-home.jpg"],
            products:products,
            csrfToken: req.csrfToken(),
            role:req.session.role,
            loggedIn: req.session.loggedIn,
            user: req.session.user,
            totalProducts: totalItems,
            catagory:req.body.catagory,
            currentPage: page,
            hasNextPage:ITEMS_PER_PAGE *page <totalItems,
            hasPreviousPage: page > 1,
            nextPage: page+1,
            previousPage : page -1,
            lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE),
            all:all
            })
        })
    }
}


exports.getProductDetail = (req,res,next)=>{
    var pid = req.query.pid;
    Product.findById(pid).then(
        product=>{
            res.render('pdetail',{
                title: "Product Detail",
                edit:false,
                product:product,
                csrfToken: req.csrfToken(),
                role:req.session.role,
                loggedIn: req.session.loggedIn,
                user: req.session.user

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
        for(var i=0;i<products.length;i++){
            if(products[i].productId==null){ // Means admin deleted a product while customer has the item in cart
                console.log("Unexpected Error"); 
                products.splice(i, 1);
                req.user.save();
            }
        }
        var tax = 5.00;
        var shipping =6.00;
        var totalPrice = tax+shipping;
        for(var i =0;i<products.length;i++){
            totalPrice = totalPrice + products[i].productId.price*products[i].quantity;
        }
        var totalSub= totalPrice - tax -shipping;
        // For loop to calculate the price.
        res.render('cart',{
            title: "My Cart",
            products:products,
            csrfToken: req.csrfToken(),
            tax:tax,
            shipping:shipping,
            totalPrice: totalPrice,
            totalSub:totalSub,
            role:req.session.role,
            loggedIn: req.session.loggedIn,
            user: req.session.user

        })
    }).catch(err=>{
        console.log(err)
    })      
}

exports.postCart =(req,res,next)=>{
    const pId = req.body.pId;
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
    Order.find({"user.userId":req.user._id.toString()}).then(result =>{
        const orders = result.map(i =>{
            return { orderId: i._id, product: [...i.products],totalPrice: i.total, orderDate:i.orderDate }
        });
        //console.log(orders);
        orderDate = [];
        if(orders.length!=0){
            for(var i =0;i<orders.length;i++){
                var date=dateFormat(new Date(orders[i].orderDate), "mmmm dS, yyyy, h:MM:ss TT");
                orderDate.push(date);
            }
        }
        res.render('order',{
            title: "My Order",
            tax: 5.00,
            shipping:6.00,
            orders:orders,
            date:orderDate,
            csrfToken: req.csrfToken(),
            role:req.session.role,
            loggedIn: req.session.loggedIn,
            user: req.session.user

        })
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
        var tax = 5.00;
        var shipping =6.00;
        var subTotal = 0;
        var totalPrice = tax+shipping;
        var orderDate = dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");
        for(var i =0;i<products.length;i++){
            subTotal = subTotal + products[i].productData.price*products[i].quantity;
            totalPrice = totalPrice + products[i].productData.price*products[i].quantity;
            Object.assign(products[i], {subTotal: subTotal});
        }
        const order = new Order({
            user:{
                name:req.user.name,
                userId:req.user
            },
            products: products,
            total:totalPrice,
            orderDate: orderDate
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