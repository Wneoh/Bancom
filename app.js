var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const mongoose = require('mongoose');
const User = require('./models/user');

var app = express();

// setup route middlewares


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser())


app.use((req,res,next)=>{
  User.findById("5eb5f577da4ab53de48fece4").then(function(user,err){
    if(user){
    req.user = user;
    }else{
      console.log(err);
    }
    next();
  }).catch(err=>console.log(err))
})

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

  // render the error page
  res.status(err.status || 500);
  res.render('error',{
    title:"Unexpected error."
  });
});

mongoose.connect("mongodb+srv://wneoh:wneoh@bananacom0-glvvj.mongodb.net/bancom?retryWrites=true&w=majority", { 
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true 
})
.then(result =>{
  User.findOne().then(user=>{
    if(!user){
      const user = new User({
        name:"wneoh",
        email:"wneoh@test.com",
        cart:{
          items:[]
        }
      });
      user.save();
    }
  })
  app.listen(3000);
})
.catch(err =>{
  console.log(err);
})

module.exports =app;