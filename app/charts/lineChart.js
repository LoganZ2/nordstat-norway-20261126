function el(tag, attrs = {}, textContent) {
  const ns = document.querySelector('svg').namespaceURI;
  const node = document.createElementNS(ns, tag);
  for (const [k, v] of Object.entries(attrs)) {
    node.setAttribute(k, String(v));
  }
  if (textContent !== undefined) node.textContent = String(textContent);
  return node;
}

export function renderSparkline(values, color = '#12324B') {
  const w = 84;
  const h = 28;
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return [x, y];
  });

  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${d} L${pts[pts.length - 1][0].toFixed(1)},${h - pad} L${pts[0][0].toFixed(1)},${h - pad} Z`;

  const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, class: 'kpi-spark', 'aria-hidden': 'true' });
  svg.appendChild(el('path', { d: area, fill: color, 'fill-opacity': '0.10' }));
  svg.appendChild(el('path', { d, fill: 'none', stroke: color, 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  const last = pts[pts.length - 1];
  svg.appendChild(el('circle', { cx: last[0].toFixed(1), cy: last[1].toFixed(1), r: '2.6', fill: color }));
  return svg;
}

export function formatVal(value, unit, showPlus = false) {
  const prefix = showPlus && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}${unit}`;
}

export function renderEditorialChart({
  years,
  values,
  unit,
  kind = 'line',
  color = '#12324B',
  negColor = '#B4382B',
  reference = null,
  activeIndex,
  onSelect,
}) {
  const W = 680;
  const H = 224;
  const m = { top: 22, right: 56, bottom: 28, left: 44 };
  const plotW = W - m.left - m.right;
  const plotH = H - m.top - m.bottom;

  const allVals = reference ? [...values, reference.value] : [...values];
  let minVal = Math.min(...allVals);
  let maxVal = Math.max(...allVals);
  if (kind === 'bar') {
    minVal = Math.min(minVal, 0);
    maxVal = Math.max(maxVal, 0);
  } else if (minVal > 0 && minVal < maxVal * 0.45) {
    minVal = 0;
  }

  // Compute crisp, human-friendly rounded Y-axis bounds and tick steps
  const rawMin = kind === 'bar' && minVal < 0 ? minVal - 1.0 : minVal;
  const rawMax = maxVal + (maxVal - minVal || 1) * 0.14;
  const rawRange = rawMax - rawMin || 1;
  const niceSteps = [0.5, 1, 2, 2.5, 3, 5, 10, 20];
  const step = niceSteps.find((s) => rawRange / s <= 4.5) || Math.ceil(rawRange / 4);
  const yMin = kind === 'bar' && minVal === 0 ? 0 : Math.floor(rawMin / step) * step;
  const yMax = Math.ceil(rawMax / step) * step;
  const ySpan = yMax - yMin || 1;

  const yPos = (v) => m.top + plotH - ((v - yMin) / ySpan) * plotH;
  const xPos = (i) => {
    if (kind === 'bar') {
      const slot = plotW / years.length;
      return m.left + slot * i + slot / 2;
    }
    return m.left + (i / Math.max(1, years.length - 1)) * plotW;
  };

  const svg = el('svg', {
    viewBox: `0 0 ${W} ${H}`,
    class: 'chart-svg',
    role: 'img',
    'aria-label': `Time series from ${years[0]} to ${years[years.length - 1]}`,
  });

  // Grid ticks on exact nice intervals
  for (let val = yMin; val <= yMax + step * 0.01; val += step) {
    const cleanVal = Math.round(val * 100) / 100;
    const y = yPos(cleanVal);
    const isZero = Math.abs(cleanVal) < 0.001;
    svg.appendChild(el('line', {
      x1: m.left,
      x2: W - m.right,
      y1: y.toFixed(1),
      y2: y.toFixed(1),
      stroke: isZero ? '#7C8A98' : '#E4E1D8',
      'stroke-width': isZero ? '1.3' : '1',
      'stroke-dasharray': isZero ? '' : '3,3',
    }));
    const lbl = Number.isInteger(cleanVal) ? String(cleanVal) : cleanVal.toFixed(1);
    svg.appendChild(el('text', {
      x: m.left - 8,
      y: (y + 4).toFixed(1),
      'text-anchor': 'end',
      fill: isZero ? '#111921' : '#5F6E7D',
      'font-size': '11',
      'font-weight': isZero ? '700' : '500',
      'font-family': 'ui-monospace, SFMono-Regular, Menlo, monospace',
    }, `${lbl}${unit.trim() === '%' ? '%' : ''}`));
  }

  // Reference threshold line (e.g., 2.0% inflation target)
  if (reference && reference.value >= yMin && reference.value <= yMax && reference.value !== 0) {
    const ry = yPos(reference.value);
    svg.appendChild(el('line', {
      x1: m.left,
      x2: W - m.right,
      y1: ry.toFixed(1),
      y2: ry.toFixed(1),
      stroke: '#6D7A88',
      'stroke-width': '1.2',
      'stroke-dasharray': '5,4',
    }));
    svg.appendChild(el('text', {
      x: m.left + 6,
      y: (ry - 5).toFixed(1),
      fill: '#4A5563',
      'font-size': '10.5',
      'font-weight': '600',
    }, reference.label));
  }

  // Draw bars or line + subtle area
  if (kind === 'bar') {
    const zeroY = yPos(0);
    const barW = Math.min(38, (plotW / years.length) * 0.58);
    values.forEach((v, i) => {
      const cx = xPos(i);
      const vy = yPos(v);
      const top = Math.min(vy, zeroY);
      const bh = Math.max(2, Math.abs(vy - zeroY));
      const isSelected = i === activeIndex;
      const fill = v < 0 ? negColor : color;

      const rect = el('rect', {
        x: (cx - barW / 2).toFixed(1),
        y: top.toFixed(1),
        width: barW.toFixed(1),
        height: bh.toFixed(1),
        rx: '2',
        fill,
        'fill-opacity': isSelected ? '1' : '0.82',
        stroke: isSelected ? '#111921' : 'none',
        'stroke-width': isSelected ? '1.6' : '0',
        style: 'cursor:pointer',
      });
      rect.addEventListener('click', () => onSelect(i));
      rect.addEventListener('mouseenter', () => onSelect(i));
      svg.appendChild(rect);

      // Direct editorial value label on every bar
      svg.appendChild(el('text', {
        x: cx.toFixed(1),
        y: (v >= 0 ? top - 6 : top + bh + 12).toFixed(1),
        'text-anchor': 'middle',
        fill: isSelected ? '#111921' : '#3E4C59',
        'font-size': '10.5',
        'font-weight': isSelected || i === values.length - 1 ? '700' : '600',
        'font-family': 'ui-monospace, SFMono-Regular, Menlo, monospace',
      }, formatVal(v, '%', true)));
    });
  } else {
    const pts = values.map((v, i) => [xPos(i), yPos(v)]);
    const lineD = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const baseY = yPos(yMin);
    const areaD = `${lineD} L${pts[pts.length - 1][0].toFixed(1)},${baseY.toFixed(1)} L${pts[0][0].toFixed(1)},${baseY.toFixed(1)} Z`;

    svg.appendChild(el('path', { d: areaD, fill: color, 'fill-opacity': '0.09' }));
    svg.appendChild(el('path', {
      d: lineD,
      fill: 'none',
      stroke: color,
      'stroke-width': '2.5',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }));

    // Highlight active vertical guide
    const [ax, ay] = pts[activeIndex];
    svg.appendChild(el('line', {
      x1: ax.toFixed(1),
      x2: ax.toFixed(1),
      y1: m.top,
      y2: m.top + plotH,
      stroke: '#CBD2D9',
      'stroke-width': '1',
      'stroke-dasharray': '2,2',
    }));

    // Identify peak index to annotate cleanly without colliding with end label
    let peakIdx = 0;
    values.forEach((v, i) => { if (v > values[peakIdx]) peakIdx = i; });

    pts.forEach(([x, y], i) => {
      const isSelected = i === activeIndex;
      const isEnd = i === pts.length - 1;
      const dot = el('circle', {
        cx: x.toFixed(1),
        cy: y.toFixed(1),
        r: isSelected ? '5.2' : '3.4',
        fill: isSelected ? color : '#FFFFFF',
        stroke: color,
        'stroke-width': isSelected ? '2.2' : '1.8',
        style: 'cursor:pointer',
      });
      dot.addEventListener('click', () => onSelect(i));
      dot.addEventListener('mouseenter', () => onSelect(i));
      svg.appendChild(dot);

      // Direct peak callout (if peak is not last or second-to-last)
      if (i === peakIdx && i < pts.length - 1 && i > 0) {
        svg.appendChild(el('text', {
          x: x.toFixed(1),
          y: (y - 9).toFixed(1),
          'text-anchor': 'middle',
          fill: color,
          'font-size': '11',
          'font-weight': '700',
          'font-family': 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }, `Peak ${formatVal(values[i], unit)}`));
      }

      // Direct right-edge end annotation (FT / OWID signature!)
      if (isEnd) {
        svg.appendChild(el('text', {
          x: (x + 8).toFixed(1),
          y: (y + 4).toFixed(1),
          'text-anchor': 'start',
          fill: color,
          'font-size': '12',
          'font-weight': '700',
          'font-family': 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }, formatVal(values[i], unit)));
      }
    });
  }

  // X-axis year labels
  years.forEach((yr, i) => {
    svg.appendChild(el('text', {
      x: xPos(i).toFixed(1),
      y: H - 10,
      'text-anchor': 'middle',
      fill: i === activeIndex ? '#111921' : '#5F6E7D',
      'font-size': '11',
      'font-weight': i === activeIndex ? '700' : '500',
      'font-family': 'ui-monospace, SFMono-Regular, Menlo, monospace',
    }, String(yr)));
  });

  return svg;
}
