function el(tag, attrs = {}, text) {
  const ns = document.querySelector('svg').namespaceURI;
  const n = document.createElementNS(ns, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (text !== undefined) n.textContent = String(text);
  return n;
}

const SCALE_NAVY = ['#D4E3EE', '#A4C3DA', '#6D9CC0', '#386F9A', '#12324B'];

function shadeFor(val, min, max) {
  const ratio = max === min ? 0.5 : (val - min) / (max - min);
  const idx = Math.min(SCALE_NAVY.length - 1, Math.max(0, Math.floor(ratio * SCALE_NAVY.length)));
  return SCALE_NAVY[idx];
}

export function renderNorwayMap({ regions, metricKey, selectedCode, onSelect }) {
  const vals = regions.map((r) => r[metricKey]);
  const min = Math.min(...vals);
  const max = Math.max(...vals);

  const svg = el('svg', {
    viewBox: '0 0 225 316',
    class: 'chart-svg',
    role: 'img',
    'aria-label': 'Interactive NUTS-2 regional choropleth map of Norway',
  });

  // Subtle North Sea / Norwegian Sea backdrop caption
  svg.appendChild(el('text', {
    x: 12,
    y: 42,
    fill: '#8C9BA8',
    'font-size': '9',
    'letter-spacing': '0.12em',
    'font-style': 'italic',
  }, 'NORWEGIAN SEA'));

  svg.appendChild(el('text', {
    x: 12,
    y: 54,
    fill: '#687785',
    'font-size': '8.5',
    'font-family': 'ui-monospace, SFMono-Regular, Menlo, monospace',
  }, 'NUTS-2 · 7 Regions'));

  regions.forEach((region) => {
    const selected = region.code === selectedCode;
    const fill = shadeFor(region[metricKey], min, max);
    const path = el('path', {
      d: region.path,
      fill,
      stroke: selected ? '#111921' : '#FFFFFF',
      'stroke-width': selected ? '2.2' : '1.3',
      class: `region-path ${selected ? 'is-selected' : ''}`,
      tabindex: '0',
      role: 'button',
      'aria-label': `${region.name}: ${region.population.toLocaleString()} residents`,
    });

    const handleSelect = () => onSelect(region.code);
    path.addEventListener('click', handleSelect);
    path.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect();
      }
    });
    svg.appendChild(path);
  });

  // Region code callouts
  regions.forEach((region) => {
    const selected = region.code === selectedCode;
    const [lx, ly] = region.labelPos;
    const textFill = selected ? '#111921' : '#243240';
    if (selected) {
      svg.appendChild(el('rect', {
        x: (lx - 17).toFixed(1),
        y: (ly - 9).toFixed(1),
        width: '34',
        height: '13',
        rx: '2',
        fill: '#FFFFFF',
        'fill-opacity': '0.92',
        stroke: '#111921',
        'stroke-width': '0.8',
      }));
    }
    const lbl = el('text', {
      x: lx.toFixed(1),
      y: (ly + 1).toFixed(1),
      'text-anchor': 'middle',
      fill: textFill,
      'font-size': '8.5',
      'font-weight': '700',
      'font-family': 'ui-monospace, SFMono-Regular, Menlo, monospace',
      style: 'pointer-events:none',
    }, region.code);
    svg.appendChild(lbl);
  });

  // Compact bottom choropleth legend
  const legendY = 298;
  svg.appendChild(el('text', {
    x: 118,
    y: legendY - 5,
    fill: '#5F6E7D',
    'font-size': '8.5',
    'font-weight': '700',
  }, 'Low → High'));
  SCALE_NAVY.forEach((c, i) => {
    svg.appendChild(el('rect', {
      x: 118 + i * 19,
      y: legendY,
      width: 18,
      height: 7,
      fill: c,
      stroke: '#FFFFFF',
      'stroke-width': '0.6',
    }));
  });

  return svg;
}
