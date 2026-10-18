
exports.checkAuth = function(req, res, next) {
    if (!req.session.user) {
      if (req.get('accept')?.includes('application/json')) return res.status(401).json({message:'Please sign in to add items to your bag.'});
      res.redirect('/login');
    } else {
      next();
    }
}

exports.checkAdmin = function(req, res, next) {
  if (req.session.user.role!=="admin") {
    res.redirect('/');
  } else {
    next();
  }
}