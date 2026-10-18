document.addEventListener('DOMContentLoaded', () => {
  const toast = document.createElement('aside');
  toast.className = 'bag-toast';
  toast.hidden = true;
  const message = document.createElement('span');
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');
  message.setAttribute('aria-atomic', 'true');
  const link = document.createElement('a');
  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.textContent = '×';
  dismiss.setAttribute('aria-label', 'Dismiss notification');
  toast.append(message, link, dismiss);
  document.body.append(toast);
  let timer;
  let queue = Promise.resolve();
  const hide = () => { toast.hidden = true; clearTimeout(timer); };
  const scheduleHide = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!toast.matches(':hover') && !toast.contains(document.activeElement)) hide();
    }, 6000);
  };
  function notify(text, signIn = false, error = false) {
    clearTimeout(timer);
    toast.hidden = false;
    toast.classList.toggle('bag-toast-error', error);
    message.textContent = text;
    link.href = signIn ? '/login' : '/cart';
    link.textContent = signIn ? 'Sign in →' : 'View bag →';
    if (!error) scheduleHide();
  }
  dismiss.addEventListener('click', hide);
  toast.addEventListener('mouseenter', () => clearTimeout(timer));
  toast.addEventListener('focusin', () => clearTimeout(timer));
  toast.addEventListener('mouseleave', scheduleHide);
  toast.addEventListener('focusout', scheduleHide);

  document.addEventListener('click', event => {
    const step=event.target.closest('[data-bag-step]');
    if (!step) return;
    const input=step.form.elements.quantity;
    input.value=Math.min(99,Math.max(1,(Number(input.value)||1)+Number(step.dataset.bagStep)));
  });
  // Delegation also handles cards inserted by category/search filtering.
  document.addEventListener('submit', event => {
    const form = event.target;
    if (event.defaultPrevented || !form.matches('.card-buy, .product-info form')) return;
    if (event.submitter?.hasAttribute('formaction')) return;
    if (new URL(form.action).pathname !== '/cart') return;
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    if (button.disabled) return;
    const body = new URLSearchParams(new FormData(form));
    const idleLabel = button.getAttribute('aria-label');
    button.disabled = true;
    button.classList.add('is-adding');
    button.setAttribute('aria-busy', 'true');
    button.setAttribute('aria-label', 'Adding to bag');

    // Serialize additions so quick clicks on different products cannot overwrite the cart.
    queue = queue.then(async () => {
      try {
        const response = await fetch(form.action, {
          method: 'POST', headers: {Accept: 'application/json'}, body
        });
        if (!(response.headers.get('content-type') || '').includes('application/json')) {
          throw new Error('Unable to confirm the update. Check your bag before trying again.');
        }
        const result = await response.json();
        if (!response.ok) {
          notify(result.message || 'Could not add this item. Please try again.', response.status === 401, true);
          return;
        }
        document.querySelectorAll('.bag-count').forEach(count => { count.textContent = result.cartCount; });
        document.querySelectorAll('[data-bag-product]').forEach(action => {
          if (action.dataset.bagProduct !== result.productId) return;
          const status=action.querySelector('.in-bag-status');
          status.hidden=false;
          status.classList.remove('just-added');
          action.querySelector('[data-bag-quantity]').textContent=result.quantity;
          action.querySelector('input[name="quantity"]').value=result.quantity;
          action.querySelector('[data-bag-label]').textContent='Update bag';
          action.querySelector('.in-bag-link').hidden=false;
          button.setAttribute('aria-label','Update quantity in bag');
          if (!matchMedia('(prefers-reduced-motion: reduce)').matches) status.animate([{opacity:.4,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:220});

        });
        notify(result.message);
      } catch (error) {
        notify('Unable to confirm the update. Check your bag before trying again.', false, true);
      } finally {
        button.disabled = false;
        button.classList.remove('is-adding');
        button.removeAttribute('aria-busy');
        if (idleLabel && !form.querySelector('.in-bag-status')) button.setAttribute('aria-label', form.closest('[data-bag-product]').querySelector('.in-bag-status').hidden ? idleLabel : 'Update quantity in bag');
        else button.removeAttribute('aria-label');
      }
    });
  });
});
