'use strict';
(() => {
  const goAdd = id => { location.href = 'planner.html?add=' + encodeURIComponent(id); };
  const drawFeatured = () => {
    $('#featured').innerHTML = DESTS.slice(0, 6).map(d => cardHTML(d, { fav: getFavs().includes(d.id) })).join('');
  };
  drawFeatured();
  $('#statDest').textContent = DESTS.length;
  $('#gallery-grid').innerHTML = DESTS.map(d => `<button class="gtile" data-info="${d.id}" style="${styleVars(d)}" aria-label="${esc(d.name)} details"><span aria-hidden="true">${d.emoji}</span><span class="name">${esc(d.name)}, ${esc(d.country)}</span></button>`).join('');

  document.addEventListener('click', e => {
    const fav = e.target.closest('[data-fav]');
    if (fav) { e.stopPropagation(); toggleFav(fav.dataset.fav); drawFeatured(); return; }
    const add = e.target.closest('[data-add]');
    if (add) return goAdd(add.dataset.add);
    const info = e.target.closest('[data-info]') || e.target.closest('.dcard');
    if (info) { const d = dById(info.dataset.info || info.dataset.id); if (d) showDest(d, { onAdd: d => goAdd(d.id), onFav: d => { const on = toggleFav(d.id); drawFeatured(); return on; } }); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('.dcard')) e.target.click(); });
  initReveal();
})();
