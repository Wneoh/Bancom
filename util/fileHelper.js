const fs = require('fs');

const deleteFile = (filePath) =>{
    fs.unlink(filePath,(err)=>{
        if(err){
            throw (err);
        }
    })
}

function encodeImage(fileName){
    var imageAsBase64 = fs.readFileSync(fileName, 'base64');
    return imageAsBase64;
}

const decodeImages = (filePath) =>{
    fs.readFile('image.jpg', function(err, data) {
        if (err) throw err;
    
        // Decode from base64
        var decodedImage = new Buffer(encodedImage, 'base64').toString('binary');
        });
}

exports.deleteFile = deleteFile;
exports.encodeImage = encodeImage;