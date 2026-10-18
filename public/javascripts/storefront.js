document.addEventListener('DOMContentLoaded', () => {
 const approved = new WeakSet();
 document.addEventListener('submit', async event => {
   const form = event.target;
   if (!form.dataset.confirm || approved.has(form)) return;
   event.preventDefault();
   const name = form.closest('.store-card')?.querySelector('h3')?.textContent || 'this product';
   if (await window.BancomConfirm({title:'Delete product?',message:'Delete '+name+' from the catalogue? This cannot be undone.',confirmLabel:'Delete product'})) {
     approved.add(form); form.requestSubmit(); approved.delete(form);
   }
 });
 document.querySelectorAll('input:not([type="hidden"])').forEach(input => {if(!input.labels.length && input.placeholder) input.setAttribute('aria-label', input.placeholder);});
});
document.addEventListener('DOMContentLoaded',()=>{const input=document.getElementById('product-images');if(!input)return;let urls=[];input.addEventListener('change',()=>{urls.forEach(URL.revokeObjectURL);urls=[];const preview=document.getElementById('image-previews');preview.replaceChildren();input.setCustomValidity('');const files=Array.from(input.files);if(files.length>3||files.some(file=>file.size>2*1024*1024)){input.setCustomValidity('Choose up to 3 images, each no larger than 2 MB.');input.reportValidity();return;}files.forEach(file=>{const image=document.createElement('img');const url=URL.createObjectURL(file);urls.push(url);image.src=url;image.alt=file.name;preview.appendChild(image);});});});

document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('.thumbnail').forEach(button=>button.addEventListener('click',()=>{const main=document.getElementById('product-main-image');main.src=button.querySelector('img').src;main.alt=button.querySelector('img').alt;document.querySelectorAll('.thumbnail').forEach(other=>{other.classList.remove('selected');other.setAttribute('aria-pressed','false');});button.classList.add('selected');button.setAttribute('aria-pressed','true');}));});

// Animate only visible content; without JavaScript every section stays readable.
document.addEventListener('DOMContentLoaded', () => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (motion.matches) return;
      const animation = entry.target.animate([
        {opacity: 0, translate: '0 20px'},
        {opacity: 1, translate: '0 0'}
      ], {duration: 600, delay: Number(entry.target.dataset.motionDelay || 0), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'});
      active.add(animation);
      animation.finished.then(() => active.delete(animation)).catch(() => active.delete(animation));
    });
  }, {threshold: 0.08});
  document.querySelectorAll('.hero-copy > *, .hero-photo, .section-heading, .store-card, .store-values > div, .product-gallery, .product-info, .bag-item, .bag-summary, .login-content').forEach((element, index) => {
    element.dataset.motionDelay = element.matches('.store-card') ? (Array.from(element.parentElement.children).indexOf(element) % 4) * 65 : Math.min(index % 5, 3) * 55;
    observer.observe(element);
  });
  motion.addEventListener('change', () => {
    if (motion.matches) active.forEach(animation => animation.cancel());
  });
});

// Filter the catalogue in place instead of navigating to a scrolling hash anchor.
document.addEventListener('DOMContentLoaded', () => {
  const catalogue = document.getElementById('catalogue');
  if (!catalogue) return;
  let pending;
  async function updateCatalogue(url, focusId) {
    if (pending) pending.abort();
    const request = new AbortController();
    pending = request;
    catalogue.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(url, {signal: request.signal});
      if (!response.ok) throw new Error('Catalogue could not load');
      const page = new DOMParser().parseFromString(await response.text(), 'text/html');
      const next = page.getElementById('catalogue');
      if (!next) throw new Error('Catalogue missing');
      // Keep the viewport stable even when a category has fewer products.
      const oldHeight = Math.max(0, window.innerHeight - catalogue.getBoundingClientRect().top);
      catalogue.style.minHeight = oldHeight + 'px';
      catalogue.innerHTML = next.innerHTML;
      history.pushState({catalogue: true}, '', url);
      const target = focusId ? document.getElementById(focusId) : catalogue.querySelector('.category-tabs .selected');
      if (target) target.focus({preventScroll: true});
      const count = catalogue.querySelector('.product-count');
      if (count) { count.setAttribute('role', 'status'); count.setAttribute('aria-live', 'polite'); }
    } catch (error) {
      if (error.name !== 'AbortError') window.location.assign(url);
    } finally {
      if (pending === request) catalogue.removeAttribute('aria-busy');
    }
  }
  catalogue.addEventListener('click', event => {
    const link = event.target.closest('.category-tabs a, .collection-tabs a, .store-pagination a');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const url = new URL(link.href);
    url.hash = '';
    updateCatalogue(url.pathname + url.search);
  });
  catalogue.addEventListener('submit', event => {
    if (!event.target.matches('.catalogue-tools')) return;
    event.preventDefault();
    const url = new URL(event.target.action);
    url.hash = '';
    url.search = new URLSearchParams(new FormData(event.target)).toString();
    updateCatalogue(url.pathname + url.search, 'search');
  });
  window.addEventListener('popstate', () => window.location.reload());
});

// Explicitly handle repeated hero-anchor clicks, including an existing #catalogue URL.
document.addEventListener('click',event=>{
 const link=event.target.closest('.hero-copy a[href="#catalogue"]');
 if(!link || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
 const catalogue=document.getElementById('catalogue');if(!catalogue)return;
 event.preventDefault();catalogue.focus({preventScroll:true});catalogue.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 history.replaceState(history.state,'',location.pathname+location.search+'#catalogue');
});
const tagInput=document.getElementById('product-tags');
if(tagInput){const preview=document.getElementById('collection-tag-preview');const render=()=>{preview.replaceChildren();const tags=[...new Set(tagInput.value.split(',').map(t=>t.trim().replace(/\s+/g,' ').toLowerCase()).filter(Boolean))];tagInput.setCustomValidity(tags.length>8 || tags.some(t=>t.length>32)?'Use up to 8 tags, each no longer than 32 characters.':'');tags.slice(0,8).forEach(tag=>{const chip=document.createElement('span');chip.textContent=tag;preview.append(chip);});};tagInput.addEventListener('input',render);render();}
