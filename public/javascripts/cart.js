document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.cart-shell')) return;
  document.documentElement.classList.add('cart-enhanced');
  let busy = false;
  document.addEventListener('click', event => {
    const button = event.target.closest('.cart-stepper button');
    if (!button || busy) return;
    const input = button.form.elements.quantity;
    if (Number(button.dataset.step) === -1 && Number(input.value) === 1) {
      const row = button.closest('.cart-row');
      row.querySelector('.cart-remove').form.requestSubmit();
      return;
    }
    input.value = Math.min(99, Math.max(1, Number(input.value) + Number(button.dataset.step)));
    button.form.requestSubmit();
  });
  document.addEventListener('change', event => {
    if (event.target.matches('.cart-stepper input') && !busy) event.target.form.requestSubmit();
  });
  document.addEventListener('submit', async event => {
    const form = event.target;
    if (form.matches('.cart-checkout-form')) {
      if (busy) event.preventDefault();
      return;
    }
    if (!form.matches('[data-cart-change]')) return;
    event.preventDefault();
    if (busy) return;
    busy = true;
    if (form.action.endsWith('/deleteCart')) {
      const name = form.closest('.cart-row').querySelector('h2').textContent.trim();
      const accepted = await window.BancomConfirm({title:'Remove from your bag?',message:name+' will be removed. You can add it again anytime from the collection.',confirmLabel:'Remove item'});
      if (!accepted) {busy=false; return;}
    }
    const shell = document.querySelector('.cart-shell');
    const data = new URLSearchParams(new FormData(form));
    const focusId = form.elements.quantity?.id;
    const focusedStep = document.activeElement?.dataset.step;
    const previousScroll = window.scrollY;
    const disabled = Array.from(shell.querySelectorAll('button,input')).map(control => [control, control.disabled]);
    disabled.forEach(([control]) => {control.disabled = true;});
    shell.setAttribute('aria-busy','true');
    shell.querySelector('.cart-feedback').textContent = 'Updating your bag…';
    try {
      const response = await fetch(form.action,{method:'POST',body:data});
      if (!response.ok) throw new Error('Unable to update your bag. Please try again.');
      if (new URL(response.url).pathname === '/login') throw new Error('Your session expired. Sign in again to update your bag.');
      const documentNext = new DOMParser().parseFromString(await response.text(),'text/html');
      const next = documentNext.querySelector('.cart-shell');
      if (!next) throw new Error('Unable to update your bag. Please refresh the page.');
      if (form.action.endsWith('/deleteCart') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const row=form.closest('.cart-row');
        const height=row.getBoundingClientRect().height;
        await row.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(18px)'}],{duration:160,fill:'forwards'}).finished;
        await row.animate([{height:height+'px',overflow:'hidden'},{height:'0px',paddingTop:0,paddingBottom:0,marginTop:0,marginBottom:0,overflow:'hidden'}],{duration:180,easing:'ease-in-out',fill:'forwards'}).finished;
      }
      shell.innerHTML = next.innerHTML;
      const count = documentNext.querySelector('.bag-count');
      if (count) document.querySelectorAll('.bag-count').forEach(node=>{node.textContent=count.textContent;});
      shell.querySelector('.cart-feedback').textContent = form.action.endsWith('/deleteCart') ? 'Item removed from your bag.' : 'Quantity and total updated.';
      const quantity = focusId && document.getElementById(focusId);
      const focus = quantity && (focusedStep ? quantity.form.querySelector(`[data-step="${focusedStep}"]:not(:disabled)`) || quantity : quantity);
      if (focus) focus.focus({preventScroll:true});
      window.scrollTo({top:previousScroll,behavior:'instant'});
    } catch (error) {
      shell.querySelector('.cart-feedback').textContent = error.message;
      disabled.forEach(([control,wasDisabled])=>{control.disabled=wasDisabled;});
    } finally {busy=false; shell.removeAttribute('aria-busy');}
  });
});
