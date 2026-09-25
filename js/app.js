'use strict';
(() => {
  const KEY = 'tv-trip';
  const uid = () => Math.random().toString(36).slice(2, 9);
  const clamp = (v, lo, hi, d) => { v = parseInt(v, 10); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
  const num = (v, d = 0) => { v = parseFloat(v); return Number.isFinite(v) && v >= 0 ? v : d; };
  const defaults = () => ({ name: '', start: '', days: 5, travelers: 2, flight: 0, budget: 0, selected: [], itin: {}, done: {}, custom: [], day: 1 });
  let T = loadJSON(KEY, defaults());
  T.selected = (Array.isArray(T.selected) ? T.selected : []).filter(s => dById(s.id));
  const save = () => saveJSON(KEY, T);
  let tab = 'explore';

  /* ---------- Tabs ---------- */
  function setTab(t) {
    tab = t;
    $$('.tab').forEach(b => { const on = b.dataset.tab === t; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
    $$('.panel').forEach(p => { p.hidden = p.id !== 'p-' + t; });
    render();
  }
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) setTab(b.dataset.tab); });

  /* ---------- Trip helpers ---------- */
  const isAdded = id => T.selected.some(s => s.id === id);
  const allocated = () => T.selected.reduce((a, s) => a + s.nights, 0);
  function addDest(id) {
    if (isAdded(id)) return;
    const left = T.days - allocated();
    T.selected.push({ id, nights: T.selected.length === 0 ? T.days : left > 0 ? left : 1 });
    save();
  }
  function removeDest(id) { T.selected = T.selected.filter(s => s.id !== id); save(); }
  function dayDest(day) {
    let cum = 0;
    for (const s of T.selected) { cum += s.nights; if (day <= cum) return dById(s.id); }
    return null;
  }
  const dayDate = day => {
    if (!T.start) return '';
    const d = new Date(T.start + 'T00:00:00'); if (isNaN(d)) return '';
    d.setDate(d.getDate() + day - 1);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  /* ---------- Budget ---------- */
  function budget() {
    const per = { stay: 0, food: 0, transport: 0 };
    T.selected.forEach(s => { const d = dById(s.id); for (const k in per) per[k] += d.cost[k] * s.nights; });
    let act = 0;
    for (let day = 1; day <= T.days; day++) (T.itin[day] || []).forEach(a => { act += a.cost; });
    const buffer = (per.stay + per.food + per.transport + act) * 0.1;
    const n = T.travelers;
    const lines = [['✈️ Flights', T.flight * n, '#0ea5e9'], ['🏨 Accommodation', per.stay * n, '#14b8a6'], ['🍽️ Food', per.food * n, '#f59e0b'], ['🚌 Local transport', per.transport * n, '#8b5cf6'], ['🎟️ Activities', act * n, '#ec4899'], ['🛟 Buffer (10%)', buffer * n, '#94a3b8']];
    const total = lines.reduce((a, l) => a + l[1], 0);
    return { lines, total };
  }

  /* ---------- Checklist ---------- */
  function checklistItems() {
    const cats = new Set(T.selected.flatMap(s => dById(s.id).cats));
    const climates = new Set(T.selected.map(s => dById(s.id).climate));
    const it = [];
    const add = (key, group, text, why) => it.push({ key, group, text, why });
    [['passport', 'Passport & visas'], ['tickets', 'Flight / transport tickets'], ['insurance', 'Travel insurance'], ['copies', 'Digital copies of documents'], ['bookings', 'Accommodation bookings']].forEach(([k, t]) => add(k, 'Documents', t));
    [['meds', 'Personal medication'], ['firstaid', 'Basic first-aid kit'], ['sanitizer', 'Hand sanitizer']].forEach(([k, t]) => add(k, 'Health', t));
    [['clothes', `Clothes for ${T.days} day${T.days > 1 ? 's' : ''}`], ['toiletries', 'Toiletries'], ['underwear', 'Underwear & socks'], ['bag', 'Luggage & travel bag']].forEach(([k, t]) => add(k, 'Packing', t));
    if (T.days > 7) add('laundry', 'Packing', 'Laundry bag / detergent', 'Long trip');
    if (cats.has('Beach')) [['sun', 'Sunscreen'], ['swim', 'Swimwear & towel'], ['shades', 'Sunglasses'], ['flip', 'Flip-flops']].forEach(([k, t]) => add(k, 'Beach', t, 'Beach'));
    if (cats.has('City')) [['shoes', 'Comfortable walking shoes'], ['daybag', 'Day bag / anti-theft bag'], ['map', 'Offline city map']].forEach(([k, t]) => add(k, 'City', t, 'City'));
    if (cats.has('Adventure')) [['boots', 'Hiking boots'], ['rain', 'Rain jacket'], ['bottle', 'Reusable water bottle'], ['snack', 'Energy snacks']].forEach(([k, t]) => add(k, 'Adventure', t, 'Adventure'));
    if (cats.has('Culture')) [['modest', 'Modest clothing for temples / sites'], ['camera', 'Camera'], ['phrase', 'Phrasebook / translation app']].forEach(([k, t]) => add(k, 'Culture', t, 'Culture'));
    if (cats.has('Nature')) [['repel', 'Insect repellent'], ['binocs', 'Binoculars'], ['hat', 'Sun hat']].forEach(([k, t]) => add(k, 'Nature', t, 'Nature'));
    if (climates.has('cold')) [['coat', 'Warm jacket'], ['gloves', 'Gloves & hat'], ['thermal', 'Thermal layers']].forEach(([k, t]) => add(k, 'Weather', t, 'Cold climate'));
    if (climates.has('cool')) add('layers', 'Weather', 'Warm layers for cool nights', 'Cool climate');
    if (climates.has('warm')) add('light', 'Weather', 'Light, breathable clothing', 'Warm climate');
    [['adapter', 'Power adapter'], ['charger', 'Phone charger'], ['bank', 'Power bank'], ['esim', 'Roaming plan / local SIM']].forEach(([k, t]) => add(k, 'Tech', t));
    [['cards', 'Bank cards & some cash'], ['notify', 'Notify bank of travel']].forEach(([k, t]) => add(k, 'Money', t));
    if (T.travelers > 1) add('share', 'Group', 'Share itinerary & emergency contacts', 'Group trip');
    T.custom.forEach(c => it.push({ key: c.id, group: 'My items', text: c.text, custom: true }));
    return it;
  }

  /* ---------- Render ---------- */
  function renderSummary() {
    const { total } = budget(), items = checklistItems(), done = items.filter(i => T.done[i.key]).length;
    const over = T.budget && total > T.budget;
    $('#summary').innerHTML = [
      ['Destinations', T.selected.length], ['Days', T.days], ['Travellers', T.travelers],
      ['Est. total', money(total), over ? 'over' : ''], ['Packed', `${done}/${items.length}`]
    ].map(([l, v, c]) => `<div class="sum ${c || ''}"><b>${v}</b><span class="muted">${l}</span></div>`).join('');
    $('#cTrip').textContent = T.selected.length; $('#cFav').textContent = getFavs().length;
  }

  function renderExplore() {
    const q = $('#q').value.trim().toLowerCase(), cat = $('#fCat').value, max = +$('#fBudget').value, sort = $('#fSort').value;
    let l = DESTS.filter(d => (!cat || d.cats.includes(cat)) && (!max || dayCost(d) <= max) &&
      (!q || [d.name, d.country, d.blurb, ...d.cats, ...d.spots.map(s => s[0])].join(' ').toLowerCase().includes(q)));
    l = [...l].sort((a, b) => sort === 'low' ? dayCost(a) - dayCost(b) : sort === 'high' ? dayCost(b) - dayCost(a) : a.name.localeCompare(b.name));
    const favs = getFavs();
    $('#exploreGrid').innerHTML = l.length ? l.map(d => cardHTML(d, { added: isAdded(d.id), fav: favs.includes(d.id) })).join('') : '<p class="empty" style="grid-column:1/-1">No destinations match. Try clearing a filter.</p>';
  }

  function renderTrip() {
    for (const [id, key] of [['#tName', 'name'], ['#tStart', 'start'], ['#tDays', 'days'], ['#tTrav', 'travelers'], ['#tFlight', 'flight'], ['#tBudget', 'budget']]) {
      if (document.activeElement !== $(id)) $(id).value = T[key] || (key === 'name' || key === 'start' ? '' : T[key]);
    }
    const a = allocated();
    $('#allocNote').textContent = T.selected.length ? `${a} of ${T.days} days assigned` : '';
    $('#allocNote').style.color = T.selected.length && a !== T.days ? 'var(--warn)' : '';
    $('#tripList').innerHTML = T.selected.length ? T.selected.map(s => {
      const d = dById(s.id);
      return `<div class="dest-row" data-id="${d.id}"><div class="mini" style="${styleVars(d)}">${d.emoji}</div><div class="body">${esc(d.name)}<div class="muted">${esc(d.country)}</div></div>
        <label class="sr" style="font-size:.78rem;color:var(--muted)">Days <input type="number" min="1" max="30" value="${s.nights}" data-nights="${d.id}" aria-label="Days in ${esc(d.name)}"></label>
        <button class="icon-btn" data-remove="${d.id}" aria-label="Remove ${esc(d.name)}">✕</button></div>`;
    }).join('') : '<p class="empty">No destinations yet. Head to <b>Explore</b> and add some.</p>';
  }

  function renderItinerary() {
    if (T.day > T.days) T.day = T.days;
    $('#dayTotal').textContent = `${T.days} days`;
    $('#dayTabs').innerHTML = Array.from({ length: T.days }, (_, i) => i + 1).map(d => `<button class="daytab ${d === T.day ? 'active' : ''}" data-day="${d}">Day ${d}<small>${esc(dayDate(d) || (dayDest(d)?.name ?? '—'))}</small></button>`).join('');
    const dd = dayDest(T.day);
    $('#dayHead').textContent = `Day ${T.day}${dayDate(T.day) ? ' · ' + dayDate(T.day) : ''}${dd ? ' · ' + dd.name + ', ' + dd.country : ''}`;
    const spots = (dd ? [dd] : T.selected.map(s => dById(s.id))).flatMap(d => d.spots.map(s => ({ name: s[0], cost: s[1] }))).slice(0, 8);
    $('#suggest').innerHTML = spots.length ? spots.map((s, i) => `<button class="chip" data-spot="${i}" type="button">＋ ${esc(s.name)}</button>`).join('') : '<span class="hint">Add a destination to get suggestions.</span>';
    $('#suggest').spots = spots;
    const acts = [...(T.itin[T.day] || [])].sort((a, b) => a.time.localeCompare(b.time));
    $('#actList').innerHTML = acts.length ? acts.map(a => `<li class="act" data-id="${a.id}"><span class="time">${esc(a.time)}</span><span class="body">${esc(a.title)}</span><span class="cost">${a.cost ? money(a.cost) : 'Free'}</span><button class="icon-btn no-print" data-delact="${a.id}" aria-label="Delete activity">🗑️</button></li>`).join('') : '<li class="empty">Nothing planned for this day yet.</li>';
  }

  function renderBudget() {
    const { lines, total } = budget(), n = T.travelers, max = Math.max(1, ...lines.map(l => l[1]));
    $('#bTotal').textContent = money(total);
    $('#bPer').textContent = `${money(total / n)} per person · ${n} traveller${n > 1 ? 's' : ''} · ${T.days} days`;
    let st = '';
    if (T.budget) {
      const diff = T.budget - total;
      st = diff >= 0 ? `<div class="status ok">✓ ${money(diff)} under your ${money(T.budget)} budget</div>` : `<div class="status bad">⚠ ${money(-diff)} over your ${money(T.budget)} budget</div>`;
    } else st = '<div class="status warn">Set a budget limit in “My trip” to track your spending.</div>';
    if (!T.selected.length) st += '<div class="status warn" style="margin-top:.5rem">Add destinations to include accommodation, food and transport.</div>';
    $('#bStatus').innerHTML = st;
    $('#bBars').innerHTML = lines.map(([l, v, c]) => `<div class="bar"><div class="top"><span>${l}</span><span>${money(v)}</span></div><div class="track"><div class="fill" style="width:${v / max * 100}%;--c:${c}"></div></div></div>`).join('');
  }

  function renderChecklist() {
    const items = checklistItems(), done = items.filter(i => T.done[i.key]).length;
    $('#clCount').textContent = `${done} of ${items.length} packed`;
    $('#clBar').style.width = items.length ? done / items.length * 100 + '%' : '0';
    const groups = {}; items.forEach(i => (groups[i.group] ||= []).push(i));
    $('#clList').innerHTML = Object.entries(groups).map(([g, l]) => `<div class="cl-group"><h3>${esc(g)}</h3>${l.map(i => `<label class="cl-item ${T.done[i.key] ? 'done' : ''}"><input type="checkbox" data-key="${i.key}" ${T.done[i.key] ? 'checked' : ''}><span>${esc(i.text)}</span>${i.why ? `<em class="why" style="font-style:normal">${esc(i.why)}</em>` : ''}${i.custom ? `<button type="button" class="icon-btn" data-delcl="${i.key}" aria-label="Delete item">🗑️</button>` : ''}</label>`).join('')}</div>`).join('');
  }

  function renderFavs() {
    const f = getFavs().map(dById).filter(Boolean);
    $('#favGrid').innerHTML = f.length ? f.map(d => cardHTML(d, { added: isAdded(d.id), fav: true })).join('') : '<p class="empty" style="grid-column:1/-1">No favourites yet. Tap the ♡ on any destination.</p>';
  }

  function render() {
    renderSummary();
    ({ explore: renderExplore, trip: renderTrip, itinerary: renderItinerary, budget: renderBudget, checklist: renderChecklist, favs: renderFavs })[tab]();
  }

  /* ---------- Events ---------- */
  $('#fCat').innerHTML += CATS.map(c => `<option>${c}</option>`).join('');
  ['#q', '#fCat', '#fBudget', '#fSort'].forEach(s => $(s).addEventListener('input', renderExplore));

  const dlgOpts = { onAdd: d => { addDest(d.id); toast(`${d.name} added to your trip.`); render(); }, onFav: d => { const on = toggleFav(d.id); render(); return on; }, get added() { return false; } };
  document.addEventListener('click', e => {
    const fav = e.target.closest('[data-fav]');
    if (fav) { e.stopPropagation(); const on = toggleFav(fav.dataset.fav); toast(on ? 'Saved to favourites.' : 'Removed from favourites.'); return render(); }
    const add = e.target.closest('[data-add]');
    if (add) { const id = add.dataset.add; if (isAdded(id)) { removeDest(id); toast('Removed from your trip.'); } else { addDest(id); toast(`${dById(id).name} added to your trip.`); } return render(); }
    const info = e.target.closest('[data-info]') || e.target.closest('.dcard');
    if (info) { const d = dById(info.dataset.info || info.dataset.id); if (d) showDest(d, { ...dlgOpts, added: isAdded(d.id) }); return; }
    const rm = e.target.closest('[data-remove]'); if (rm) { removeDest(rm.dataset.remove); return render(); }
    const day = e.target.closest('[data-day]'); if (day) { T.day = +day.dataset.day; save(); return renderItinerary(); }
    const del = e.target.closest('[data-delact]');
    if (del) { T.itin[T.day] = (T.itin[T.day] || []).filter(a => a.id !== del.dataset.delact); save(); return render(); }
    const spot = e.target.closest('[data-spot]');
    if (spot) { const s = $('#suggest').spots[+spot.dataset.spot]; addAct(s.name, '10:00', s.cost); return; }
    const dc = e.target.closest('[data-delcl]');
    if (dc) { T.custom = T.custom.filter(c => c.id !== dc.dataset.delcl); save(); return render(); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('.dcard')) e.target.click(); });

  $('#tripList').addEventListener('input', e => {
    const id = e.target.dataset.nights; if (!id) return;
    const s = T.selected.find(x => x.id === id); s.nights = clamp(e.target.value, 1, 30, 1); save(); renderSummary();
    $('#allocNote').textContent = `${allocated()} of ${T.days} days assigned`; $('#allocNote').style.color = allocated() !== T.days ? 'var(--warn)' : '';
  });
  const bind = (sel, key, fn) => $(sel).addEventListener('input', e => { T[key] = fn(e.target.value); save(); renderSummary(); if (key === 'days') renderTrip(); });
  bind('#tName', 'name', v => v.slice(0, 50)); bind('#tStart', 'start', v => v);
  bind('#tDays', 'days', v => clamp(v, 1, 30, 5)); bind('#tTrav', 'travelers', v => clamp(v, 1, 20, 1));
  bind('#tFlight', 'flight', v => num(v)); bind('#tBudget', 'budget', v => num(v));
  $('#resetTrip').onclick = () => { if (confirm('Reset all trip details, itinerary and checklist?')) { T = defaults(); save(); render(); toast('Trip reset.'); } };

  function addAct(title, time, cost) {
    (T.itin[T.day] ||= []).push({ id: uid(), title: title.trim().slice(0, 80), time: time || '09:00', cost: num(cost) });
    save(); render();
  }
  $('#actForm').onsubmit = e => {
    e.preventDefault();
    if (!$('#aTitle').value.trim()) return;
    addAct($('#aTitle').value, $('#aTime').value, $('#aCost').value);
    $('#aTitle').value = ''; $('#aCost').value = 0; $('#aTitle').focus();
  };
  $('#clList').addEventListener('change', e => { const k = e.target.dataset.key; if (k) { T.done[k] = e.target.checked; save(); render(); } });
  $('#clForm').onsubmit = e => {
    e.preventDefault(); const t = $('#clText').value.trim(); if (!t) return;
    T.custom.push({ id: 'c' + uid(), text: t.slice(0, 60) }); $('#clText').value = ''; save(); render();
  };
  $('#printBtn').onclick = () => window.print();

  /* ---------- Init (supports ?add=id from the landing page) ---------- */
  const want = new URLSearchParams(location.search).get('add');
  if (want && dById(want)) {
    const first = !isAdded(want); addDest(want); tab = 'trip';
    history.replaceState(null, '', location.pathname);
    setTimeout(() => toast(first ? `${dById(want).name} added to your trip.` : 'Already in your trip.'), 300);
  }
  setTab(tab);
  initReveal();
})();
