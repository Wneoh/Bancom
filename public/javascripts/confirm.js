// Native dialog supplies focus trapping and makes the background inert.
window.BancomConfirm = (() => {
  let active = false;
  return ({title = 'Are you sure?', message, confirmLabel = 'Confirm'}) => {
    if (active) return Promise.resolve(false);
    active = true;
    const previous = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = 'confirm-dialog';
    dialog.setAttribute('aria-labelledby','confirm-title');
    dialog.setAttribute('aria-describedby','confirm-description');
    dialog.innerHTML = '<div class="confirm-symbol" aria-hidden="true">−</div><h2 id="confirm-title"></h2><p id="confirm-description"></p><div class="confirm-actions"><button type="button" class="confirm-cancel" autofocus>Keep it</button><button type="button" class="confirm-accept"></button></div>';
    dialog.querySelector('h2').textContent = title;
    dialog.querySelector('p').textContent = message;
    dialog.querySelector('.confirm-accept').textContent = confirmLabel;
    document.body.append(dialog);
    document.documentElement.classList.add('confirmation-open');
    return new Promise(resolve => {
      let settled = false;
      const finish = accepted => {
        if (settled) return;
        settled = true;
        dialog.close(); dialog.remove(); active = false;
        document.documentElement.classList.remove('confirmation-open');
        if (previous?.isConnected) previous.focus({preventScroll:true});
        resolve(accepted);
      };
      dialog.querySelector('.confirm-cancel').addEventListener('click',()=>finish(false));
      dialog.querySelector('.confirm-accept').addEventListener('click',()=>finish(true));
      dialog.addEventListener('cancel',event=>{event.preventDefault(); finish(false);});
      dialog.addEventListener('click',event=>{
        const rect=dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom)) finish(false);
      });
      dialog.showModal();
    });
  };
})();
