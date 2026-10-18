const Product=require('../models/product'),Homepage=require('../models/homepage');
exports.load=async()=>{
 const [products,settings]=await Promise.all([Product.find({}).sort({name:1}).lean(),Homepage.findById('home').lean()]);
 const tags=[...new Set(products.flatMap(p=>p.tags||[]))].sort();
 const categories=[['phone','Phones'],['computer','Computers'],['headphone','Headphones'],['camera','Cameras'],['gaming','Gaming'],['wearable','Wearables']];
 const targets=[...tags.map(tag=>({key:'tag:'+tag,label:tag,href:'/?collection='+encodeURIComponent(tag)+'#catalogue'})),...categories.filter(([key])=>products.some(p=>p.catagory===key)).map(([key,label])=>({key:'category:'+key,label,href:'/?catagory='+key+'#catalogue'}))];
 const belongs=(p,target)=>target.startsWith('tag:')?(p.tags||[]).includes(target.slice(4)):p.catagory===target.slice(9);
 const config=settings||{automatic:true,autoplay:true,interval:6,slides:[]};
 const defaults=targets.filter(t=>tags.length?t.key.startsWith('tag:'):true).slice(0,12).map(t=>({target:t.key,caption:'Discover your next favourite',productId:''}));
 config.content={...require("./heroContent").defaults,...config.content};
 const slides=(config.automatic?defaults:config.slides).map(row=>{const target=targets.find(t=>t.key===row.target);if(!target)return null;const candidates=products.filter(p=>belongs(p,row.target)&&p.image?.length);const p=candidates.find(p=>String(p._id)===row.productId)||candidates[0];if(!p)return null;return{...target,caption:row.caption||'Discover your next favourite',image:p.image[0],productName:p.name,linkText:row.linkText||("Explore "+target.label),imageUrl:row.imageUrl||"",fit:row.fit||"contain"};}).filter(Boolean);
 return{products,targets,config,slides};
};
