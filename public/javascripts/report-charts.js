const period=document.querySelector('#report-range'),from=document.querySelector('#report-from'),to=document.querySelector('#report-to');
function syncDates(){const custom=period.value==='custom';[from,to].forEach(input=>{input.required=custom;input.closest('.report-date-field').hidden=!custom;input.disabled=!custom;});}
period.addEventListener('change',syncDates);syncDates();
[from,to].forEach(input=>input.addEventListener('input',()=>{to.setCustomValidity(from.value && to.value && from.value>to.value?'End date must be on or after start date.':'');}));
period.addEventListener('change',()=>to.setCustomValidity(''));

const payload=document.querySelector('#report-chart-data');
if(payload && typeof Chart!=='undefined'){
 const data=JSON.parse(payload.dataset.chart),colors=['#244e41','#77965c','#b2c57d','#597e91','#b79a72','#9c7e9c'];
 Chart.defaults.font.family="'Plus Jakarta Sans', Arial, sans-serif";Chart.defaults.font.size=11;Chart.defaults.color='#68736f';
 const common={responsive:true,maintainAspectRatio:false,animation:matchMedia('(prefers-reduced-motion: reduce)').matches?false:{duration:300},plugins:{legend:{display:false}},interaction:{mode:'index',intersect:false}};
 const money=value=>'RM '+Number(value).toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2});
 new Chart(document.querySelector('#sales-chart'),{type:'line',data:{labels:data.points.map(p=>p.label),datasets:[{label:'Order value',data:data.points.map(p=>p.total),borderColor:colors[0],backgroundColor:'#dceab966',fill:true,tension:0,pointRadius:data.points.length>40?2:4,pointHitRadius:12,borderWidth:2}]},options:{...common,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>money(ctx.parsed.y),afterLabel:ctx=>data.points[ctx.dataIndex].orders+' orders'}}},scales:{y:{beginAtZero:true,ticks:{maxTicksLimit:5},grid:{color:'#e5e9e1'}},x:{grid:{display:false},ticks:{maxTicksLimit:6,maxRotation:0}}}}});
 new Chart(document.querySelector('#products-chart'),{type:'bar',data:{labels:data.products.map(p=>p.name),datasets:[{label:'Units sold',data:data.products.map(p=>p.units),backgroundColor:colors[0],borderRadius:4,maxBarThickness:20}]},options:{...common,indexAxis:'y',scales:{x:{beginAtZero:true,ticks:{precision:0,maxTicksLimit:5},grid:{color:'#e5e9e1'}},y:{grid:{display:false}}}}});
 new Chart(document.querySelector('#category-chart'),{type:'doughnut',data:{labels:data.categories.map(c=>c.name),datasets:[{data:data.categories.map(c=>c.revenue/100),backgroundColor:colors,borderWidth:2,borderColor:'#fff'}]},options:{...common,cutout:'68%',interaction:{mode:'nearest',intersect:true},plugins:{legend:{display:true,position:'right',labels:{boxWidth:10,boxHeight:10,padding:12}},tooltip:{callbacks:{label:ctx=>{const sum=data.categories.reduce((s,c)=>s+c.revenue,0)/100;return ctx.label+': '+money(ctx.parsed)+' ('+(sum?ctx.parsed/sum*100:0).toFixed(1)+'%)';}}}}}});
}
