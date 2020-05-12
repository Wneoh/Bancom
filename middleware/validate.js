const { body ,  validationResult} = require('express-validator');
const fileHelper = require('../util/fileHelper');
const Product = require('../models/product');

// validate add product
exports.addProduct =[
  body('product_name').isLength({ min: 5 }).withMessage('Product name must be at least 5 chars').isLength({max:50}).withMessage('Product name must not exceed 50 chars').notEmpty().withMessage('Product name is required').trim(),
  body('product_catagory').exists().withMessage('Produxt Catagory is required').isString().withMessage('Product Catagory need to be a string'),
  body('product_brand').isLength({min:1}).withMessage('Product brand must be at least 1 char').isLength({max:50}).withMessage('Product brand must not exceed 50 chars').notEmpty().withMessage('Product brand is required.').trim(),
  body('product_price').isFloat({ min:1,max: 20000 }).withMessage('Product price must be numbers and not exceed 20k').exists().withMessage('Product price is required.').trim(),
  body('product_description').isLength({min:20}).withMessage('Product description must be at least 20 chars').isLength({max:2000}).withMessage('Product description must not exceed 2000 chars').notEmpty().withMessage('Product Description is required.'),
  body('product_specs').isLength({min:20}).withMessage('Product specs must be at least 20 char').isLength({max:2000}).withMessage('Product specs must not exceed 2000 chars').notEmpty().withMessage('Product specs is required.'),
  (req, res,next) => {
    var errorValidation = validationResult(req);
    var err_msg='';    
    var files = req.files;       
    if (!errorValidation.isEmpty()) { // is there is error 
      errorValidation = errorValidation.array();
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
            csrfToken: req.csrfToken(),
            role:req.session.role,
            loggedIn: req.session.loggedIn
          })
        );
    }
    next(); // if all things are good at the form, go to controller.
  }
]

// validate edit products
exports.editProduct =[
  body('product_name').isLength({ min: 5 }).withMessage('Product name must be at least 5 chars').isLength({max:50}).withMessage('Product name must not exceed 50 chars').notEmpty().withMessage('Product name is required').trim(),
  body('product_catagory').exists().withMessage('Produxt Catagory is required').isString().withMessage('Product Catagory need to be a string'),
  body('product_brand').isLength({min:1}).withMessage('Product brand must be at least 1 char').isLength({max:50}).withMessage('Product brand must not exceed 50 chars').notEmpty().withMessage('Product brand is required.').trim(),
  body('product_price').isFloat({ min:1,max: 20000 }).withMessage('Product price must be numbers and not exceed 20k').exists().withMessage('Product price is required.').trim(),
  body('product_description').isLength({min:20}).withMessage('Product description must be at least 20 chars').isLength({max:2000}).withMessage('Product description must not exceed 2000 chars').notEmpty().withMessage('Product Description is required.'),
  body('product_specs').isLength({min:20}).withMessage('Product specs must be at least 20 char').isLength({max:2000}).withMessage('Product specs must not exceed 2000 chars').notEmpty().withMessage('Product specs is required.'),
  (req, res,next) => {
    var errorValidation = validationResult(req);
    var err_msg='';    
    var files = req.files;       
    if (!errorValidation.isEmpty()) { // is there is error 
      errorValidation = errorValidation.array();
      //filesArr = [];
      //Object.keys(files).map(function (key, index) { // map files object into array
      //  filesArr.push(files[index]);
      //});
      // for(var i=0;i<filesArr.length;i++){
      //   fileHelper.deleteFile(filesArr[i].path); // delete the files if validation does not passed
      // }
      for(var i=0; i< errorValidation.length;i++){
        err_msg = err_msg + errorValidation[i].msg+"\n"; // get all error messages
      }
      pId = req.body.pId;
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
          res.render('edit_product', {
            title: 'Edit Product',
            error: err_msg,
            product:product,
            pId:pId,
            csrfToken: req.csrfToken(),
            role:req.session.role,
            loggedIn: req.session.loggedIn,
            user: req.session.user
          })
        );
    }
    next(); // if all things are good at the form, go to controller.
  }
]

exports.loggedIn =[
  body('user_email').isEmail().withMessage('Please enter a valid email').notEmpty().withMessage('Email is required.').trim(),
  body('user_password').isLength({min:6}).withMessage('Password must contain at least 6 chars').isLength({max:20}).withMessage('Password must not exceed 20 chars').notEmpty().withMessage('Password is required.'),
  (req, res,next) => {
    var errorValidation = validationResult(req);
    var err_msg='';     
    if (!errorValidation.isEmpty()) { // is there is error 
      errorValidation = errorValidation.array();
      for(var i=0; i< errorValidation.length;i++){
        err_msg = err_msg + errorValidation[i].msg+"\n"; // get all error messages
      }
      user_email = req.body.user_email;
        // then return to view with errors
        return res.status(422).json(
          res.render('auth/login', {
            title: 'Login',
            error: err_msg,
            old_email:user_email,
            csrfToken: req.csrfToken(),
            role:req.session.role,
            loggedIn: req.session.loggedIn,
            user: req.session.user
          })
        );
    }
    next(); // if all things are good at the form, go to controller.
  }
]

exports.signUp =[
  body('user_name').isLength({min:3 , max:10}).withMessage('Username must be at least 3 chars and not exceed 10 chars').notEmpty().withMessage('User name is required.').trim(),
  body('user_email').isEmail().withMessage('Please enter a valid email').notEmpty().withMessage('Email is required.').trim(),
  body('user_password').isLength({min:6}).withMessage('Password must contain at least 6 chars').isLength({max:20}).withMessage('Password must not exceed 20 chars').notEmpty().withMessage('Password is required.'),
  body('user_confirmPassword').isLength({min:6}).withMessage('Password must contain at least 6 chars').isLength({max:20}).withMessage('Password must not exceed 20 chars').notEmpty().withMessage('Confirm Password is required.'),
  (req, res,next) => {
    var err_msg='';
    var errorValidation = validationResult(req);
    if(req.body.user_password!==req.body.user_confirmPassword){
      errorValidation.errors.push({
         value: req.body.user_confirmPassword,
         msg:"Password does not match",
         param: "user_confirmPassword",
         location: "body"
      });
    }
    if (!errorValidation.isEmpty()) { // is there is error 
      errorValidation = errorValidation.array();
      for(var i=0; i< errorValidation.length;i++){
        err_msg = err_msg + errorValidation[i].msg+"\n"; // get all error messages
      }
      user_email = req.body.user_email;
      user_name = req.body.user_name;
        // then return to view with errors
        return res.status(422).json(
          res.render('auth/signup', {
            title: 'Sign Up',
            error: err_msg,
            old_email:user_email,
            old_username:user_name,
            csrfToken: req.csrfToken(),
            loggedIn: req.session.loggedIn,
            user: req.session.user
          })
        );
    }
    next(); // if all things are good at the form, go to controller.
  }
]

