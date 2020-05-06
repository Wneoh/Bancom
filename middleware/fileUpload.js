var multer = require('multer');
const validate = require('./validateInput');


/*
* Define storage and rule for uploading files
*/
const checkFile = (file_attr) => { 
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/images/products/')
        },
        filename: function (req, file, cb) {
            cb(null, "UploadedOn" + Date.now() + "fileOrigName" + file.originalname)
        }
    })
    const fileFilter = (req, file, cb) => {
        console.log(req);
        var err_message="";
        const title = req.body.product_name;
        const imageUrl = "images/products/UploadedOn" + Date.now() + "fileOrigName" + file.originalname;
        const price = req.body.product_price;
        const brand = req.body.product_brand;
        const description = req.body.product_description;
        const catagory = req.body.product_catagory;
        var err_message =validate.validateFile(title,imageUrl,price,brand,description,catagory);
        if (err_message.length !== 0) {
            cb(new Error(err_message));
            return
        }
        if (
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(new Error("File format should be PNG,JPG,JPEG")); // if validation failed then generate error
            return
        }
    };
    var upload = multer({ storage: storage , fileFilter: fileFilter}).single(file_attr);
    return upload;
}

exports.checkFile = checkFile;