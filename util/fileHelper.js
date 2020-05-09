const fs = require('fs');

const deleteFile = (filePath) =>{
    fs.unlink("public"+filePath,(err)=>{
        if(err){
            throw (err);
        }
    })
}

exports.deleteFile = deleteFile;