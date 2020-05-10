const { body ,  validationResult} = require('express-validator');
const fileHelper = require('../util/fileHelper');
const Product = require('../models/product');

exports.addProduct =[
  body('product_name').isLength({ min: 5 }).withMessage('Product name must be at least 5 chars').isLength({max:50}).withMessage('Product name must not exceed 50 chars').exists().withMessage('Product name is required').trim(),
  body('product_catagory').exists().withMessage('Produxt Catagory is required').isString().withMessage('Product Catagory need to be a string'),
  body('product_brand').isLength({min:1}).withMessage('Product brand must be at least 1 char').isLength({max:50}).withMessage('Product brand must not exceed 50 chars').exists().withMessage('Product brand is required.').trim(),
  body('product_price').isInt({ lt: 10000 }).withMessage('Product price must not numbers and not exceed 10k').exists().withMessage('Product price is required.').trim(),
  body('product_description').isLength({min:20}).withMessage('Product description must be at least 20 chars').isLength({max:1000}).withMessage('Product description must not exceed 1000 chars').exists().withMessage('Product Description is required.'),
  body('product_specs').isLength({min:20}).withMessage('Product specs must be at least 20 char').isLength({max:1000}).withMessage('Product specs must not exceed 1000 chars').exists().withMessage('Product specs is required.'),
  (req, res,next) => {
    var errorValidation = validationResult(req);
    var err_msg='';    
    var files = req.files;       
    if (!errorValidation.isEmpty()) { // is there is error 
      errorValidation = errorValidation.array();
      console.log("here");
      filesArr = [];
      Object.keys(files).map(function (key, index) { // map files object into array
        filesArr.push(files[index]);
      });
      for(var i=0;i<filesArr.length;i++){
        fileHelper.deleteFile(filesArr[i].path); // delete the files if validation does not passed
      }
      for(var i=0; i< errorValidation.length;i++){
        err_msg = err_msg + errorValidation[i].msg+"\n"; // get all error messages
      }
      pname = req.body.product_name;
      pdescription = req.body.product_description;
      pprice = req.body.product_price;
      pbrand = req.body.product_brand;
      pcatagory = req.body.product_catagory;
      pspecs = req.body.product_specs;
      const product = new Product({
        name: pname,
        image: null,
        description: pdescription,
        brand: pbrand,
        price: pprice,
        catagory: pcatagory,
        specs: pspecs,
      });
        // then return to view with errors
        return res.status(422).json(
          res.render('add_product', {
            title: 'Add Product',
            error: err_msg,
            product:product,
            csrfToken: req.csrfToken()
          })
        );
    }
    next(); // if all things are good at the form, go to controller.
  }
]

