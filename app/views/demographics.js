import { AGE_BANDS, PYRAMID_YEARS, NORWAY_COUNTIES } from '../data/demographics.js';
import { renderPopulationPyramid } from '../charts/pyramidChart.js';
import { renderNorwayMap } from '../charts/regionMap.js';
import { ensureSecondaryStyles } from './secondaryStyles.js';

const fmtInt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const fmtDelta = (d, suffix = '') => `${d >= 0 ? '+' : ''}${d}${suffix}`;

export function renderDemographics(root, params) {
  ensureSecondaryStyles();
  let activeYear = 2025;
  let show2005Ghost = true;
  let mapMetric = 'population';
  let selectedCode = '03';
  let compareCode = '46';
  let sortKey = 'population';
  let sortDesc = true;
  let showAllCounties = false;

  if (params?.get('q')) {
    const q = params.get('q').toLowerCase();
    const match = NORWAY_COUNTIES.find((c) => c.name.toLowerCase().includes(q) || c.hub.toLowerCase().includes(q));
    if (match) {
      selectedCode = match.code;
      if (compareCode === selectedCode) compareCode = selectedCode === '03' ? '46' : '03';
    }
  }

  root.innerHTML = '';

  const header = document.createElement('section');
  header.className = 'page-header';
  header.innerHTML = `
    <div>
      <div class="kicker">Demography &amp; 15-County Territorial Atlas (2024–2026 Boundaries)</div>
      <h1 class="page-title">Norway Population Pyramid &amp; 15-County Statistical Atlas</h1>
      <p class="page-lead">Compare 20 years of age-sex aging alongside reconciled 2025 population, net household income, AKU unemployment, and EV adoption across all 15 Norwegian fylker.</p>
    </div>
    <div class="header-stamp">
      <strong>Total Residents: 5,627,429</strong>
      <span>15 Counties · Median Age 41.1 yrs · SSB 07459</span>
    </div>`;
  root.appendChild(header);

  const atlasGrid = document.createElement('div');
  atlasGrid.className = 'grid-atlas';

  // Left panel: Age-Sex Population Pyramid
  const pyramidPanel = document.createElement('section');
  pyramidPanel.className = 'panel';

  function drawPyramid() {
    const yr = PYRAMID_YEARS[activeYear];
    const base = PYRAMID_YEARS[2005];
    const overlay = show2005Ghost && activeYear !== 2005;
    const title = activeYear === 2005
      ? 'In 2005, children (0–14) outnumbered seniors (65+) by 19.5% to 15.0%'
      : `Seniors (65+) rose from 15.0% in 2005 to ${yr.shares.senior.toFixed(1)}% in ${yr.year}`;

    pyramidPanel.innerHTML = `
      <div class="control-bar">
        <div class="seg-group" role="tablist" aria-label="Census year">
          ${[2005, 2015, 2025].map((y) => `<button type="button" class="seg-btn ${y === activeYear ? 'is-active' : ''}" data-pyr-year="${y}">${y}</button>`).join('')}
        </div>
        <label style="display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:#3E4C59;cursor:pointer">
          <input type="checkbox" id="toggle-ghost" ${show2005Ghost ? 'checked' : ''} ${activeYear === 2005 ? 'disabled' : ''}>
          <span>2005 overlay</span>
        </label>
      </div>
      <div class="panel-head">
        <div>
          <h2 class="panel-title">${title}</h2>
          <p class="panel-sub">Pop. ${yr.totalLabel} · TFR ${yr.tfr} · Life exp. ${yr.lifeExpM} (M) / ${yr.lifeExpF} (F)</p>
        </div>
      </div>
      <div class="calc-summary" style="margin-bottom:8px">
        <div class="calc-stat"><div class="calc-stat-label">Children (0–14)</div><div class="calc-stat-val num" style="font-size:18px">${yr.shares.young.toFixed(1)}%</div></div>
        <div class="calc-stat"><div class="calc-stat-label">Working (15–64)</div><div class="calc-stat-val num" style="font-size:18px">${yr.shares.working.toFixed(1)}%</div></div>
        <div class="calc-stat is-highlight"><div class="calc-stat-label">Seniors (65+)</div><div class="calc-stat-val num" style="font-size:18px">${yr.shares.senior.toFixed(1)}%</div></div>
      </div>
      <div class="pyramid-host"></div>
      <div class="source-caption">
        <span><strong>Source:</strong> SSB Table 07459 &amp; Vital Statistics · ${yr.year}</span>
        <span>${overlay ? 'Red dashed = 2005 baseline' : '5-year age bands (k)'}</span>
      </div>`;

    pyramidPanel.querySelector('.pyramid-host').appendChild(renderPopulationPyramid({
      bands: AGE_BANDS, male: yr.male, female: yr.female,
      compareMale: overlay ? base.male : null, compareFemale: overlay ? base.female : null,
    }));
    pyramidPanel.querySelectorAll('[data-pyr-year]').forEach((b) => b.addEventListener('click', () => { activeYear = Number(b.dataset.pyrYear); drawPyramid(); }));
    pyramidPanel.querySelector('#toggle-ghost')?.addEventListener('change', (e) => { show2005Ghost = e.target.checked; drawPyramid(); });
  }
  drawPyramid();
  atlasGrid.appendChild(pyramidPanel);

  // Right panel: Interactive 15-County Choropleth Map + County Comparison Card + Clean Top-5 / All-15 Table
  const countyPanel = document.createElement('section');
  countyPanel.className = 'panel';

  function drawCounties() {
    const sel = NORWAY_COUNTIES.find((c) => c.code === selectedCode) || NORWAY_COUNTIES[1];
    const cmp = NORWAY_COUNTIES.find((c) => c.code === compareCode) || NORWAY_COUNTIES[2];
    const sorted = [...NORWAY_COUNTIES].sort((a, b) => sortDesc ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]);
    const visible = showAllCounties ? sorted : sorted.slice(0, 5);

    const dPop = sel.population - cmp.population;
    const dInc = sel.medianIncome - cmp.medianIncome;
    const dAku = (sel.unempRate - cmp.unempRate).toFixed(1);
    const dEv = (sel.evShare - cmp.evShare).toFixed(1);

    countyPanel.innerHTML = `
      <div class="control-bar">
        <div class="seg-group" role="tablist" aria-label="County choropleth metric">
          <button type="button" class="seg-btn ${mapMetric === 'population' ? 'is-active' : ''}" data-map-metric="population">Population</button>
          <button type="button" class="seg-btn ${mapMetric === 'medianIncome' ? 'is-active' : ''}" data-map-metric="medianIncome">Net Income</button>
          <button type="button" class="seg-btn ${mapMetric === 'growth5y' ? 'is-active' : ''}" data-map-metric="growth5y">5-Yr Growth</button>
          <button type="button" class="seg-btn ${mapMetric === 'evShare' ? 'is-active' : ''}" data-map-metric="evShare">EV Share</button>
        </div>
        <button type="button" class="btn btn-ghost" id="btn-toggle-all" style="padding:3.5px 8px;font-size:11px">
          ${showAllCounties ? 'Compact Top 5' : 'Show all 15 counties'}
        </button>
      </div>

      <div class="atlas-body">
        <div class="map-wrap" id="norway-map-host"></div>

        <div class="region-detail">
          <div class="region-detail-head">
            <h3>${sel.name}</h3>
            <span class="region-code">County ${sel.code} · ${sel.sharePct.toFixed(1)}%</span>
          </div>
          <div class="compare-bar">
            <span><strong>Hub:</strong> ${sel.hub}</span>
            <label style="display:inline-flex;align-items:center;gap:4px">
              <span>vs</span>
              <select class="inline-select" id="sel-compare" aria-label="Compare county">
                ${NORWAY_COUNTIES.filter((c) => c.code !== sel.code).map((c) => `<option value="${c.code}" ${c.code === cmp.code ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </label>
          </div>
          <div class="region-metrics">
            <div class="region-metric-box">
              <span>2025 Population</span>
              <strong>${fmtInt(sel.population)}</strong>
              <div class="cmp-delta">${dPop >= 0 ? '+' : ''}${fmtInt(dPop)} vs ${cmp.name}</div>
            </div>
            <div class="region-metric-box">
              <span>Median Net Income</span>
              <strong>NOK ${fmtInt(sel.medianIncome)}</strong>
              <div class="cmp-delta">${dInc >= 0 ? '+' : ''}${fmtInt(dInc)} vs ${cmp.name}</div>
            </div>
            <div class="region-metric-box">
              <span>AKU Unemployment</span>
              <strong>${sel.unempRate.toFixed(1)}%</strong>
              <div class="cmp-delta">${fmtDelta(Number(dAku), ' pp')} vs ${cmp.name}</div>
            </div>
            <div class="region-metric-box">
              <span>New-Car EV Share</span>
              <strong>${sel.evShare.toFixed(1)}%</strong>
              <div class="cmp-delta">${fmtDelta(Number(dEv), ' pp')} · 5-yr ${sel.growth5y >= 0 ? '+' : ''}${sel.growth5y.toFixed(1)}%</div>
            </div>
          </div>
          <p style="font-size:11px;color:#3E4C59;line-height:1.38">Click any county on the map or table to inspect · Red border marks comparison county (${cmp.name}).</p>
        </div>
      </div>

      <div class="table-wrap" style="margin-top:9px">
        <table class="data-table">
          <thead>
            <tr>
              <th>County (Fylke)</th>
              <th class="num"><button type="button" class="sort-btn" data-sort="population">Pop. (2025)</button></th>
              <th class="num"><button type="button" class="sort-btn" data-sort="medianIncome">Income (NOK)</button></th>
              <th class="num"><button type="button" class="sort-btn" data-sort="unempRate">AKU</button></th>
              <th class="num"><button type="button" class="sort-btn" data-sort="growth5y">5-Yr</button></th>
              <th class="num"><button type="button" class="sort-btn" data-sort="evShare">EV %</button></th>
            </tr>
          </thead>
          <tbody>
            ${visible.map((c) => `
              <tr data-county-row="${c.code}" class="${c.code === selectedCode ? 'is-selected' : c.code === compareCode ? 'is-compared' : ''}" style="cursor:pointer">
                <td><span class="mono" style="color:#5F6E7D;margin-right:5px">${c.code}</span>${c.name}</td>
                <td class="num mono">${fmtInt(c.population)}</td>
                <td class="num mono">${fmtInt(c.medianIncome)}</td>
                <td class="num mono">${c.unempRate.toFixed(1)}%</td>
                <td class="num mono" style="color:${c.growth5y < 0 ? '#B4382B' : '#1B6B5C'}">${c.growth5y >= 0 ? '+' : ''}${c.growth5y.toFixed(1)}%</td>
                <td class="num mono">${c.evShare.toFixed(1)}%</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="source-caption">
        <span><strong>Sources:</strong> SSB Tables 07459, 06944, 13760 &amp; OFV (2025)</span>
        <span>Showing ${visible.length} of 15 counties · Total: 5,627,429</span>
      </div>`;

    countyPanel.querySelector('#norway-map-host').appendChild(renderNorwayMap({
      counties: NORWAY_COUNTIES, metricKey: mapMetric, selectedCode, compareCode,
      onSelect(code) {
        selectedCode = code;
        if (compareCode === code) compareCode = code === '03' ? '46' : '03';
        drawCounties();
      },
    }));

    countyPanel.querySelector('#sel-compare').addEventListener('change', (e) => { compareCode = e.target.value; drawCounties(); });
    countyPanel.querySelector('#btn-toggle-all').addEventListener('click', () => { showAllCounties = !showAllCounties; drawCounties(); });
    countyPanel.querySelectorAll('[data-map-metric]').forEach((b) => b.addEventListener('click', () => { mapMetric = b.dataset.mapMetric; drawCounties(); }));
    countyPanel.querySelectorAll('[data-county-row]').forEach((tr) => tr.addEventListener('click', () => {
      selectedCode = tr.dataset.countyRow;
      if (compareCode === selectedCode) compareCode = selectedCode === '03' ? '46' : '03';
      drawCounties();
    }));
    countyPanel.querySelectorAll('[data-sort]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.sort;
      if (sortKey === k) sortDesc = !sortDesc;
      else { sortKey = k; sortDesc = true; }
      drawCounties();
    }));
  }
  drawCounties();
  atlasGrid.appendChild(countyPanel);
  root.appendChild(atlasGrid);
}
