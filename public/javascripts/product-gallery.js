document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('[data-product-editor]');
  if (!form) return;
  const input = document.getElementById('gallery-upload');
  const grid = document.getElementById('gallery-editor');
  const feedback = document.getElementById('gallery-feedback');
  const dialog = document.getElementById('gallery-dialog');
  const items = Array.from(grid.children).map(tile => ({key:'existing:'+tile.dataset.existing, src:tile.querySelector('img').src, name:tile.querySelector('img').alt}));
  const removed = [];
  let serial = 0;
  function button(label, action, disabled = false) {
    const element = document.createElement('button');
    element.type = 'button'; element.textContent = label; element.disabled = disabled;
    element.addEventListener('click', action); return element;
  }
  function render() {
    grid.replaceChildren();
    items.forEach((item,index) => {
      const tile = document.createElement('article'); tile.className = 'gallery-tile';
      const image = document.createElement('img'); image.src = item.src; image.alt = item.name;
      const label = document.createElement('strong'); label.textContent = index === 0 ? 'Cover image' : 'Image '+(index+1);
      const controls = document.createElement('div'); controls.className = 'gallery-controls';
      controls.append(button('Make cover', () => {items.splice(index,1); items.unshift(item); render();}, index === 0));
      controls.append(button('Remove', () => {removed.push(items.splice(index,1)[0]); render();}));
      tile.append(image,label,controls); grid.append(tile);
    });
    feedback.replaceChildren(document.createTextNode(items.length+' of 6 images. '));
    if (removed.length) feedback.append(button('Undo removal', () => {
      if (items.length >= 6) return;
      items.push(removed.pop()); render();
    }, items.length >= 6));
    document.getElementById('preview-gallery').disabled = items.length === 0;
  }
  input.addEventListener('change', () => {
    const files = Array.from(input.files);
    if (items.length + files.length > 6 || files.some(file => file.size > 2*1024*1024 || !['image/jpeg','image/png'].includes(file.type))) {
      feedback.textContent = 'Choose JPG or PNG images up to 2 MB each, with no more than 6 images in total.';
      input.value = ''; return;
    }
    files.forEach(file => items.push({key:'upload:'+serial++,file,src:URL.createObjectURL(file),name:file.name}));
    input.value = ''; render();
  });
  document.getElementById('preview-gallery').addEventListener('click', () => {
    const main = document.getElementById('gallery-preview-main');
    const thumbs = document.getElementById('gallery-preview-thumbs');
    thumbs.replaceChildren();
    function select(item, selected) {
      main.src = item.src; main.alt = item.name;
      Array.from(thumbs.children).forEach(b => b.setAttribute('aria-pressed', String(b === selected)));
    }
    items.forEach((item,index) => {
      const thumb = button('', () => select(item,thumb));
      thumb.setAttribute('aria-label','Preview image '+(index+1));
      const image = document.createElement('img'); image.src = item.src; image.alt = '';
      thumb.append(image); thumbs.append(thumb);
    });
    select(items[0],thumbs.firstChild); dialog.showModal();
  });
  document.getElementById('close-gallery').addEventListener('click', () => dialog.close());
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const error = document.getElementById('product-save-error');
    error.textContent = '';
    if (!items.length) {error.textContent = 'Keep at least one product image.'; return;}
    const data = new FormData(form); data.delete('product_images');
    let uploadIndex = 0;
    const order = items.map(item => {
      if (!item.file) return item.key;
      data.append('product_images',item.file); return 'new:'+uploadIndex++;
    });
    data.set('image_order',JSON.stringify(order));
    const submit = form.querySelector('button[type="submit"]');
    if (submit.disabled) return;
    submit.disabled = true; submit.setAttribute('aria-busy','true');
    try {
      const response = await fetch(form.action,{method:'POST',body:data,headers:{Accept:'application/json'}});
      if (!(response.headers.get('content-type') || '').includes('application/json')) throw new Error('Could not save. Your session may have expired; sign in again in another tab, then retry.');
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not save this product.');
      window.location.assign(result.url);
    } catch (reason) {error.textContent = reason.message;}
    finally {submit.disabled = false; submit.removeAttribute('aria-busy');}
  });
  render();
});
