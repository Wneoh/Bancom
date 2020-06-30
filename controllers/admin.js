const Product = require('../models/product');
const fileHelper = require('../util/fileHelper');

exports.postProduct = (req, res, next) => {
  pname = req.body.product_name;
  pdescription = req.body.product_description;
  pprice = req.body.product_price;
  pbrand = req.body.product_brand;
  pcatagory = req.body.product_catagory;
  pspecs = req.body.product_specs;
  // get images and convert into binary to upload to database
  var files = req.files;
  filesArr = [];
  Object.keys(files).map(function (key, index) { // map files object into array
    filesArr.push(files[index]);
  });
  var images = [];
  function save(index) {
    var image = { name: filesArr[index].filename, data: fileHelper.encodeImage(filesArr[index].path), contentType: filesArr[index].mimetype }
    images.push(image);
    fileHelper.deleteFile(filesArr[index].path); // delete once upload into db
  }
  // go through each array json to save it Image object
  for (var i = 0; i < filesArr.length; i++) {
    save(i);
  }
  const product = new Product({
    name: pname,
    image: images,
    description: pdescription,
    brand: pbrand,
    price: pprice,
    catagory: pcatagory,
    specs: pspecs,
  });
  product
    .save()
    .then(result => {
      console.log('Created Product');
      res.redirect('/');
    })
    .catch(err => {
      console.log(err);
    })
};

exports.getAddProduct = (req, res, next) => {
  product = new Product(null);
  res.render('add_product', {
    title: "Add Product",
    csrfToken: req.csrfToken(),
    error: "",
    product: product,
    role:req.session.role,
    loggedIn: req.session.loggedIn,
    user:req.session.user,

  })
};

exports.getEditProduct = (req, res, next) => {
  var pId = req.query.pid;
  Product.findById(pId).then(
    product => {
      res.render('edit_product', {
        title: "Edit Product",
        pId: pId,
        error: "",
        product: product,
        csrfToken: req.csrfToken(),
        role:req.session.role,
        loggedIn: req.session.loggedIn,
        user:req.session.user
      })
    }).catch(err=>{
      console.log(err);
    })
}

exports.postEditProduct = (req, res, next) => {
  const pId = req.body.pId;
  const name = req.body.product_name;
  const price = req.body.product_price;
  const brand = req.body.product_brand.toUpperCase();
  const description = req.body.product_description;
  const catagory = req.body.product_catagory;
  const specs = req.body.product_specs;
  
  const product = new Product({
    name: name,
    image: "",
    description: description,
    brand: brand,
    price: price,
    catagory: catagory,
    specs: specs,
  });

  Product.findOneAndUpdate({_id: pId.toString()}, {$set: 
      { 
        name:name, 
        description: description, 
        brand:brand,
        price:price,
        catagory:catagory,
        specs:specs
      }
      }, {new: true,useFindAndModify: false}, (err, doc) => {
      if (err) {
          res.render('edit_product', {
            title: "Edit Product",
            pId: pId,
            edit: true,
            error: err,
            product: product,
            csrfToken: req.csrfToken(),
            role:req.session.role,
            loggedIn: req.session.loggedIn,
            user:req.user
          })
      }else{
        res.redirect('/');
      }
    })
};


exports.postdeleteProduct = (req, res, next) => {
  const pid = req.body.pid;
  Product.findByIdAndRemove(pid).then((result) => {
    res.redirect('/');
  }).catch(err => console.log(err));

}