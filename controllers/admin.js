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
  product = new Product(null, null, null, null, null, null);
  res.render('add_product', {
    title: "Add Product",
    csrfToken: req.csrfToken(),
    error: "",
    product: product

  })
};

exports.getEditProduct = (req, res, next) => {
  var pid = req.query.pid;
  console.log(pid);
  Product.findById(pid).then(
    product => {
      res.render('edit_product', {
        title: "Edit Product",
        pid: pid,
        edit: true,
        error: "",
        product: product,
        csrfToken: req.csrfToken()
      })
    }).catch(err=>{
      console.log(err);
    })
}

exports.postEditProduct = (req, res, next) => {
  var errormsg = [];
  var err_message = '';
  const pid = req.body.pid;
  const name = req.body.product_name;
  const price = req.body.product_price;
  const brand = req.body.product_brand.toUpperCase();
  const description = req.body.product_description;
  const catagory = req.body.product_catagory;
  const specs = req.body.product_specs;
  const product = new Product({
    name: name,
    description: description,
    brand: brand,
    price: price,
    catagory: catagory,
    specs: specs,
  });
  console.log(product);
  let data = {
    'product_name': title.trim(),
    'product_brand': brand.trim(),
    'product_price': price.trim(),
    'description': description.trim(),
    'catagory': catagory.trim()
  };
  let rules = {
    'product_name': 'min:1|max:40|required',
    'product_brand': 'min:1|max:40|required',
    'product_price': 'numeric|required|present|min:1|max:10000',
    'description': 'min:10|max:2000|required',
    'catagory': 'string|required'
  };
  //console.log(data);
  let validation = new Validator(data, rules);
  validation.passes(); // true
  validation.fails(); // false
  errormsg.push(validation.errors.first('product_name'));
  errormsg.push(validation.errors.first('product_price'));
  errormsg.push(validation.errors.first('product_brand'));
  errormsg.push(validation.errors.first('description'));
  errormsg.push(validation.errors.first('catagory'));
  for (var i = 0; i < errormsg.length; i++) {
    if (errormsg[i] != false) {
      err_message += ' ' + errormsg[i] + '\n';
    }
  }
  if (err_message.length !== 0) {
    res.render('edit_product', {
      title: "Edit Product",
      edit: true,
      error: err_message,
      product: product,
      pid: pid,
      csrfToken: req.csrfToken()
    })
  }
  product.save().then(
    result => {
      console.log(result)
      console.log("updated product");
      res.redirect('/');
    }).catch(err => console.log(err))
};


exports.postdeleteProduct = (req, res, next) => {
  const pid = req.body.pid;
  Product.findByIdAndRemove(pid).then((result) => {
    console.log("product deleted");
    console.log(result);
    fileHelper.deleteFile(result.imageUrl);
    res.redirect('/');
  }).catch(err => console.log(err));

}