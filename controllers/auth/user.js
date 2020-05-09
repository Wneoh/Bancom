const User =  require('../../models/user');
let Validator = require('validatorjs');


/* GET Login Page. */
exports.getLogin=(req,res,next)=>{    
      res.render('auth/login',{
      title:"Login",
      csrfToken: req.csrfToken()
      })   
}

exports.postSignup=(req,res,next)=>{  
      var err_msg="";
      var err = [];
      const name = req.body.user_name;
      const email = req.body.user_email;
      const pw = req.body.user_password;
      let data = {
            'user_name': name.trim(),
            'user_email': email.trim(),
            'user_password': pw.trim()
      };
      let rules = {
            'user_name': 'min:1|max:40|required',
            'user_email': 'min:1|max:40|required',
            'user_password': 'min:1|max:40|required|confirmed'
      }
      let validation = new Validator(data, rules);
      //validation.passes(); // true
      validation.fails(); // false
      err.push(validation.errors.first('user_name'));
      err.push(validation.errors.first('user_email'));
      err.push(validation.errors.first('user_pw'));
      for (var i = 0; i < err.length; i++) {
            if (err[i] != false) {
                err_msg += ' ' + err[i] + '\n';
            }
      }

      User.findOne(email).then(function(res,user){
            if(user){
                  console.log("user has been taken");
                  return res.redirect("/signup");
            }
      }).catch(err=>{
            console.log(err);
      })
      
      if(err_msg!=""){
            res.render('auth/SignUp',{
                  title:"Sign Up",
                  old_name: name,
                  old_email: email,
                  csrfToken: req.csrfToken(), 
                  error:err_msg

            })
            return;
      }
      const user = new User(name,email,pw);
      user.save();
      res.redirect("/login");
}

exports.getSignup=(req,res,next)=>{    
      res.render('auth/SignUp',{
      title:"Sign Up",
      csrfToken: req.csrfToken(),
      old_email:"",
      old_name:"",
      error:""
      })   
}

exports.postLogin=(req,res,next)=>{  
      var err_msg="";
      var err = [];
      const email = req.body.user_email;
      const pw = req.body.user_pw;
      User.findOne({email:email}).then(user=>{
            if(!user){
                  return res.redirec('/login');
            }
      });
}

exports.postLogOut=(req,res,next)=>{  
      req.session.destroy();
      res.redirect("auth/login")
}