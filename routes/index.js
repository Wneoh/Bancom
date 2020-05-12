var express = require('express');
var validator = require('../middleware/validate')
var maincontroller = require('../controllers/user')
var admincontroller = require('../controllers/admin')
var csrf = require('csurf')
var logged = require('../middleware/isLogged');
var bodyParser = require('body-parser');
var multerFileUpload = require('../middleware/fileUpload')
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: true }) 
var router = express.Router();


const multerUploadMiddleware = multerFileUpload.upload("product_images");


/* GET home page. */
router.get('/',csrfProtection, maincontroller.getIndex);
router.get('/pDetail',csrfProtection,maincontroller.getProductDetail);
router.get('/addProduct',logged.checkAuth,logged.checkAdmin,csrfProtection, admincontroller.getAddProduct);
router.get('/editProduct',logged.checkAuth,logged.checkAdmin,csrfProtection,admincontroller.getEditProduct);

router.post('/deleteProduct',logged.checkAuth,logged.checkAdmin,parseForm,csrfProtection,admincontroller.postdeleteProduct);
router.post('/editProduct',logged.checkAuth,logged.checkAdmin,parseForm,csrfProtection,validator.editProduct,admincontroller.postEditProduct);
router.post('/addProduct',logged.checkAuth,logged.checkAdmin,parseForm,csrfProtection,multerUploadMiddleware,validator.addProduct,admincontroller.postProduct);

/* Cart */

router.get('/cart',logged.checkAuth,csrfProtection,maincontroller.getCart);
router.post('/cart',logged.checkAuth,parseForm,csrfProtection, maincontroller.postCart);
router.post('/deleteCart',logged.checkAuth,parseForm,csrfProtection,maincontroller.postDeleteCart);
router.post('/updateCart',logged.checkAuth,parseForm,csrfProtection,maincontroller.postUpdateCart);


router.get('/order',csrfProtection,logged.checkAuth,maincontroller.getOrder);

router.post('/postOrder',csrfProtection,logged.checkAuth,maincontroller.postOrder);


module.exports = router;
