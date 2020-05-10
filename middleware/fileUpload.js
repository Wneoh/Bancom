var multer = require('multer');
const Product = require('../models/product');



function makeMulterUploadMiddleware(multerUploadFunction) {
    return (req, res, next) =>
        multerUploadFunction(req, res, err => {
            // handle Multer error
            pname = req.body.product_name;
            pdescription = req.body.product_description;
            pprice = req.body.product_price;
            pbrand = req.body.product_brand;
            pcatagory = req.body.product_catagory;
            pspecs = req.body.product_specs;
            const product = new Product({
                name: pname,
                image: null,
                description: pdescription,
                brand: pbrand,
                price: pprice,
                catagory: pcatagory,
                specs: pspecs,
            })
            if (err instanceof multer.MulterError){
                err_msg ="Only 3 images are allowed"
                    return res.status(500).json(
                        res.render('add_product', {
                          title: 'Add Product',
                          error: err_msg,
                          product:product,
                          csrfToken: req.csrfToken()
                        })
                )
            }
            // handle other errors
            if (err) {
                err_msg ="Something wrong has occured, please report errors."
                    return res.status(500).json(
                        res.render('add_product', {
                          title: 'Add Product',
                          error: err_msg,
                          product:product,
                          csrfToken: req.csrfToken()
                        })
                )
            }

            next();
        });
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/products/')
    },
    filename: function (req, file, cb) {
        cb(null, "UploadedOn" + Date.now() + "fileOrigName" + file.originalname)
    }
})
const fileFilter = (req, files, cb) => {
    if (
        files.mimetype === "image/png" ||
        files.mimetype === "image/jpg" ||
        files.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(new Error(" All images format should be PNG,JPG,JPEG")); // if validation failed then generate error
        return
    }
};
var upload = multer({ storage: storage , fileFilter: fileFilter ,limits: {
    fieldSize:  2 * 1024 * 1024  // 2 MB (max file size)
}})

module.exports.upload = function(filename) {
    return makeMulterUploadMiddleware(upload.array(filename,3));
}
