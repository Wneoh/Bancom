/* GET Login Page. */
exports.getLogin=(req,res,next)=>{    
        res.render('login',{
        title:"Login",
        csrfToken: req.csrfToken()
        })   
  }