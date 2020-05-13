const User =  require('../../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
var nodemailer = require('nodemailer');

/* GET Login Page. */
exports.getLogin=(req,res,next)=>{    
      res.render('auth/login',{
      title:"Login",
      csrfToken: req.csrfToken(),
      error:'',
      old_email:'',
      loggedIn: req.session.loggedIn,
      role:req.session.role,
      })   
}

exports.postSignup=(req,res,next)=>{  
      const name = req.body.user_name;
      const email = req.body.user_email;
      const password = req.body.user_password;
      const confirmPassword = req.body.user_confirmPassword;
      User.findOne({email:email}).then(user=>{
            if(user){
                  return res.render('auth/signup',{
                        title:"Sign Up",
                        old_username:name,
                        old_email:"",
                        error:"Error : Email has been taken",
                        csrfToken: req.csrfToken(),
                        loggedIn: req.session.loggedIn,
                        role:req.session.role,
                  })
            }else{
                  return bcrypt.hash(password,12).then(hashedPassword =>{
                        const user = new User({
                              name:name,
                              email:email,
                              password:hashedPassword,
                              cart:{item:[]}
                        });
                        return user.save();
                  })
            }
      }).then(result =>{
            res.redirect("/login");
      })
      .catch(err=>{
            //console.log(err);
      })
}

exports.getSignup=(req,res,next)=>{    
      res.render('auth/SignUp',{
      title:"Sign Up",
      csrfToken: req.csrfToken(),
      old_email:"",
      old_username:"",
      error:"",
      loggedIn: req.session.loggedIn,
      role:req.session.role,
      })   
}

exports.postLogin=(req,res,next)=>{  
      const email = req.body.user_email;
      const password = req.body.user_password;
      User.findOne({email:email}).then(user=>{
            if(!user){
                  return res.render('auth/login',{
                        title:"Login",
                        old_email:email,
                        error:"Invalid password or email.",
                        csrfToken: req.csrfToken(),
                        loggedIn: req.session.loggedIn,
                        role:req.session.role,
                  })
            }else{
                 bcrypt.compare(password, user.password).then(passwordMatch=>{
                  if(passwordMatch){
                        req.session.loggedIn = true;
                        req.session.user =user
                        req.session.role =user.role
                        return req.session.save(result =>{
                              res.redirect('/');
                        })
                  }
                 }).catch(err=>{
                  return res.render('auth/login',{
                        title:"Login",
                        old_email:email,
                        error:"Invalid password or email.",
                        csrfToken: req.csrfToken(),
                        loggedIn: req.session.loggedIn,
                        role:req.session.role,
                        
                  })  
                 }); 
            }
      });
}

exports.postLogOut=(req,res,next)=>{  
      req.session.destroy( err => {
            console.log(err);
            res.redirect("/");
      });
};

exports.getResetPassword=(req,res,next)=>{  
      res.render('auth/resetPass',{
            title:"Reset Password",
            csrfToken: req.csrfToken(),
            loggedIn: req.session.loggedIn,
            role:req.session.role,
            error:""

      })  
};

exports.postResetPassword=(req,res,next)=>{  
      var resetEmail = req.body.user_email;
      crypto.randomBytes(32,(err,buffer)=>{
            if(err){
                  console.log(err);
                  return res.redirect("auth/resetPassword")
            }
            const token = buffer.toString('hex');
            User.findOne({email:resetEmail}).then(user=>{
                  if(!user){
                        console.log('error','No account with that email found.')
                        return res.redirect('/resetPassword');
                  }
                  user.resetToken = token;
                  user.resetTokenExpiration = Date.now()+3600000;
                  return user.save();
            }).then( result=>{
                  var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                        user: 'bancom96@gmail.com',
                        pass: 'Bancom2020',
                        port:587
                        }
                  });
                  var mailOptions = {
                        from: 'bancom96@gmail.com',
                        to: req.body.user_email,
                        subject: 'Bancom : Password Reset',
                        html: `<p>You have requested for a password reset at Bancom.</p>
                              <p>Please click on this <a href="http://localhost:3000/resetPassword/${token}">link</a> to set up a new password.
                        `
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                        console.log(error);
                        } else {
                        console.log('Email sent: ' + info.response);
                        res.redirect('/');
                        }
                  }); 
            })
            .catch(err=>{
                  console.log(err);
            })
            
})     
};

exports.getNewPassword=(req,res,next)=>{  
      const token =req.params.token;
      User.findOne({resetToken:token, resetTokenExpiration:{$gt: Date.now()}})
      .then(user=>{
            res.render('auth/newPass',{
            title:"New Password",
            csrfToken: req.csrfToken(),
            loggedIn: req.session.loggedIn,
            role:req.session.role,
            error:"",
            userId:user._id.toString(),
            passwordToken: token

            })
      })
      .catch(err=>console.log(err))
     
};

exports.postNewPassword =(req,res,next)=>{
      const newPassword = req.body.user_password;
      const userId = req.body.userId;
      const passwordToken = req.body.passwordToken;
      let resetUser;
      User.findOne({
            resetToken: passwordToken,
            resetTokenExpiration:{ $gt: Date.now()},
            _id: userId
      })
      .then(user=>{
            resetUser =user;
            return bcrypt.hash(newPassword,12);
      }).then(hashedPassword =>{
            console.log(resetUser);
            resetUser.password = hashedPassword;
            resetUser.resetToken =  undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
      }).then(result=>{
            res.redirect('/login')
      })
      .catch(err=>{
            console.log(err);
      })
}