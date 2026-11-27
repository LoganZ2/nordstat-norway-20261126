const MONO = 'ui-monospace,SFMono-Regular,Menlo,monospace';
const SCALE = ['#DCE8F1', '#ACC8DE', '#74A1C4', '#3D739E', '#12324B'];

function el(tag, attrs = {}, text) {
  const n = document.createElementNS(document.querySelector('svg').namespaceURI, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (text !== undefined) n.textContent = String(text);
  return n;
}

function shadeFor(val, min, max) {
  const t = max === min ? 0.5 : (val - min) / (max - min);
  return SCALE[Math.min(SCALE.length - 1, Math.max(0, Math.floor(t * SCALE.length)))];
}

export function renderNorwayMap({ counties, metricKey, selectedCode, compareCode, onSelect }) {
  const vals = counties.map((c) => c[metricKey]);
  const min = Math.min(...vals), max = Math.max(...vals);

  const svg = el('svg', {
    viewBox: '0 0 242 308',
    class: 'chart-svg',
    role: 'img',
    'aria-label': 'Interactive 15-county choropleth map of Norway',
  });

  // Subtle sea framing & label
  svg.appendChild(el('text', { x: 10, y: 120, fill: '#94A2AF', 'font-size': '8', 'letter-spacing': '0.12em', 'font-style': 'italic' }, 'NORWEGIAN SEA'));
  svg.appendChild(el('text', { x: 10, y: 131, fill: '#687785', 'font-size': '8', 'font-family': MONO }, '15 Fylker (2025)'));

  // Render all 15 counties
  counties.forEach((c) => {
    const isSel = c.code === selectedCode;
    const isCmp = c.code === compareCode;
    const fill = shadeFor(c[metricKey], min, max);
    const stroke = isSel ? '#111921' : isCmp ? '#B4382B' : '#FFFFFF';
    const sw = isSel ? '2' : isCmp ? '1.8' : '0.9';
    const p = el('path', {
      d: c.path, fill, stroke, 'stroke-width': sw, class: 'region-path',
      tabindex: '0', role: 'button', 'aria-label': `${c.name}: ${c.population.toLocaleString()} residents`,
    });
    const pick = () => onSelect(c.code);
    p.addEventListener('click', pick);
    p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    svg.appendChild(p);
  });

  // Crisp non-overlapping county code labels on main map
  counties.forEach((c) => {
    if (!c.label) return;
    const [lx, ly] = c.label;
    const dark = (c[metricKey] - min) / (max - min || 1) > 0.56;
    const isSel = c.code === selectedCode;
    const isCmp = c.code === compareCode;
    svg.appendChild(el('text', {
      x: lx, y: ly, 'text-anchor': 'middle',
      fill: dark ? '#FFFFFF' : isSel ? '#111921' : isCmp ? '#8B2217' : '#1E2D3B',
      'font-size': '7.6', 'font-weight': '700', 'font-family': MONO, style: 'pointer-events:none',
    }, c.code));
  });

  // Dedicated Oslo & Akershus Zoom Inset Box (upper-left clean space)
  const oslo = counties.find((c) => c.code === '03');
  const aker = counties.find((c) => c.code === '32');
  svg.appendChild(el('rect', { x: 8, y: 8, width: 92, height: 78, rx: '3', fill: '#FFFFFF', stroke: '#C8C3B6', 'stroke-width': '1' }));
  svg.appendChild(el('text', { x: 14, y: 20, fill: '#12324B', 'font-size': '7.6', 'font-weight': '700', 'font-family': MONO }, 'OSLO INSET'));

  // Akershus inset shape (cleanly above bottom caption)
  const akPath = el('path', {
    d: 'M24,26 L72,26 L82,45 L74,66 L52,66 L48,54 L60,47 L43,41 L32,52 L20,42 Z',
    fill: shadeFor(aker[metricKey], min, max),
    stroke: aker.code === selectedCode ? '#111921' : aker.code === compareCode ? '#B4382B' : '#FFFFFF',
    'stroke-width': aker.code === selectedCode || aker.code === compareCode ? '1.9' : '1',
    class: 'region-path', tabindex: '0', role: 'button', 'aria-label': 'Akershus county inset',
  });
  akPath.addEventListener('click', () => onSelect('32'));
  svg.appendChild(akPath);

  // Oslo inset shape
  const osPath = el('path', {
    d: 'M43,41 L60,47 L51,58 L34,54 Z',
    fill: shadeFor(oslo[metricKey], min, max),
    stroke: oslo.code === selectedCode ? '#111921' : oslo.code === compareCode ? '#B4382B' : '#FFFFFF',
    'stroke-width': oslo.code === selectedCode || oslo.code === compareCode ? '2' : '1',
    class: 'region-path', tabindex: '0', role: 'button', 'aria-label': 'Oslo county inset',
  });
  osPath.addEventListener('click', () => onSelect('03'));
  svg.appendChild(osPath);

  const osDark = (oslo[metricKey] - min) / (max - min || 1) > 0.55;
  const akDark = (aker[metricKey] - min) / (max - min || 1) > 0.55;
  svg.appendChild(el('text', { x: 47, y: 52, 'text-anchor': 'middle', fill: osDark ? '#FFF' : '#111921', 'font-size': '7.6', 'font-weight': '700', 'font-family': MONO, style: 'pointer-events:none' }, '03'));
  svg.appendChild(el('text', { x: 64, y: 37, 'text-anchor': 'middle', fill: akDark ? '#FFF' : '#111921', 'font-size': '7.6', 'font-weight': '700', 'font-family': MONO, style: 'pointer-events:none' }, '32'));
  svg.appendChild(el('text', { x: 14, y: 79, fill: '#5F6E7D', 'font-size': '7.2', 'font-family': MONO }, '03 Oslo · 32 Aker.'));

  // Subtle dashed pointer from Oslo inset to Oslofjord
  svg.appendChild(el('line', { x1: 96, y1: 84, x2: 101, y2: 242, stroke: '#B9B3A4', 'stroke-width': '0.8', 'stroke-dasharray': '2,2' }));

  // Compact Legend (bottom-right)
  const ly = 292;
  svg.appendChild(el('text', { x: 136, y: ly - 15, fill: '#111921', 'font-size': '7.6', 'font-weight': '700' }, '■ Selected'));
  svg.appendChild(el('text', { x: 186, y: ly - 15, fill: '#B4382B', 'font-size': '7.6', 'font-weight': '700' }, '■ Compare'));
  svg.appendChild(el('text', { x: 136, y: ly - 4, fill: '#5F6E7D', 'font-size': '7.6', 'font-weight': '700' }, 'Low → High'));
  SCALE.forEach((c, i) => {
    svg.appendChild(el('rect', { x: 136 + i * 19, y: ly, width: 18, height: 7, fill: c, stroke: '#FFF', 'stroke-width': '0.6' }));
  });

  return svg;
}
