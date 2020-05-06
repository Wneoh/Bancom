let Validator = require('validatorjs');
const Product = require('../models/product');

const validateFile = (title,imageUrl,price,brand,description,catagory) =>{
        var errormsg = [];
        var err_message = "";
        let data = {
            'product_name': title.trim(),
            'image_url': imageUrl.trim(),
            'product_brand': brand.trim(),
            'product_price': price.trim(),
            'description': description,
            'catagory': catagory.trim()
        };
        let rules = {
            'product_name': 'min:1|max:40|required',
            'image_url': 'required',
            'product_brand': 'min:1|max:40|required',
            'product_price': 'numeric|required|present|min:1|max:10000',
            'description': 'min:10|max:3000|required',
            'catagory': 'string|required'
        };
        //console.log(data);
        let validation = new Validator(data, rules);
        validation.passes(); // true
        validation.fails(); // false
        errormsg.push(validation.errors.first('product_name'));
        errormsg.push(validation.errors.first('image_url'));
        errormsg.push(validation.errors.first('product_price'));
        errormsg.push(validation.errors.first('product_brand'));
        errormsg.push(validation.errors.first('description'));
        errormsg.push(validation.errors.first('catagory')); 
        for (var i = 0; i < errormsg.length; i++) {
            if (errormsg[i] != false) {
                err_message += ' ' + errormsg[i] + '\n';
            }
        }
       return err_message;
    }

exports.validateFile = validateFile;