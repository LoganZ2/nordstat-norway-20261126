import {
  YEARS_ANNUAL,
  HEADLINE_KPIS,
  MACRO_SERIES,
  LATEST_BULLETINS,
  TOPIC_CARDS,
} from '../data/headline.js';
import { renderSparkline, renderEditorialChart, formatVal } from '../charts/lineChart.js';

export function renderOverview(root) {
  let activeKey = 'gdp';
  let rangeMode = '10y';
  let selectedYear = 2025;

  root.innerHTML = '';

  // Page header
  const header = document.createElement('section');
  header.className = 'page-header';
  header.innerHTML = `
    <div>
      <div class="kicker">National Statistical Compendium · Kingdom of Norway</div>
      <h1 class="page-title">Norway at a Glance: Economy, Prices &amp; Society</h1>
      <p class="page-lead">Verified annual accounts, consumer inflation, labour force benchmarks, and territorial climate indicators compiled from primary Norwegian statistical tables.</p>
    </div>
    <div class="header-stamp">
      <strong>Edition: FY 2025 / Q4</strong>
      <span>Population 5,627,429 · Nominal GDP NOK 5,511 bn</span>
    </div>
  `;
  root.appendChild(header);

  // 4 Headline KPI Cards
  const kpiGrid = document.createElement('section');
  kpiGrid.className = 'kpi-grid';
  kpiGrid.setAttribute('aria-label', 'Headline national indicators');

  HEADLINE_KPIS.forEach((kpi) => {
    const card = document.createElement('article');
    card.className = 'kpi-card';
    card.dataset.tone = kpi.tone;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${kpi.label}: ${kpi.value}, ${kpi.period}`);

    const toneColor =
      kpi.tone === 'crimson' ? '#B4382B' :
      kpi.tone === 'teal' ? '#1B6B5C' :
      kpi.tone === 'ochre' ? '#A9641B' : '#12324B';

    card.innerHTML = `
      <div class="kpi-top">
        <span class="kpi-label">${kpi.label}</span>
        <span class="kpi-period">${kpi.period}</span>
      </div>
      <div class="kpi-value-row">
        <div>
          <div class="kpi-value num">${kpi.value}</div>
          <span class="kpi-delta ${kpi.deltaClass}">${kpi.delta}</span>
        </div>
        <div class="kpi-spark-slot"></div>
      </div>
      <div class="kpi-foot">
        <span>Source: ${kpi.source}</span>
        <a class="kpi-detail-link" href="${kpi.route}">Details &rarr;</a>
      </div>
    `;
    card.querySelector('.kpi-detail-link').addEventListener('click', (e) => e.stopPropagation());
    card.querySelector('.kpi-spark-slot').appendChild(renderSparkline(kpi.spark, toneColor));

    const activateCard = () => {
      if (MACRO_SERIES[kpi.seriesKey]) {
        activeKey = kpi.seriesKey;
        selectedYear = 2025;
        drawChartPanel();
      }
    };
    card.addEventListener('click', activateCard);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateCard();
      }
    });
    kpiGrid.appendChild(card);
  });
  root.appendChild(kpiGrid);

  // Main Editorial Two-Column Area
  const editorial = document.createElement('div');
  editorial.className = 'grid-editorial';

  // Left: Interactive Primary Macroeconomic Chart
  const chartPanel = document.createElement('section');
  chartPanel.className = 'panel';
  chartPanel.setAttribute('aria-label', 'Primary macroeconomic indicator chart');

  function drawChartPanel() {
    const s = MACRO_SERIES[activeKey];
    const startIdx = rangeMode === '6y' ? 4 : 0;
    const years = YEARS_ANNUAL.slice(startIdx);
    const values = s.values.slice(startIdx);
    let idx = years.indexOf(selectedYear);
    if (idx < 0) idx = years.length - 1;
    const yr = years[idx];
    const val = values[idx];
    const prev = idx > 0 ? values[idx - 1] : null;
    const diff = prev !== null ? (val - prev) : null;
    const note = s.notes[yr] || `Annual official series value (${s.period})`;

    chartPanel.innerHTML = `
      <div class="control-bar">
        <div class="seg-group" role="tablist" aria-label="Indicator series">
          ${Object.values(MACRO_SERIES).map((item) => `
            <button type="button" role="tab" aria-selected="${item.id === activeKey}" class="seg-btn ${item.id === activeKey ? 'is-active' : ''}" data-series="${item.id}">
              ${item.tab}
            </button>
          `).join('')}
        </div>
        <div class="seg-group" role="group" aria-label="Time window">
          <button type="button" class="seg-btn ${rangeMode === '10y' ? 'is-active' : ''}" data-range="10y">2016–2025</button>
          <button type="button" class="seg-btn ${rangeMode === '6y' ? 'is-active' : ''}" data-range="6y">2020–2025</button>
        </div>
      </div>

      <div class="panel-head">
        <div>
          <h2 class="panel-title">${s.headline}</h2>
          <p class="panel-sub">${s.subtitle}</p>
        </div>
      </div>

      <div class="chart-readout">
        <div>
          <strong>${yr}: ${formatVal(val, s.unit, s.kind === 'bar')}</strong>
          ${diff !== null ? `<span class="mono" style="margin-left:8px;color:#5F6E7D">(${diff >= 0 ? '+' : ''}${diff.toFixed(1)} vs ${years[idx - 1]})</span>` : ''}
        </div>
        <span style="color:#3E4C59">${note}</span>
      </div>

      <div class="chart-host"></div>

      <div class="source-caption">
        <span><strong>Source:</strong> ${s.source}</span>
        <span>Click or hover any year to inspect · <a href="#/tables">Open raw table &rarr;</a></span>
      </div>
    `;

    const svg = renderEditorialChart({
      years,
      values,
      unit: s.unit,
      kind: s.kind,
      color: s.color,
      negColor: s.negColor || '#B4382B',
      reference: s.reference,
      activeIndex: idx,
      onSelect(newIdx) {
        if (years[newIdx] !== selectedYear) {
          selectedYear = years[newIdx];
          drawChartPanel();
        }
      },
    });
    chartPanel.querySelector('.chart-host').appendChild(svg);

    chartPanel.querySelectorAll('[data-series]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeKey = btn.dataset.series;
        drawChartPanel();
      });
    });
    chartPanel.querySelectorAll('[data-range]').forEach((btn) => {
      btn.addEventListener('click', () => {
        rangeMode = btn.dataset.range;
        drawChartPanel();
      });
    });
  }

  drawChartPanel();
  editorial.appendChild(chartPanel);

  // Right: Statistical Bulletins Sidebar
  const bulletinPanel = document.createElement('aside');
  bulletinPanel.className = 'panel';
  bulletinPanel.setAttribute('aria-label', 'Latest statistical releases');
  bulletinPanel.innerHTML = `
    <div class="panel-head" style="margin-bottom:8px">
      <div>
        <h2 class="panel-title">Latest Statistical Releases</h2>
        <p class="panel-sub">Verified 2025 annual &amp; Q4 headline publications</p>
      </div>
      <a href="#/releases" style="font-size:12px;font-weight:600;white-space:nowrap">Calendar &rarr;</a>
    </div>
    <ul class="bulletin-list">
      ${LATEST_BULLETINS.map((b) => `
        <li class="bulletin-item">
          <div class="bulletin-meta">
            <span class="tag-pill">${b.tag}</span>
            <span class="mono">${b.date}</span>
          </div>
          <a class="bulletin-title" href="${b.route}">${b.title}</a>
          <p class="bulletin-summary">${b.summary}</p>
        </li>
      `).join('')}
    </ul>
  `;
  editorial.appendChild(bulletinPanel);
  root.appendChild(editorial);

  // Bottom Topic Directory Strip
  const topics = document.createElement('section');
  topics.className = 'topic-strip';
  topics.setAttribute('aria-label', 'Statistical sections');
  topics.innerHTML = TOPIC_CARDS.map((card) => `
    <a class="topic-card" href="${card.route}">
      <h3>${card.title}</h3>
      <p>${card.desc}</p>
      <div class="topic-metric">${card.metric}</div>
    </a>
  `).join('');
  root.appendChild(topics);
}
