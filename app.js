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

const MONGODB_URI =`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@bananacom0-glvvj.mongodb.net/${process.env.MONGO_DEFAULT_DB}`
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
  secret:'wneoh secret at Bancom',
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
  useCreateIndex: true 
})
.then(result =>{
  app.listen(process.env.PORT || 3000);
})
.catch(err =>{
  console.log(err);
})
module.exports =app;