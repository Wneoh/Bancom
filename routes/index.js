var express = require('express');
var router = express.Router();
var maincontroller = require('../controllers/main')
var admincontroller = require('../controllers/admin')
var authcontroller = require('../controllers/auth/user')
var csrf = require('csurf')
var bodyParser = require('body-parser');
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false }) 


/* GET home page. */
router.get('/',csrfProtection, maincontroller.getIndex);
router.get('/pDetail',csrfProtection,maincontroller.getProductDetail);
router.get('/addProduct',csrfProtection, admincontroller.getAddProduct);
router.get('/editProduct',csrfProtection,admincontroller.getEditProduct);

router.post('/deleteProduct',parseForm,csrfProtection,admincontroller.postdeleteProduct);
router.post('/editProduct',parseForm,csrfProtection,admincontroller.postEditProduct);
router.post('/addProduct',parseForm,csrfProtection,admincontroller.postProduct);

/* Cart */

router.get('/cart', maincontroller.getCart);
router.post('/cart', maincontroller.postCart);
router.post('/deleteCart',maincontroller.postDeleteCart);
router.post('/updateCart',maincontroller.postUpdateCart);


router.get('/order', maincontroller.getOrder);

router.post('/postOrder',maincontroller.postOrder);

/* Auth */


//router.get('/login',csrfProtection, authcontroller.getLogin);
//router.get('/signup',csrfProtection, authcontroller.getSignup);


//router.post('/signup',parseForm,csrfProtection, authcontroller.postSignup)
//router.post('/logout',parseForm,csrfProtection, authcontroller.postLogOut)

module.exports = router;
