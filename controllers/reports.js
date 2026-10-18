const Order=require('../models/order');
exports.get=async(req,res,next)=>{try{
 const range=['7','30','90','all','custom'].includes(req.query.range)?req.query.range:'30';
 const scope=req.query.scope==='legacy'?'legacy':'paid';
 const now=Date.now(),today=new Date(now+8*3600000).toISOString().slice(0,10);
 const start=['all','custom'].includes(range)?null:new Date(new Date(today+'T00:00:00+08:00').getTime()-(Number(range)-1)*86400000);
 const from=typeof req.query.from==='string'?req.query.from:'';
 const to=typeof req.query.to==='string'?req.query.to:'';
 let filterError='';
 const filter=scope==='paid'?{'payment.mode':'simulation','payment.status':'succeeded'}:{'payment.status':{$ne:'succeeded'}};
 if(start)filter.orderDate={$gte:start.toISOString(),$lte:new Date(now).toISOString()};
 if(range==='custom'){try{filter.orderDate=require('../services/reportPeriod').custom(from,to);}catch(error){filterError=error.message;}}
 const orders=filterError?[]:await Order.find(filter).select('products.productData._id products.productData.name products.productData.catagory products.quantity products.subTotal total subtotal shipping tax user.userId orderDate').lean();
 const report=require('../services/salesReport').summarize(orders);
 const chart=require('../services/reportCharts').build(report,filterError?'30':range,today,from,to);
 res.status(filterError?400:200).render('reports',{title:'Sales reports',report,chart,range,scope,from,to,filterError,loggedIn:true,role:req.user.role,user:req.user,csrfToken:req.csrfToken()});
}catch(error){next(error);}};
