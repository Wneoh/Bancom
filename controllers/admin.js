const Product = require('../models/product');
let Validator = require('validatorjs');
const file = require('../middleware/fileUpload');
var fs = require('fs');


exports.postProduct =(req,res,next)=>{
     upload = file.checkFile("product_image");
        upload(req, res, function (err) {
        console.log(req.file);
        if(err){
        res.render('add_product',{
            title: 'Add Product',
            error:err,
            csrfToken: req.csrfToken()
        })
        }else{
            const product = new Product(req.body.product_name,"/images/products/"+req.file.filename,req.body.product_description,req.body.product_price,req.body.product_brand.toUpperCase() ,req.body.product_catagory);
              console.log(product);
              product
                .save()
                .then(result =>{
                  console.log('Created Product');
                  res.redirect('/');
                })
                .catch(err =>{
                  console.log(err);
                })
        }
})         
};

exports.getAddProduct =(req,res,next)=>{
  res.render('add_product',{
      title: "Add Product",
      csrfToken: req.csrfToken(),
      error: "",
      
  })
};

exports.getEditProduct =(req,res,next)=>{
    var pid = req.query.pid;
    console.log(pid);
    Product.findbyId(pid).then(
        product=>{
            console.log(product);
            res.render('edit_product',{
                title: "Edit Product",
                pid:pid,
                edit:true,
                error:"",
                product:product,
                csrfToken: req.csrfToken()

        }
    ) 
    })
}

  exports.postEditProduct =(req,res,next)=>{
  var errormsg=[];
  var err_message='';
        const pid = req.body.pid;
        const title = req.body.product_name;
        const price = req.body.product_price;
        const brand= req.body.product_brand;
        const description = req.body.product_description;
        const catagory = req.body.product_catagory;
        const product = new Product(title,req.body.edit_image,description,price,brand.toUpperCase(),catagory, pid);      
        let data = {
            'product_name':title.trim(),
            'product_brand': brand.trim(),
            'product_price': price.trim(),
            'description':description.trim(),
            'catagory':catagory.trim()
        };
        let rules = {
            'product_name': 'min:1|max:40|required',
            'product_brand': 'min:1|max:40|required',
            'product_price':'numeric|required|present|min:1|max:10000',
            'description':'min:10|max:2000|required',
            'catagory':'string|required'
        };
        //console.log(data);
        let validation = new Validator(data, rules);
        validation.passes(); // true
        validation.fails(); // false
        errormsg.push(validation.errors.first('product_name'));
        errormsg.push(validation.errors.first('product_price'));
        errormsg.push(validation.errors.first('product_brand'));
        errormsg.push(validation.errors.first('description'));
        errormsg.push(validation.errors.first('catagory'));
        for(var i=0;i<errormsg.length;i++){
            if(errormsg[i]!=false){
                err_message+=' '+errormsg[i]+'\n';
            }
        }
        if(err_message.length!==0){
          res.render('edit_product',{
            title: "Edit Product",
            edit:true,
            error:err_message,
            product:product,
            pid:pid
         })
        }
    product.save().then(
        result =>{
          console.log(result)
          console.log("updated product");
          res.redirect('/');
        }).catch(err=> console.log(err))
        };


  exports.postdeleteProduct =(req,res,next)=>{
      const pid = req.body.pid;
      Product.deleteById(pid);
      res.redirect('/');
  }