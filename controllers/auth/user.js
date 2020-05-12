const User =  require('../../models/user');
const bcrypt = require('bcryptjs');

/* GET Login Page. */
exports.getLogin=(req,res,next)=>{    
      res.render('auth/login',{
      title:"Login",
      csrfToken: req.csrfToken(),
      error:'',
      old_email:''
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
                        csrfToken: req.csrfToken()
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
      error:""
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
                        csrfToken: req.csrfToken()
                  })
            }else{
                 bcrypt.compare(password, user.password).then(passwordMatch=>{
                  if(passwordMatch){
                        req.session.isLoggedIn = true;
                        req.session.user =user
                        return req.session.save(result =>{
                              res.redirect('/');
                        })
                  }
                 }).catch(err=>{
                  return res.render('auth/login',{
                        title:"Login",
                        old_email:email,
                        error:"Invalid password or email.",
                        csrfToken: req.csrfToken()
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