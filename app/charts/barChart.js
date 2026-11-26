function el(tag, attrs = {}, text) {
  const ns = document.querySelector('svg').namespaceURI;
  const n = document.createElementNS(ns, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (text !== undefined) n.textContent = String(text);
  return n;
}

export function renderHorizontalBars({ items, valueKey, unit = '%', maxVal, refLine = null }) {
  const rowH = 24.5;
  const padTop = 16;
  const padBottom = 8;
  const labelW = 148;
  const valW = 58;
  const W = 540;
  const H = padTop + items.length * rowH + padBottom;
  const plotW = W - labelW - valW - 12;
  const ceiling = maxVal || Math.max(...items.map((d) => d[valueKey]), 1) * 1.08;

  const svg = el('svg', {
    viewBox: `0 0 ${W} ${H}`,
    class: 'chart-svg',
    role: 'img',
    'aria-label': 'Horizontal statistical bar chart',
  });

  if (refLine !== null && refLine.value <= ceiling) {
    const rx = labelW + (refLine.value / ceiling) * plotW;
    svg.appendChild(el('line', {
      x1: rx.toFixed(1),
      x2: rx.toFixed(1),
      y1: 12,
      y2: H - 6,
      stroke: '#B4382B',
      'stroke-width': '1.2',
      'stroke-dasharray': '4,3',
    }));
    svg.appendChild(el('text', {
      x: (rx + 4).toFixed(1),
      y: 11,
      fill: '#B4382B',
      'font-size': '10',
      'font-weight': '700',
    }, refLine.label));
  }

  items.forEach((item, i) => {
    const y = padTop + i * rowH;
    const val = item[valueKey];
    const barW = Math.max(2, (val / ceiling) * plotW);

    svg.appendChild(el('text', {
      x: labelW - 8,
      y: y + 14,
      'text-anchor': 'end',
      fill: '#243240',
      'font-size': '11.5',
      'font-weight': i < 3 ? '700' : '500',
    }, item.short));

    svg.appendChild(el('rect', {
      x: labelW,
      y: y + 3,
      width: plotW,
      height: 15,
      rx: '2',
      fill: '#F1EFE8',
    }));

    svg.appendChild(el('rect', {
      x: labelW,
      y: y + 3,
      width: barW.toFixed(1),
      height: 15,
      rx: '2',
      fill: item.color || '#12324B',
      'fill-opacity': '0.9',
    }));

    const formatted = unit === ' pp' ? `+${val.toFixed(2)} pp` : `${val.toFixed(1)}${unit}`;
    svg.appendChild(el('text', {
      x: labelW + plotW + 8,
      y: y + 14,
      'text-anchor': 'start',
      fill: '#111921',
      'font-size': '11.5',
      'font-weight': '700',
      'font-family': 'ui-monospace, SFMono-Regular, Menlo, monospace',
    }, formatted));
  });

  return svg;
}
