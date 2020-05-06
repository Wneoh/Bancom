const Product = require('../models/product');

exports.getIndex =(req,res,next)=>{
    Product.fetchAll()
    .then(products =>{
        //console.log(products);
        res.render('Index',{
        title:"Home",
        slide_hero:["/images/apple.jpg","/images/controller.jpg","/images/apple1.jpg","/images/mobile.jpg"],
        products:products,
        csrfToken: req.csrfToken()
        })
    })
    
}


exports.getProductDetail = (req,res,next)=>{
    var pid = req.query.pid;
    console.log(pid);
    Product.findbyId(pid).then(
        product=>{
            console.log(product);
            res.render('pdetail',{
                title: "Product Detail",
                edit:false,
                product:product,
        }
    ) 
    })
}
