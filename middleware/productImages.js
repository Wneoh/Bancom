const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {fileSize: 2 * 1024 * 1024, files: 6, fields: 20, fieldSize: 16384},
  fileFilter(req, file, done) {
    if (!['image/png', 'image/jpeg'].includes(file.mimetype)) return done(new Error('Choose JPG or PNG images.'));
    done(null, true);
  }
}).array('product_images', 6);

module.exports = (req, res, next) => upload(req, res, error => {
  if (error) req.uploadError = 'Choose up to 6 JPG or PNG images, no larger than 2 MB each.';
  next();
});
