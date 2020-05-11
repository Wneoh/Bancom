var express = require('express');
var validator = require('../middleware/validate')
var maincontroller = require('../controllers/main')
var admincontroller = require('../controllers/admin')
var authcontroller = require('../controllers/auth/user')
var csrf = require('csurf')
var bodyParser = require('body-parser');
var multerFileUpload = require('../middleware/fileUpload')
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: true }) 
var router = express.Router();


const multerUploadMiddleware = multerFileUpload.upload("product_images");


/* GET home page. */
router.get('/',csrfProtection, maincontroller.getIndex);
router.get('/pDetail',csrfProtection,maincontroller.getProductDetail);
router.get('/addProduct',csrfProtection, admincontroller.getAddProduct);
router.get('/editProduct',csrfProtection,admincontroller.getEditProduct);

router.post('/deleteProduct',parseForm,csrfProtection,admincontroller.postdeleteProduct);
router.post('/editProduct',parseForm,csrfProtection,validator.editProduct,admincontroller.postEditProduct);
router.post('/addProduct',parseForm,csrfProtection,multerUploadMiddleware,validator.addProduct,admincontroller.postProduct);

/* Cart */

router.get('/cart', csrfProtection,maincontroller.getCart);
router.post('/cart',parseForm,csrfProtection, maincontroller.postCart);
router.post('/deleteCart',parseForm,csrfProtection,maincontroller.postDeleteCart);
router.post('/updateCart',parseForm,csrfProtection,maincontroller.postUpdateCart);


router.get('/order', maincontroller.getOrder);

router.post('/postOrder',maincontroller.postOrder);

/* Auth */


router.get('/login',csrfProtection, authcontroller.getLogin);
router.get('/signup',csrfProtection, authcontroller.getSignup);


//router.post('/signup',parseForm,csrfProtection, authcontroller.postSignup)
//router.post('/logout',parseForm,csrfProtection, authcontroller.postLogOut)

module.exports = router;
