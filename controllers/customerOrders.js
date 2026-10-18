const Order=require('../models/order');
const User=require('../models/user');
exports.list=async(req,res,next)=>{
 try{
  const total=await Order.countDocuments({});
  const pages=Math.max(1,Math.ceil(total/12));
  const page=Math.min(pages,Math.max(1,parseInt(req.query.page,10)||1));
  const orders=await Order.find({}).sort({_id:-1}).skip((page-1)*12).limit(12);
  const customers=await User.find({_id:{$in:orders.map(order=>order.user.userId)}}).select('email').lean();
  const customerEmails=Object.fromEntries(customers.map(customer=>[customer._id.toString(),customer.email]));
  res.render('customer-orders',{title:'Customer orders',orders,customerEmails,total,page,pages,loggedIn:true,role:req.user.role,user:req.user,csrfToken:req.csrfToken()});
 }catch(error){next(error);}
};
