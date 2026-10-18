const simulatedPayment=require('../services/simulatedPayment');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
var dateFormat = require('dateformat');

const ITEMS_PER_PAGE =12;
exports.getIndex = async (req, res, next) => {
    try {
        const categories = ['camera','phone','computer','headphone','gaming','wearable'];
        const category = categories.includes(req.query.catagory) ? req.query.catagory : '';
        const collection = typeof req.query.collection==='string' ? req.query.collection.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase().slice(0,32) : '';
        const collections = await Product.aggregate([{$unwind:'$tags'},{$group:{_id:'$tags',count:{$sum:1}}},{$sort:{_id:1}}]);
        const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0,100) : '';
        const sort = ['price-asc','price-desc','name'].includes(req.query.sort) ? req.query.sort : 'newest';
        const filter = category ? {catagory:category} : {};
        if (collection) filter.tags=collection;
        if (query) {
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [{name: new RegExp(escaped, 'i')}, {brand:new RegExp(escaped, 'i')}];
        }
        const totalProducts = await Product.countDocuments(filter);
        const lastPage = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE));
        const currentPage = Math.min(lastPage, Math.max(1, parseInt(req.query.page,10) || 1));
        const sorting = sort === 'price-asc' ? {price:1,_id:1} : sort === 'price-desc' ? {price:-1,_id:1} : sort === 'name' ? {name:1,_id:1} : {createdAt:-1,_id:-1};
        const products = await Product.find(filter).sort(sorting).skip((currentPage-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
        const hero=await require('../services/heroCarousel').load();
        res.render('index', {hero,title:'Everyday, upgraded',products,category,collection,collections,query,sort,totalProducts,currentPage,lastPage,
            csrfToken:req.csrfToken(),role:req.session.role,loggedIn:req.session.loggedIn,user:req.session.user});
    } catch (error) { next(error); }
};

