exports.custom=(from,to)=>{
 const valid=value=>typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && value>='1900-01-01' && value<='2100-12-31' && !Number.isNaN(Date.parse(value+'T00:00:00Z')) && new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
 if(!valid(from)||!valid(to))throw new Error('Choose valid start and end dates between 1900 and 2100.');
 if(from>to)throw new Error('The end date must be on or after the start date.');
 return {$gte:new Date(from+'T00:00:00+08:00').toISOString(),$lt:new Date(new Date(to+'T00:00:00+08:00').getTime()+86400000).toISOString()};
};
