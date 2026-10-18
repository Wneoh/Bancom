const multer=require('multer');
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:2*1024*1024,files:1,fields:12,fieldSize:1024},fileFilter:(req,file,done)=>{if(!['image/png','image/jpeg'].includes(file.mimetype))return done(new Error('Unsupported photo type'));done(null,true);}}).single('avatar');
module.exports=(req,res,next)=>upload(req,res,error=>{if(error)req.uploadError='Choose one JPG or PNG photo no larger than 2 MB.';next();});