exports.getProductDetail = (req,res,next)=>{
    var pid = req.query.pid;
    Product.findById(pid).then(
            product=>{
                if(product){
                    res.render('pdetail',{
                        title: "Product Detail",
                        edit:false,
                        product:product,
                        csrfToken: req.csrfToken(),
                        role:req.session.role,
                        loggedIn: req.session.loggedIn,
                        user: req.session.user
    
                    })
                }else{
                    res.render('error',{
                        title: "Error...",
                        message:"Sorry, we could not find your product"
    
                    })
                }
                
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

exports.postCart = async (req,res,next) => {
    try {
        const product = await Product.findById(req.body.pId);
        if (!product) {
            if (req.get('accept')?.includes('application/json')) return res.status(404).json({message:'This product is no longer available.'});
            return res.status(404).render('error',{title:'Product not found',message:'This product is no longer available.'});
        }
        const quantity = Number(req.body.quantity || 1);
        if (!Number.isInteger(quantity) || quantity<1 || quantity>99) return res.status(400).json({message:'Choose a whole quantity from 1 to 99.'});
        // Set the intended total, so repeat submissions cannot accidentally add duplicates.
        const filter = {_id:req.user._id,'cart.items.productId':product._id};
        const updated = await User.updateOne(filter, {$set:{'cart.items.$.quantity':quantity}});
        if (!updated.n) {
            const inserted = await User.updateOne({_id:req.user._id,'cart.items.productId':{$ne:product._id}},{$push:{'cart.items':{productId:product._id,quantity}}});
            if (!inserted.nModified) await User.updateOne(filter,{$set:{'cart.items.$.quantity':quantity}});
        }
        const currentUser = await User.findById(req.user._id);
        const actualQuantity = currentUser.cart.items.find(item=>item.productId.toString()===product.id).quantity;
        if (req.get('accept')?.includes('application/json')) return res.json({message:product.name+' · '+actualQuantity+' in your bag.',quantity:actualQuantity,productId:product.id,cartCount:currentUser.cart.items.reduce((sum,item)=>sum+item.quantity,0)});
        res.redirect('/cart');
    } catch(error) { next(error); }
};

exports.postDeleteCart =(req,res,next)=>{
    const pId = req.body.pId;
    req.user
    .removeFromCart(pId)
    .then(result=>{
        if(result){
            res.redirect('/cart');
        }else{
            res.render('error',{
                title: "Error...",
                message:"Sorry, we could not remove your product from your cart. Please try it again later."

            })
        }
    }).catch(err => console.log(err));
}


exports.postUpdateCart=(req,res,next)=>{
    const pId = req.body.pId;
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return res.status(400).send("Quantity must be a whole number from 1 to 99.");
    req.user
    .updateToCart(pId,quantity)
    .then(result=>{
        if(result){
            res.redirect('/cart');
        }else{
            res.render('error',{
                title: "Error...",
                message:"Sorry, we could not update your cart. Please try it again later."

            })
        }
    }).catch(err => console.log(err));
}



const orderLocals = req => ({csrfToken:req.csrfToken(),role:req.session.role,loggedIn:req.session.loggedIn,user:req.session.user});
exports.getOrder = async (req,res,next) => {
    try {
        const orders = await Order.find({'user.userId':req.user._id}).sort({_id:-1});
        res.render('order',{...orderLocals(req),title:'My orders',orders});
    } catch(error) {next(error);}
};
exports.getOrderConfirmation = async (req,res,next) => {
    try {
        if (!/^[a-f0-9]{24}$/i.test(req.params.id)) return res.status(404).render('error',{title:'Order not found',message:'This order is not available.'});
        const order = await Order.findOne({_id:req.params.id,'user.userId':req.user._id});
        if (!order) return res.status(404).render('error',{title:'Order not found',message:'This order is not available.'});
        res.render('order-confirmation',{...orderLocals(req),title:'Order received',order});
    } catch(error) {next(error);}
};
exports.postOrder = async (req,res,next) => {
    try {
        if(!simulatedPayment.validate(req.body))return res.status(400).send('Select a valid test payment method and result.');
        if(req.body.paymentOutcome==='declined'){req.session.paymentError='Payment declined in the simulation. No order was placed. Your items are unchanged. Choose Approve payment to retry.';return req.session.save(error=>error?next(error):res.redirect('/cart'));}

        const shopper = await User.findById(req.user._id).populate('cart.items.productId');
        const items = shopper.cart.items;
        if (!items.length) return res.status(400).render('error',{title:'Your bag is empty',message:'Add a product to your bag before placing an order.'});
        if (items.some(item=>!item.productId || !Number.isInteger(item.quantity) || item.quantity<1 || item.quantity>99 || !Number.isFinite(item.productId.price) || item.productId.price<0))
            return res.status(400).render('error',{title:'Review your bag',message:'An item is unavailable or has an invalid quantity. Please review your bag.'});
        const products = items.map(item=>({productData:item.productId.toObject(),quantity:item.quantity,subTotal:Math.round(item.productId.price*100)*item.quantity/100}));
        const subtotal = products.reduce((sum,item)=>sum+Math.round(item.subTotal*100),0)/100;
        const shipping = 6, tax = 5;
        const checkoutKey = require('crypto').createHash('sha256').update(JSON.stringify([shopper.id,items.map(item=>[item.id,item.quantity,item.productId.id,item.productId.price])])).digest('hex');
        await Order.init();
        let order;
        try {
            order = await Order.findOneAndUpdate({checkoutKey},{$setOnInsert:{checkoutKey,payment:simulatedPayment.receipt(req.body),delivery:require('../middleware/profileRequired').delivery(req.user),user:{name:shopper.name,userId:shopper._id},products,subtotal,shipping,tax,total:(Math.round(subtotal*100)+1100)/100,orderDate:new Date().toISOString()}},{upsert:true,new:true,setDefaultsOnInsert:true,runValidators:true});
        } catch(error) {
            if(error.code!==11000) throw error;
            order=await Order.findOne({checkoutKey});
        }
        await User.updateOne({_id:shopper._id},{$pull:{'cart.items':{$or:items.map(item=>({_id:item._id,quantity:item.quantity}))}}});
        res.redirect('/order/'+order._id);
    } catch(error) {next(error);}
};

// Quick checkout is separate from the bag and uses a per-review idempotency key.
exports.startQuickCheckout = async (req,res,next) => {
  try {
    const quantity=Number(req.body.quantity);
    if (!require('mongoose').Types.ObjectId.isValid(req.body.pId) || !Number.isInteger(quantity) || quantity<1 || quantity>99) return res.status(400).send('Choose a valid product and quantity from 1 to 99.');
    const product=await Product.findById(req.body.pId);
    if (!product) return res.status(404).send('This product is no longer available.');
    req.session.quickCheckout={productId:product.id,quantity,price:product.price,key:require('crypto').randomBytes(24).toString('hex')};
    req.session.save(error=>error?next(error):res.redirect('/checkout'));
  } catch(error){next(error);}
};
exports.getQuickCheckout = async (req,res,next) => {
  try {
    const draft=req.session.quickCheckout;
    if(!draft)return res.redirect('/');
    const product=await Product.findById(draft.productId);
    if(!product)return res.status(404).send('This product is no longer available.');
    draft.price=product.price;
    res.render('quick-checkout',{title:'Quick checkout',product,draft,subtotal:Math.round(product.price*100)*draft.quantity/100,csrfToken:req.csrfToken(),loggedIn:true,user:req.user,role:req.user.role});
  }catch(error){next(error);}
};
exports.postQuickCheckout = async (req,res,next) => {
  try {
        if(!simulatedPayment.validate(req.body))return res.status(400).send('Select a valid test payment method and result.');
        if(req.body.paymentOutcome==='declined'){req.session.paymentError='Payment declined in the simulation. No order was placed. Your items are unchanged. Choose Approve payment to retry.';return req.session.save(error=>error?next(error):res.redirect('/checkout'));}

    const draft=req.session.quickCheckout;
    if(!draft || req.body.checkoutKey!==draft.key)return res.status(400).send('This checkout has expired. Please start again from the product.');
    const checkoutKey='quick:'+req.user.id+':'+draft.key;
    await Order.init();
    let order=await Order.findOne({checkoutKey});
    if(!order){
      const product=await Product.findById(draft.productId);
      if(!product)return res.status(404).send('This product is no longer available.');
      if(product.price!==draft.price)return res.redirect('/checkout');
      const subtotal=Math.round(product.price*100)*draft.quantity/100;
      const record={checkoutKey,payment:simulatedPayment.receipt(req.body),delivery:require('../middleware/profileRequired').delivery(req.user),user:{name:req.user.name,userId:req.user._id},products:[{productData:product.toObject(),quantity:draft.quantity,subTotal:subtotal}],subtotal,shipping:6,tax:5,total:(Math.round(subtotal*100)+1100)/100,orderDate:new Date().toISOString()};
      try{order=await Order.findOneAndUpdate({checkoutKey},{$setOnInsert:record},{upsert:true,new:true,setDefaultsOnInsert:true,runValidators:true});}
      catch(error){if(error.code!==11000)throw error;order=await Order.findOne({checkoutKey});}
    }
    res.redirect('/order/'+order._id);
  }catch(error){next(error);}
};
