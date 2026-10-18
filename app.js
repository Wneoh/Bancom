var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const mongoose = require('mongoose');
const compression = require('compression')
const User = require('./models/user');
const flash = require('connect-flash');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongodb-session')(session);
var app = express();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bancom';
const store = new MongoDBStore({
  uri:MONGODB_URI,
  collection: 'sessions'
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(flash());
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET || require('crypto').randomBytes(32).toString('hex'),
  resave:false,
  saveUninitialized:false,
  store:store,
}));
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      req.session.role = user.role;
      next();
    })
    .catch(err => 
      console.log(err));
});

app.use((req, res, next) => {
  res.locals.paymentError = req.session.paymentError || '';
  if(req.path==='/cart' || req.path==='/checkout') delete req.session.paymentError;
  res.locals.currentProfile = req.user || null;
  res.locals.profileComplete = require('./middleware/profileRequired').complete(req.user);
  res.locals.bagQuantities = Object.fromEntries(req.user ? req.user.cart.items.map(item=>[item.productId.toString(),item.quantity]) : []);
  res.locals.bagProductIds = req.user ? req.user.cart.items.map(item => item.productId.toString()) : [];
  res.locals.cartCount = req.user ? req.user.cart.items.reduce((sum,item)=>sum+item.quantity,0) : 0;
  next();
});
app.locals.money = value => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return '<span data-myr="'+amount+'">RM '+amount.toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2})+'</span>';
};
app.get('/api/exchange-rates', async (req,res) => {
  res.set('Cache-Control','no-store');
  try { res.json(await require('./services/exchange-rates').getRates()); }
  catch { res.status(503).json({message:'Exchange rates are unavailable. Prices remain in MYR.'}); }
});
app.use(async(req,res,next)=>{try{const appearance=await require('./models/appearance').findById('site').lean();res.locals.siteTheme=appearance?.theme||'forest';res.locals.heroFollowsTheme=appearance?.heroFollowsTheme||false;next();}catch(e){next(e)}});
// setup route middlewares
app.use('/', indexRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  if(err.status ==404){
    res.status(404).render("error",{
      title: "Sorry...",
      message:"We could not found the page you looking for.",
    });
  }else{
    // render the error page
    res.status(err.status || 500);
    res.render('error',{
      title:"Unexpected error."
    });
  }
});
mongoose.connect(MONGODB_URI,{ 
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true ,
  useFindAndModify: false   
})
.then(result =>{
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Bancom is running at http://localhost:${port}`));
})
.catch(err =>{
  console.log(err);
})
module.exports =app;
