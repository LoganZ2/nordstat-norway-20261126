import { formatVal } from './lineChart.js';

const MONO = 'ui-monospace,SFMono-Regular,Menlo,monospace';
function el(tag, attrs = {}, txt) {
  const n = document.createElementNS(document.querySelector('svg').namespaceURI, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (txt !== undefined) n.textContent = String(txt);
  return n;
}

export function renderLineSeries({ years, values, unit, color = '#12324B', reference = null, activeIndex, onSelect }) {
  const W = 680, H = 206, m = { t: 20, r: 62, b: 25, l: 42 };
  const plotW = W - m.l - m.r, plotH = H - m.t - m.b;
  const all = reference ? [...values, reference.value] : values;
  let minV = Math.min(...all), maxV = Math.max(...all);
  if (minV > 0 && minV < maxV * 0.45) minV = 0;
  const step = [0.5, 1, 2, 2.5, 3, 5, 10, 20].find((s) => (maxV + (maxV - minV || 1) * 0.14 - minV) / s <= 4.5) || 2;
  const yMin = Math.floor(minV / step) * step;
  const yMax = Math.ceil((maxV + (maxV - minV || 1) * 0.14) / step) * step;
  const ySpan = yMax - yMin || 1;
  const yPos = (v) => m.t + plotH - ((v - yMin) / ySpan) * plotH;
  const xPos = (i) => m.l + (i / Math.max(1, years.length - 1)) * plotW;

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart-svg', role: 'img', 'aria-label': `Series ${years[0]} to ${years.at(-1)}` });

  for (let v = yMin; v <= yMax + step * 0.01; v += step) {
    const cv = Math.round(v * 100) / 100, y = yPos(cv);
    svg.appendChild(el('line', { x1: m.l, x2: W - m.r, y1: y.toFixed(1), y2: y.toFixed(1), stroke: '#E4E1D8', 'stroke-width': '1', 'stroke-dasharray': '3,3' }));
    svg.appendChild(el('text', { x: m.l - 7, y: (y + 3.8).toFixed(1), 'text-anchor': 'end', fill: '#5F6E7D', 'font-size': '11', 'font-family': MONO }, `${Number.isInteger(cv) ? cv : cv.toFixed(1)}${unit.trim() === '%' ? '%' : ''}`));
  }

  if (reference && reference.value >= yMin && reference.value <= yMax) {
    const ry = yPos(reference.value);
    svg.appendChild(el('line', { x1: m.l, x2: W - m.r, y1: ry.toFixed(1), y2: ry.toFixed(1), stroke: '#A9641B', 'stroke-width': '1.2', 'stroke-dasharray': '5,3' }));
    svg.appendChild(el('text', { x: W - m.r + 5, y: (ry + 3.5).toFixed(1), fill: '#A9641B', 'font-size': '10', 'font-weight': '700' }, reference.label));
  }

  const pts = values.map((v, i) => [xPos(i), yPos(v)]);
  const ld = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  svg.appendChild(el('path', { d: `${ld} L${pts.at(-1)[0].toFixed(1)},${yPos(yMin).toFixed(1)} L${pts[0][0].toFixed(1)},${yPos(yMin).toFixed(1)} Z`, fill: color, 'fill-opacity': '.09' }));
  svg.appendChild(el('path', { d: ld, fill: 'none', stroke: color, 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  svg.appendChild(el('line', { x1: pts[activeIndex][0].toFixed(1), x2: pts[activeIndex][0].toFixed(1), y1: m.t, y2: m.t + plotH, stroke: '#CBD2D9', 'stroke-width': '1', 'stroke-dasharray': '2,2' }));

  let peak = 0;
  values.forEach((v, i) => { if (v > values[peak]) peak = i; });
  pts.forEach(([x, y], i) => {
    const sel = i === activeIndex;
    const dot = el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: sel ? '5' : '3.2', fill: sel ? color : '#FFF', stroke: color, 'stroke-width': sel ? '2.2' : '1.8', style: 'cursor:pointer' });
    dot.addEventListener('click', () => onSelect(i));
    dot.addEventListener('mouseenter', () => onSelect(i));
    svg.appendChild(dot);
    if (i === peak && i > 0 && i < pts.length - 1) svg.appendChild(el('text', { x: x.toFixed(1), y: (y - 8).toFixed(1), 'text-anchor': 'middle', fill: color, 'font-size': '10.5', 'font-weight': '700', 'font-family': MONO }, `Peak ${formatVal(values[i], unit)}`));
    if (i === pts.length - 1) svg.appendChild(el('text', { x: (x + 7).toFixed(1), y: (y + 3.8).toFixed(1), 'text-anchor': 'start', fill: color, 'font-size': '11.5', 'font-weight': '700', 'font-family': MONO }, formatVal(values[i], unit)));
  });

  years.forEach((yr, i) => svg.appendChild(el('text', { x: xPos(i).toFixed(1), y: H - 8, 'text-anchor': 'middle', fill: i === activeIndex ? '#111921' : '#5F6E7D', 'font-size': '10.5', 'font-weight': i === activeIndex ? '700' : '500', 'font-family': MONO }, yr)));
  return svg;
}
