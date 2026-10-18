exports.build=(report,range,today,from,to)=>{
 const end=new Date((range==='custom'?to:today)+'T00:00:00Z');
 const first=range==='custom'?from:range==='all'?(report.days[0]?.date||today):new Date(end.getTime()-(Number(range)-1)*86400000).toISOString().slice(0,10);
 const start=new Date(first+'T00:00:00Z');
 const monthly=(end-start)/86400000>180;
 const data=new Map();
 for(const row of report.days){const key=monthly?row.date.slice(0,7):row.date;const item=data.get(key)||{label:key,total:0,orders:0};item.total+=row.total/100;item.orders+=row.orders;data.set(key,item);}
 const points=[];let cursor=new Date(start);if(monthly)cursor.setUTCDate(1);
 while(cursor<=end){const label=cursor.toISOString().slice(0,monthly?7:10);points.push(data.get(label)||{label,total:0,orders:0});if(monthly)cursor.setUTCMonth(cursor.getUTCMonth()+1);else cursor.setUTCDate(cursor.getUTCDate()+1);}
 const max=Math.max(1,...points.map(p=>p.total));
 return{monthly,points:points.map((p,i)=>({...p,x:points.length===1?380:60+i*640/(points.length-1),y:230-p.total/max*180})),max};
};
