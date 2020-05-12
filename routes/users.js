var express = require('express');
var router = express.Router();
var validator = require('../middleware/validate')
var authcontroller = require('../controllers/auth/auth')
var csrf = require('csurf')
var logged = require('../middleware/isLogged');
var bodyParser = require('body-parser');
var multerFileUpload = require('../middleware/fileUpload')
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: true }) 
var router = express.Router();

/* Auth */


router.get('/login',csrfProtection, authcontroller.getLogin);
router.get('/signup',csrfProtection, authcontroller.getSignup);


router.post('/signup',parseForm,csrfProtection,validator.signUp, authcontroller.postSignup)
router.post('/login',parseForm,csrfProtection,validator.loggedIn,authcontroller.postLogin)
router.post('/logout',parseForm,csrfProtection, authcontroller.postLogOut)

router.post('/resetPassword',csrfProtection,parseForm,authcontroller.postResetPassword)
router.get('/resetPassword',csrfProtection,authcontroller.getResetPassword)
router.get('/resetPassword/:token',csrfProtection,authcontroller.getNewPassword)

router.post('/newPassword',csrfProtection,parseForm,authcontroller.postNewPassword);


module.exports = router;
