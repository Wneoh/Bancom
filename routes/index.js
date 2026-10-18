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
const profileRequired=require('../middleware/profileRequired').requireProfile;


const productImages = require('../middleware/productImages');
const saveProduct = require('../controllers/saveProduct');


/* GET home page. */
router.get('/',csrfProtection, maincontroller.getIndex);
router.get('/pDetail',csrfProtection,maincontroller.getProductDetail);
router.get('/addProduct',logged.checkAuth,logged.checkAdmin,csrfProtection, admincontroller.getAddProduct);
router.get('/editProduct',logged.checkAuth,logged.checkAdmin,csrfProtection,admincontroller.getEditProduct);

router.post('/deleteProduct',logged.checkAuth,logged.checkAdmin,parseForm,csrfProtection,admincontroller.postdeleteProduct);
router.post('/editProduct',logged.checkAuth,logged.checkAdmin,parseForm,csrfProtection,productImages,saveProduct.edit);
router.post('/addProduct',logged.checkAuth,logged.checkAdmin,parseForm,csrfProtection,productImages,saveProduct.add);

router.post('/checkout/start',logged.checkAuth,csrfProtection,maincontroller.startQuickCheckout);
router.get('/checkout',logged.checkAuth,csrfProtection,profileRequired,maincontroller.getQuickCheckout);
router.post('/checkout',logged.checkAuth,csrfProtection,profileRequired,maincontroller.postQuickCheckout);
router.get('/admin/orders',logged.checkAuth,(req,res,next)=>{if(req.user?.role!=='admin')return res.status(403).send('Administrator access required.');next();},csrfProtection,require('../controllers/customerOrders').list);
router.get('/admin/reports',logged.checkAuth,(req,res,next)=>{if(req.user?.role!=='admin')return res.status(403).send('Administrator access required.');next();},csrfProtection,require('../controllers/reports').get);
const homepage=require('../controllers/homepage');
const homeAdmin=(req,res,next)=>{if(req.user?.role!=='admin')return res.status(403).send('Administrator access required.');next();};
router.get('/admin/homepage',logged.checkAuth,homeAdmin,csrfProtection,homepage.get);
router.post('/admin/homepage',logged.checkAuth,homeAdmin,csrfProtection,homepage.save);
/* Cart */

router.get('/cart',logged.checkAuth,csrfProtection,maincontroller.getCart);
router.post('/cart',logged.checkAuth,parseForm,csrfProtection, maincontroller.postCart);
router.post('/deleteCart',logged.checkAuth,parseForm,csrfProtection,maincontroller.postDeleteCart);
router.post('/updateCart',logged.checkAuth,parseForm,csrfProtection,maincontroller.postUpdateCart);


router.get('/order/:id',csrfProtection,logged.checkAuth,maincontroller.getOrderConfirmation);
router.get('/order',csrfProtection,logged.checkAuth,maincontroller.getOrder);

router.post('/postOrder',csrfProtection,logged.checkAuth,profileRequired,maincontroller.postOrder);


module.exports = router;
