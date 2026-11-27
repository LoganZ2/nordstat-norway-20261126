import { YEARS_ANNUAL, HEADLINE_KPIS, SERIES_TABS, GDP_SERIES, LATEST_BULLETINS } from '../data/headline.js';
import { renderSparkline, renderBarChart, formatVal } from '../charts/lineChart.js';

const TONE = { crimson: '#B4382B', teal: '#1B6B5C', ochre: '#A9641B', navy: '#12324B' };

export function renderOverview(root) {
  let key = 'gdp', range = '10y', year = 2025, extra = null, lineMod = null;

  root.innerHTML = `<section class="page-header"><div><div class="kicker">National Statistical Compendium · Kingdom of Norway</div><h1 class="page-title">Norway at a Glance: Economy, Prices &amp; Society</h1><p class="page-lead">Verified annual accounts, consumer inflation, labour benchmarks, and county demographics reconciled to Statistics Norway &amp; Norges Bank tables.</p></div><div class="header-stamp"><strong>Edition: FY 2025 / Q4</strong><span>5,627,429 residents · Nominal GDP NOK 5,511 bn</span></div></section><section class="kpi-grid" aria-label="Headline indicators"></section><div class="grid-editorial"><section class="panel" id="ov-chart"></section><aside class="panel"><div class="panel-head" style="margin-bottom:6px"><div><h2 class="panel-title">Latest Statistical Releases</h2><p class="panel-sub">Verified 2025 annual &amp; Q4 headline bulletins</p></div><a href="#/releases" style="font-size:11.5px;font-weight:600;white-space:nowrap">Calendar &rarr;</a></div><ul class="bulletin-list">${LATEST_BULLETINS.map(([tag, dt, t, s, r]) => `<li class="bulletin-item"><div class="bulletin-meta"><span class="tag-pill">${tag}</span><span class="mono">${dt}</span></div><a class="bulletin-title" href="${r}">${t}</a><p class="bulletin-summary">${s}</p></li>`).join('')}</ul></aside></div><nav class="portal-index" aria-label="Portal tools"><span class="mono" style="color:#5F6E7D">5 Verified Sections · 15 Counties · 1990–2025 CPI</span><div class="portal-index-links"><a href="#/economy">Inflation &amp; NOK Tool &rarr;</a><a href="#/demographics">15-County Atlas &amp; Pyramid &rarr;</a><a href="#/tables">StatBank CSV Explorer &rarr;</a><a href="#/releases">Release Schedule &rarr;</a></div></nav>`;

  const kpiGrid = root.querySelector('.kpi-grid');
  const chartPanel = root.querySelector('#ov-chart');

  async function drawChart() {
    let s = GDP_SERIES;
    if (key !== 'gdp') {
      if (!extra) extra = (await import('../data/macroExtra.js')).EXTRA_SERIES;
      if (!lineMod) lineMod = await import('../charts/seriesChart.js');
      s = extra[key] || GDP_SERIES;
    }
    const st = range === '6y' ? 4 : 0;
    const years = YEARS_ANNUAL.slice(st), values = s.values.slice(st);
    let idx = years.indexOf(year);
    if (idx < 0) idx = years.length - 1;
    const yr = years[idx], val = values[idx], diff = idx > 0 ? val - values[idx - 1] : null, isBar = s.id === 'gdp';

    chartPanel.innerHTML = `<div class="control-bar"><div class="seg-group seg-series" role="tablist">${SERIES_TABS.map(([id, full, sh]) => `<button type="button" role="tab" aria-selected="${id === key}" class="seg-btn ${id === key ? 'is-active' : ''}" data-s="${id}"><span class="lbl-full">${full}</span><span class="lbl-short">${sh}</span></button>`).join('')}</div><div class="seg-group"><button type="button" class="seg-btn ${range === '10y' ? 'is-active' : ''}" data-r="10y">2016–2025</button><button type="button" class="seg-btn ${range === '6y' ? 'is-active' : ''}" data-r="6y">2020–2025</button></div></div><div class="panel-head"><div><h2 class="panel-title">${s.headline}</h2><p class="panel-sub">${s.subtitle}</p></div></div><div class="chart-readout"><div><strong>${yr}: ${formatVal(val, s.unit, isBar)}</strong>${diff !== null ? `<span class="mono" style="margin-left:7px;color:#5F6E7D">(${diff >= 0 ? '+' : ''}${diff.toFixed(1)} vs ${years[idx - 1]})</span>` : ''}</div><span style="color:#3E4C59">${s.notes[yr] || 'Reconciled annual official series'}</span></div><div class="chart-host"></div><div class="source-caption"><span><strong>Source:</strong> ${s.source}</span><span>Hover or click year · <a href="#/tables">Open raw table &rarr;</a></span></div>`;

    const onSelect = (i) => { if (years[i] !== year) { year = years[i]; drawChart(); } };
    chartPanel.querySelector('.chart-host').append(isBar
      ? renderBarChart({ years, values, color: s.color, negColor: s.negColor, reference: s.reference, activeIndex: idx, onSelect })
      : lineMod.renderLineSeries({ years, values, unit: s.unit, color: s.color, reference: s.reference, activeIndex: idx, onSelect }));
    chartPanel.querySelectorAll('[data-s]').forEach((b) => b.addEventListener('click', () => { key = b.dataset.s; drawChart(); }));
    chartPanel.querySelectorAll('[data-r]').forEach((b) => b.addEventListener('click', () => { range = b.dataset.r; drawChart(); }));
  }

  HEADLINE_KPIS.forEach(([, label, val, delta, dCls, tone, period, src, route, sKey, spark]) => {
    const c = document.createElement('article');
    c.className = 'kpi-card';
    c.dataset.tone = tone;
    c.tabIndex = 0;
    c.setAttribute('role', 'button');
    c.innerHTML = `<div class="kpi-top"><span class="kpi-label">${label}</span><span class="kpi-period">${period}</span></div><div class="kpi-value-row"><div><div class="kpi-value num">${val}</div><span class="kpi-delta ${dCls}">${delta}</span></div><div class="kpi-spark-slot"></div></div><div class="kpi-foot"><span>${src}</span><a class="kpi-detail-link" href="${route}">Details &rarr;</a></div>`;
    c.querySelector('.kpi-detail-link').addEventListener('click', (e) => e.stopPropagation());
    c.querySelector('.kpi-spark-slot').append(renderSparkline(spark, TONE[tone]));
    const pick = () => { key = sKey; year = 2025; drawChart(); };
    c.addEventListener('click', pick);
    c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    kpiGrid.append(c);
  });

  drawChart();
}
