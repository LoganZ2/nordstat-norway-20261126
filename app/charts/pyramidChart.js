function el(tag, attrs = {}, text) {
  const ns = document.querySelector('svg').namespaceURI;
  const n = document.createElementNS(ns, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (text !== undefined) n.textContent = String(text);
  return n;
}

export function renderPopulationPyramid({ bands, male, female, compareMale = null, compareFemale = null }) {
  const W = 510;
  const rowH = 13.8;
  const padTop = 22;
  const padBottom = 22;
  const centerGap = 44;
  const sidePad = 24;
  const H = padTop + bands.length * rowH + padBottom;
  const halfW = (W - centerGap - sidePad * 2) / 2;
  const leftEdge = sidePad + halfW;
  const rightEdge = leftEdge + centerGap;
  const maxK = 220;

  const svg = el('svg', {
    viewBox: `0 0 ${W} ${H}`,
    class: 'chart-svg',
    role: 'img',
    'aria-label': 'Norway age-sex population pyramid',
  });

  // Column headings
  svg.appendChild(el('text', {
    x: (leftEdge - halfW * 0.5).toFixed(1),
    y: 14,
    'text-anchor': 'middle',
    fill: '#12324B',
    'font-size': '11.5',
    'font-weight': '700',
  }, 'MALE (thousands)'));

  svg.appendChild(el('text', {
    x: (W / 2).toFixed(1),
    y: 14,
    'text-anchor': 'middle',
    fill: '#5F6E7D',
    'font-size': '10.5',
    'font-weight': '700',
  }, 'AGE'));

  svg.appendChild(el('text', {
    x: (rightEdge + halfW * 0.5).toFixed(1),
    y: 14,
    'text-anchor': 'middle',
    fill: '#1B6B5C',
    'font-size': '11.5',
    'font-weight': '700',
  }, 'FEMALE (thousands)'));

  // Vertical reference ticks (0, 100k, 200k)
  [0, 100, 200].forEach((tick) => {
    const dx = (tick / maxK) * halfW;
    [leftEdge - dx, rightEdge + dx].forEach((x) => {
      svg.appendChild(el('line', {
        x1: x.toFixed(1),
        x2: x.toFixed(1),
        y1: padTop - 4,
        y2: H - padBottom,
        stroke: tick === 0 ? '#9AA5B1' : '#E5E2D9',
        'stroke-width': tick === 0 ? '1' : '0.9',
        'stroke-dasharray': tick === 0 ? '' : '3,3',
      }));
    });
    if (tick > 0) {
      svg.appendChild(el('text', {
        x: (leftEdge - dx).toFixed(1),
        y: H - 8,
        'text-anchor': 'middle',
        fill: '#5F6E7D',
        'font-size': '10',
        'font-family': 'ui-monospace, SFMono-Regular, Menlo, monospace',
      }, `${tick}k`));
      svg.appendChild(el('text', {
        x: (rightEdge + dx).toFixed(1),
        y: H - 8,
        'text-anchor': 'middle',
        fill: '#5F6E7D',
        'font-size': '10',
        'font-family': 'ui-monospace, SFMono-Regular, Menlo, monospace',
      }, `${tick}k`));
    }
  });

  // Render rows from oldest (top) to youngest (bottom)
  const n = bands.length;
  for (let idx = 0; idx < n; idx++) {
    const bandIdx = n - 1 - idx;
    const y = padTop + idx * rowH;
    const mVal = male[bandIdx];
    const fVal = female[bandIdx];
    const mW = (mVal / maxK) * halfW;
    const fW = (fVal / maxK) * halfW;

    const isSenior = bandIdx >= 13; // 65+
    const maleFill = isSenior ? '#3A668A' : '#12324B';
    const femaleFill = isSenior ? '#458F80' : '#1B6B5C';

    // Male bar (grows left)
    svg.appendChild(el('rect', {
      x: (leftEdge - mW).toFixed(1),
      y: (y + 1.5).toFixed(1),
      width: mW.toFixed(1),
      height: (rowH - 3.5).toFixed(1),
      rx: '1.5',
      fill: maleFill,
    }));

    // Female bar (grows right)
    svg.appendChild(el('rect', {
      x: rightEdge.toFixed(1),
      y: (y + 1.5).toFixed(1),
      width: fW.toFixed(1),
      height: (rowH - 3.5).toFixed(1),
      rx: '1.5',
      fill: femaleFill,
    }));

    // Optional 2005 ghost comparison outline
    if (compareMale && compareFemale) {
      const cmW = (compareMale[bandIdx] / maxK) * halfW;
      const cfW = (compareFemale[bandIdx] / maxK) * halfW;
      svg.appendChild(el('rect', {
        x: (leftEdge - cmW).toFixed(1),
        y: (y + 2).toFixed(1),
        width: cmW.toFixed(1),
        height: (rowH - 4.5).toFixed(1),
        fill: 'none',
        stroke: '#B4382B',
        'stroke-width': '1.1',
        'stroke-dasharray': '2,1.5',
      }));
      svg.appendChild(el('rect', {
        x: rightEdge.toFixed(1),
        y: (y + 2).toFixed(1),
        width: cfW.toFixed(1),
        height: (rowH - 4.5).toFixed(1),
        fill: 'none',
        stroke: '#B4382B',
        'stroke-width': '1.1',
        'stroke-dasharray': '2,1.5',
      }));
    }

    // Center age label
    svg.appendChild(el('text', {
      x: (W / 2).toFixed(1),
      y: (y + rowH - 4).toFixed(1),
      'text-anchor': 'middle',
      fill: bandIdx === 13 ? '#B4382B' : '#3E4C59',
      'font-size': '10',
      'font-weight': bandIdx === 13 ? '700' : '500',
      'font-family': 'ui-monospace, SFMono-Regular, Menlo, monospace',
    }, bands[bandIdx]));
  }

  // 65+ divider marker line with crisp pill label in clear upper-left margin
  const seniorLineY = padTop + (n - 13) * rowH;
  svg.appendChild(el('line', {
    x1: sidePad,
    x2: W - sidePad,
    y1: seniorLineY.toFixed(1),
    y2: seniorLineY.toFixed(1),
    stroke: '#B4382B',
    'stroke-width': '1',
    'stroke-dasharray': '4,3',
  }));
  svg.appendChild(el('rect', {
    x: sidePad,
    y: (padTop + 4).toFixed(1),
    width: '96',
    height: '15',
    rx: '2',
    fill: '#FBF1EF',
    stroke: '#E4B8B2',
    'stroke-width': '0.8',
  }));
  svg.appendChild(el('text', {
    x: sidePad + 6,
    y: (padTop + 14.5).toFixed(1),
    fill: '#B4382B',
    'font-size': '9.5',
    'font-weight': '700',
  }, '65+ senior cohort'));

  return svg;
}
