const complete = user => Boolean(user && user.name && user.phone && user.address && ['line1','city','postalCode','country'].every(key=>user.address[key]));
exports.complete=complete;
exports.requireProfile=(req,res,next)=>{
  if(complete(req.user))return next();
  req.session.profileReturn=req.path.includes('checkout')?'/checkout':'/cart';
  req.session.save(error=>error?next(error):res.redirect('/profile?required=1'));
};
exports.delivery=user=>({name:user.name,email:user.email,phone:user.phone,address: user.address.toObject ? user.address.toObject() : user.address});
