'use strict';
// Inline SVG icon sprite (24×24, stroke icons). Use ic('name') in templates or <svg class="i"><use href="#i-name"/></svg> in HTML.
const ICON_PATHS = {
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  search: '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.3-4.3"/>',
  heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>',
  printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-1.8 5.4a2 2 0 0 1-1.2 1.2l-5.4 1.8 1.8-5.4a2 2 0 0 1 1.2-1.2z"/>',
  bag: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/>',
  map: '<path d="M14.1 5.6a2 2 0 0 0 1.8 0l3.7-1.8A1 1 0 0 1 21 4.6v12.8a1 1 0 0 1-.6.9l-4.5 2.3a2 2 0 0 1-1.8 0l-4.2-2.1a2 2 0 0 0-1.8 0l-3.7 1.8A1 1 0 0 1 3 19.4V6.6a1 1 0 0 1 .6-.9l4.5-2.3a2 2 0 0 1 1.8 0z"/><path d="M15 5.8v15M9 3.2v15"/>',
  'list-checks': '<path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.500 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.500-1.200 6.200-2.700a1.200 1.200 0 0 1 1.500 0C14.500 3.800 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
  utensils: '<path d="M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3zm0 0v7"/>',
  bus: '<path d="M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.700.8-2.800c.1-.4.2-.8.2-1.200 0-.4-.1-.8-.2-1.200l-1.400-5C20.100 6.800 19.100 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>',
  ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2zM13 5v2M13 11v2M13 17v2"/>',
  buoy: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.900 4.900 4.200 4.200M14.800 9.200l4.200-4.200M14.800 14.800l4.200 4.200M9.200 14.800l-4.200 4.200"/>',
  dollar: '<path d="M12 2v20M17 5H9.500a3.500 3.500 0 0 0 0 7h5a3.500 3.500 0 0 1 0 7H6"/>',
  camera: '<path d="M14.500 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.100-3.100a2 2 0 0 0-2.800 0L6 21"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  alert: '<path d="m21.700 18-8-14a2 2 0 0 0-3.500 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.700-3zM12 9v4M12 17h.01"/>',
  // category / destination icons
  umbrella: '<path d="M22 12a10 10 0 0 0-20 0z"/><path d="M12 12v8a2 2 0 0 0 4 0M12 2v1"/>',
  building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18zM6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4"/>',
  mountain: '<path d="m8 3 4 8 5-5 5 15H2z"/>',
  landmark: '<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4z"/>',
  tree: '<path d="M12 2 5 12h4l-3 5h12l-3-5h4zM12 17v5"/>',
  tower: '<path d="M12 2v3M10.500 8 12 5l1.500 3M10 8h4l1 6h-6zM9 14l-2 8M15 14l2 8M8 22h8M9.500 18h5"/>',
  torii: '<path d="M2 5c3 1.500 17 1.500 20 0M5 9h14M6 6v16M18 6v16M12 9v4"/>',
  droplets: '<path d="M7 16.300c2.200 0 4-1.800 4-4 0-1.200-.6-2.300-1.700-3.200S7.300 6.800 7 5.300c-.3 1.500-1.100 2.800-2.300 3.800S3 11.100 3 12.300c0 2.200 1.800 4 4 4z"/><path d="M12.600 6.600A11 11 0 0 0 14 3c.5 2.500 2 4.900 4 6.500s3 3.500 3 5.500a7 7 0 0 1-11.900 5"/>',
  sunset: '<path d="M12 10V2M4.900 10.900l1.400 1.400M2 18h2M20 18h2M19.100 10.900l-1.400 1.400M22 22H2M16 6l-4 4-4-4M16 18a4 4 0 0 0-8 0"/>',
  waves: '<path d="M2 6c.6.500 1.200 1 2.500 1C7 7 7 5 9.500 5c2.600 0 2.400 2 5 2 2.500 0 2.500-2 5-2 1.300 0 1.900.5 2.500 1M2 12c.6.500 1.200 1 2.500 1 2.500 0 2.500-2 5-2 2.600 0 2.400 2 5 2 2.500 0 2.500-2 5-2 1.300 0 1.900.5 2.500 1M2 18c.6.500 1.200 1 2.500 1 2.500 0 2.500-2 5-2 2.600 0 2.400 2 5 2 2.500 0 2.500-2 5-2 1.300 0 1.900.5 2.500 1"/>',
  tent: '<path d="M3.500 21 14 3M20.500 21 10 3M15.500 21 12 15l-3.500 6M2 21h20"/>',
  pyramid: '<path d="M12 3 2.500 20h19zM12 3v17"/>',
  snowflake: '<path d="M2 12h20M12 2v20M4.900 4.900l14.200 14.200M19.100 4.900 4.900 19.100"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M6.300 17.700l-1.400 1.400M19.100 4.900l-1.400 1.400"/>'
};
const CAT_ICON = { Beach: 'umbrella', City: 'building', Adventure: 'mountain', Culture: 'landmark', Nature: 'tree' };
const ic = (name, cls = '') => `<svg class="i ${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
(function injectSprite() {
  const s = document.createElement('div');
  s.style.display = 'none'; s.setAttribute('aria-hidden', 'true');
  s.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"><defs>${Object.entries(ICON_PATHS).map(([n, p]) => `<symbol id="i-${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</symbol>`).join('')}</defs></svg>`;
  document.body.prepend(s);
})();
