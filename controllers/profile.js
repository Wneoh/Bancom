const User=require('../models/user');
const {complete}=require('../middleware/profileRequired');
function render(req,res,values=req.user,error='',status=200){res.status(status).render('profile',{title:'Your profile',user:req.user,profile:values,error,saved:req.query.saved==='1',required:req.query.required==='1',welcome:req.query.welcome==='1',complete:complete(req.user),loggedIn:true,role:req.user.role,csrfToken:req.csrfToken()});}
exports.get=(req,res)=>render(req,res);
exports.save=async(req,res,next)=>{
 try{
  const text=(key,max)=>typeof req.body[key]==='string'?req.body[key].trim().slice(0,max):'';
  const values={name:text('name',80),phone:text('phone',30),address:{line1:text('line1',150),line2:text('line2',150),city:text('city',80),region:text('region',80),postalCode:text('postalCode',20),country:text('country',80)}};
  let error=req.uploadError || '';
  if(!values.name || !/^[+0-9().\s-]{7,30}$/.test(values.phone) || values.phone.replace(/\D/g,'').length<7 || !['line1','city','postalCode','country'].every(key=>values.address[key]))error='Enter your name, a valid phone number and the required delivery address fields.';
  if(req.file){const b=req.file.buffer;const png=b.length>8 && b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));const jpg=b.length>3 && b[0]===255 && b[1]===216 && b[2]===255;if(!png && !jpg)error='Please choose a valid JPG or PNG photo.';else values.avatar={data:b.toString('base64'),contentType:png?'image/png':'image/jpeg'};}
  if(error)return render(req,res,{...values,email:req.user.email,avatar:req.user.avatar},error,422);
  if(req.body.removeAvatar==='on')values.avatar={data:'',contentType:''};
  await User.updateOne({_id:req.user._id},{$set:values},{runValidators:true});
  req.session.user.name=values.name;
  const destination=['/cart','/checkout'].includes(req.session.profileReturn)?req.session.profileReturn:'/profile?saved=1';
  delete req.session.profileReturn;
  req.session.save(error=>error?next(error):res.redirect(destination));
 }catch(error){next(error);}
};
