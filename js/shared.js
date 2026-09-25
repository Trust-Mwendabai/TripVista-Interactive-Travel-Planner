'use strict';
// Shared helpers used by both pages: theme, nav, toast, reveal animation, destination modal, favorites storage.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => '$' + Math.round(n).toLocaleString();
const toast = msg => { const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.append(t); setTimeout(() => t.remove(), 3000); };

function loadJSON(key, fallback) { try { return { ...fallback, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch (e) { return fallback; } }
function saveJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ } }
const getFavs = () => { try { const f = JSON.parse(localStorage.getItem('tv-favs') || '[]'); return Array.isArray(f) ? f : []; } catch (e) { return []; } };
const setFavs = f => { try { localStorage.setItem('tv-favs', JSON.stringify(f)); } catch (e) { } };
function toggleFav(id) { const f = getFavs(); const i = f.indexOf(id); i >= 0 ? f.splice(i, 1) : f.push(id); setFavs(f); return i < 0; }

document.addEventListener('click', e => {
  if (e.target.closest('#themeBtn')) {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t; try { localStorage.setItem('tv-theme', t); } catch (err) { }
  }
  if (e.target.closest('#burger')) { const l = $('#navLinks'); const o = l.classList.toggle('open'); $('#burger').setAttribute('aria-expanded', o); }
  else if (e.target.closest('#navLinks a')) $('#navLinks')?.classList.remove('open');
});

function initReveal() {
  const els = $$('.reveal');
  if (!('IntersectionObserver' in window)) return els.forEach(e => e.classList.add('in'));
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .12 });
  els.forEach(e => io.observe(e));
}

// Card and tile markup
const styleVars = d => `--c1:${d.c[0]};--c2:${d.c[1]}`;
function cardHTML(d, { added = false, fav = false, actions = true } = {}) {
  return `<article class="dcard ${added ? 'added' : ''}" data-id="${d.id}" tabindex="0" aria-label="${esc(d.name)}, ${esc(d.country)}">
    <div class="dimg" style="${styleVars(d)}">
      ${ic(d.icon, 'bg-ic')}
      <span class="cat">${ic(CAT_ICON[d.cats[0]])} ${d.cats[0]}</span>
      <button class="fav ${fav ? 'on' : ''}" data-fav="${d.id}" aria-label="${fav ? 'Remove from' : 'Add to'} favourites" aria-pressed="${fav}">${ic('heart')}</button>
      <span class="glass">${ic(d.icon)}</span></div>
    <div class="dbody"><h3>${esc(d.name)} ${added ? `<span class="badge-in">${ic('check')} In trip</span>` : ''}</h3>
      <div class="sub">${ic('pin')} ${esc(d.country)}</div>
      <div class="sub">${ic('calendar')} Best: ${esc(d.season)}</div>
      <div class="price">~${money(dayCost(d))} <span class="muted">/ day per person</span></div>
      ${actions ? `<div class="actions"><button class="btn sm ${added ? '' : 'primary'}" data-add="${d.id}">${added ? ic('check') + ' Added' : ic('plus') + ' Add to trip'}</button><button class="btn sm" data-info="${d.id}">Details</button></div>` : ''}
    </div></article>`;
}

// Destination details dialog
function showDest(d, { onAdd, onFav, added } = {}) {
  let dlg = $('#destDlg');
  if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'destDlg'; document.body.append(dlg); dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); }
  const favBtn = on => `${ic('heart')} ${on ? 'Saved to favourites' : 'Save to favourites'}`;
  dlg.setAttribute('aria-label', d.name);
  dlg.innerHTML = `<div class="dlg-img" style="${styleVars(d)}">${ic(d.icon, 'xl')}<button class="icon-btn dlg-close" aria-label="Close">${ic('x')}</button></div>
    <div class="dlg-body"><div><h2>${esc(d.name)}</h2><div class="muted">${ic('pin')} ${esc(d.country)}</div></div>
      <p>${esc(d.blurb)}</p>
      <div class="chips">${d.cats.map(c => `<span class="chip">${ic(CAT_ICON[c])} ${c}</span>`).join('')}<span class="chip">${ic('calendar')} ${esc(d.season)}</span></div>
      <div><h4>Top things to do</h4><ul class="dlg-list">${d.spots.map(s => `<li><span>${esc(s[0])}</span><b>${s[1] ? money(s[1]) : 'Free'}</b></li>`).join('')}</ul></div>
      <div><h4>Daily cost per person</h4><div class="costgrid"><div>Stay<b>${money(d.cost.stay)}</b></div><div>Food<b>${money(d.cost.food)}</b></div><div>Transport<b>${money(d.cost.transport)}</b></div></div></div>
      <div class="row"><button class="btn primary" id="dlgAdd">${added ? ic('check') + ' In your trip' : ic('plus') + ' Add to my trip'}</button><button class="btn" id="dlgFav">${favBtn(getFavs().includes(d.id))}</button></div></div>`;
  $('.dlg-close', dlg).onclick = () => dlg.close();
  $('#dlgAdd', dlg).onclick = () => { onAdd?.(d); dlg.close(); };
  $('#dlgFav', dlg).onclick = e => { const on = onFav ? onFav(d) : toggleFav(d.id); e.currentTarget.innerHTML = favBtn(on); };
  dlg.showModal();
}
