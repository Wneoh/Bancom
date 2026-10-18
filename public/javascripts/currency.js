(() => {
  const select=document.querySelector('#display-currency');
  if (!select) return;
  const menu=document.querySelector('.currency-menu');
  document.addEventListener('click',event=>{if(!menu.contains(event.target))menu.open=false;});
  document.addEventListener('keydown',event=>{if(event.key==='Escape' && menu.open){menu.open=false;menu.querySelector('summary').focus();}});
  const status=document.querySelector('#currency-status');
  const summary=document.querySelector('.currency-info summary');
  let currency='MYR', rates, requestId=0;
  const supported=Array.from(select.options,option=>option.value);
  function render() {
    const format=new Intl.NumberFormat('en-MY',{style:'currency',currency,currencyDisplay:'code'});
    document.querySelectorAll('[data-myr]').forEach(node=>{
      const base=Number(node.dataset.myr);
      const value=currency==='MYR' ? 'RM '+base.toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2}) : format.format(base*rates.rates[currency]);
      if(node.textContent!==value) node.textContent=value;
      node.title=currency==='MYR' ? '' : 'Approximate conversion · Base price MYR '+base.toFixed(2);
    });
    document.querySelectorAll('[data-currency-code]').forEach(node=>{if(node.textContent!==currency)node.textContent=currency;});
  }
  async function change(next) {
    const id=++requestId;
    if(next!=='MYR') {
      status.textContent='Loading reference rates…'; summary.textContent='Loading exchange rates…';
      try {
        const response=await fetch('/api/exchange-rates',{signal:AbortSignal.timeout(10000)});
        if(!response.ok)throw new Error();
        const data=await response.json();
        if(!Number.isFinite(data.rates[next]) || data.rates[next]<=0)throw new Error();
        if(id!==requestId)return;
        rates=data;
      } catch {
        if(id!==requestId)return;
        currency='MYR';select.value='MYR';render();
        summary.textContent='Rates unavailable · Showing MYR';
        status.textContent='Could not load exchange rates. Prices are shown in MYR. Choose a currency to retry.';
        return;
      }
    }
    if(id!==requestId)return;
    currency=next;select.value=next;render();
    try {localStorage.setItem('bancom-currency',next);} catch {}
    summary.textContent=next==='MYR' ? 'About exchange rates' : (rates.stale?'Cached':'ECB')+' rates · '+rates.dates[next];
    status.textContent=next==='MYR' ? "MYR is the store's base currency. No conversion applied." : '1 MYR = '+rates.rates[next]+' '+next+' · Rate date '+rates.dates[next]+'. Source: European Central Bank via Frankfurter.'+(rates.stale?' Latest refresh failed; showing cached rates.':'');
  }
  select.addEventListener('change',()=>change(select.value));
  new MutationObserver(render).observe(document.querySelector('#main-content'),{childList:true,subtree:true});
  let saved;try {saved=localStorage.getItem('bancom-currency');}catch {}
  if(supported.includes(saved))change(saved);
})();
