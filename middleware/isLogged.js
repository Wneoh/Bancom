
exports.checkAuth = function(req, res, next) {
    if (!req.session.user) {
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