const MONO = 'ui-monospace,SFMono-Regular,Menlo,monospace';
const el = (tag, a = {}, txt) => {
  const n = document.createElementNS(document.querySelector('svg').namespaceURI, tag);
  for (const k in a) n.setAttribute(k, a[k]);
  if (txt !== undefined) n.textContent = txt;
  return n;
};
const f1 = (v) => v.toFixed(1);

export function renderSparkline(vals, stroke = '#12324B') {
  const min = Math.min(...vals), span = Math.max(...vals) - min || 1;
  const pts = vals.map((v, i) => [3 + (i / (vals.length - 1)) * 72, 23 - ((v - min) / span) * 20]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)},${f1(y)}`).join(' ');
  const svg = el('svg', { viewBox: '0 0 78 26', class: 'kpi-spark', 'aria-hidden': 'true' });
  svg.append(
    el('path', { d: `${d} L${f1(pts.at(-1)[0])},23 L${f1(pts[0][0])},23 Z`, fill: stroke, 'fill-opacity': '.1' }),
    el('path', { d, fill: 'none', stroke, 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    el('circle', { cx: f1(pts.at(-1)[0]), cy: f1(pts.at(-1)[1]), r: 2.5, fill: stroke }),
  );
  return svg;
}

export const formatVal = (v, unit, plus = false) => `${plus && v > 0 ? '+' : ''}${f1(v)}${unit}`;

export function renderBarChart({ years, values, color = '#12324B', negColor = '#B4382B', reference, activeIndex, onSelect }) {
  const W = 680, H = 206, L = 42, R = 618, T = 20, plotH = 161, plotW = R - L;
  const yMin = -6, yMax = 6, yPos = (v) => T + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const xPos = (i) => L + (plotW / years.length) * (i + 0.5);
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart-svg', role: 'img', 'aria-label': `Mainland GDP ${years[0]}-${years.at(-1)}` });

  for (let v = -6; v <= 6; v += 3) {
    const y = f1(yPos(v)), z = v === 0;
    svg.append(
      el('line', { x1: L, x2: R, y1: y, y2: y, stroke: z ? '#7C8A98' : '#E4E1D8', 'stroke-width': z ? 1.3 : 1, ...(z ? {} : { 'stroke-dasharray': '3,3' }) }),
      el('text', { x: L - 7, y: f1(yPos(v) + 3.8), 'text-anchor': 'end', fill: z ? '#111921' : '#5F6E7D', 'font-size': 11, 'font-weight': z ? 700 : 500, 'font-family': MONO }, `${v}%`),
    );
  }
  if (reference) {
    const ry = yPos(reference.value);
    svg.append(
      el('line', { x1: L, x2: R, y1: f1(ry), y2: f1(ry), stroke: '#A9641B', 'stroke-width': 1.2, 'stroke-dasharray': '5,3' }),
      el('text', { x: R + 5, y: f1(ry + 3.5), fill: '#A9641B', 'font-size': 10, 'font-weight': 700 }, reference.label),
    );
  }
  const zy = yPos(0), bw = Math.min(36, (plotW / years.length) * 0.58);
  values.forEach((v, i) => {
    const cx = xPos(i), vy = yPos(v), top = Math.min(vy, zy), bh = Math.max(2, Math.abs(vy - zy)), sel = i === activeIndex;
    const r = el('rect', { x: f1(cx - bw / 2), y: f1(top), width: f1(bw), height: f1(bh), rx: 2, fill: v < 0 ? negColor : color, 'fill-opacity': sel ? 1 : .82, stroke: sel ? '#111921' : 'none', 'stroke-width': sel ? 1.6 : 0, style: 'cursor:pointer' });
    r.addEventListener('click', () => onSelect(i));
    r.addEventListener('mouseenter', () => onSelect(i));
    svg.append(
      r,
      el('text', { x: f1(cx), y: f1(v >= 0 ? top - 5 : top + bh + 11), 'text-anchor': 'middle', fill: sel ? '#111921' : '#3E4C59', 'font-size': 10.2, 'font-weight': sel || i === values.length - 1 ? 700 : 600, 'font-family': MONO }, formatVal(v, '%', true)),
      el('text', { x: f1(cx), y: H - 8, 'text-anchor': 'middle', fill: sel ? '#111921' : '#5F6E7D', 'font-size': 10.5, 'font-weight': sel ? 700 : 500, 'font-family': MONO }, years[i]),
    );
  });
  return svg;
}
