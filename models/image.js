const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var imageSchema = new Schema({
    images:[{
        name:{
            type: String,
            require: true
        },
        data:{
            type: Buffer,
            require:true
        },
        contentType: {
            type: String,
            require: true
        }
    }]
    
});

module.exports = mongoose.model('Image',imageSchema);