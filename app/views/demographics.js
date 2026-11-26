import { AGE_BANDS, PYRAMID_YEARS, NORWAY_REGIONS } from '../data/demographics.js';
import { renderPopulationPyramid } from '../charts/pyramidChart.js';
import { renderNorwayMap } from '../charts/regionMap.js';

function fmtInt(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function renderDemographics(root, params) {
  let activeYear = 2025;
  let show2005Ghost = true;
  let mapMetric = 'population';
  let selectedCode = 'NO08';
  let sortKey = 'population';
  let sortDesc = true;

  if (params && params.get('q')) {
    const q = params.get('q').toLowerCase();
    const match = NORWAY_REGIONS.find((r) => r.name.toLowerCase().includes(q) || r.counties.toLowerCase().includes(q));
    if (match) selectedCode = match.code;
  }

  root.innerHTML = '';

  const header = document.createElement('section');
  header.className = 'page-header';
  header.innerHTML = `
    <div>
      <div class="kicker">Demography &amp; Territorial Atlas</div>
      <h1 class="page-title">Norway Population Structure &amp; NUTS-2 Regional Atlas</h1>
      <p class="page-lead">Compare 20 years of age-sex demographic transformation alongside reconciled 2025 population, household income, and labour benchmarks across all 7 statistical regions.</p>
    </div>
    <div class="header-stamp">
      <strong>Total Residents: 5,627,429</strong>
      <span>Median Age 41.1 yrs · TFR 1.48 · SSB Table 07459</span>
    </div>
  `;
  root.appendChild(header);

  // Side-by-side Pyramid + Regional Map & Detail Card
  const atlasGrid = document.createElement('div');
  atlasGrid.className = 'grid-atlas';

  // Left panel: Age-Sex Population Pyramid
  const pyramidPanel = document.createElement('section');
  pyramidPanel.className = 'panel';

  function drawPyramid() {
    const yrData = PYRAMID_YEARS[activeYear];
    const base2005 = PYRAMID_YEARS[2005];
    const overlayActive = show2005Ghost && activeYear !== 2005;
    const pyrHeadline = activeYear === 2005
      ? 'In 2005, children (0–14) outnumbered seniors (65+) by 19.5% to 15.0%'
      : `Seniors (65+) rose from 15.0% in 2005 to ${yrData.shares.senior.toFixed(1)}% in ${yrData.year}`;

    pyramidPanel.innerHTML = `
      <div class="control-bar">
        <div class="seg-group" role="tablist" aria-label="Pyramid census year">
          ${[2005, 2015, 2025].map((y) => `
            <button type="button" class="seg-btn ${y === activeYear ? 'is-active' : ''}" data-pyr-year="${y}">${y}</button>
          `).join('')}
        </div>
        <label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#3E4C59;cursor:pointer">
          <input type="checkbox" id="toggle-ghost" ${show2005Ghost ? 'checked' : ''} ${activeYear === 2005 ? 'disabled' : ''}>
          <span>2005 dashed overlay</span>
        </label>
      </div>

      <div class="panel-head">
        <div>
          <h2 class="panel-title">${pyrHeadline}</h2>
          <p class="panel-sub">Population ${yrData.totalLabel} · Fertility ${yrData.tfr} · Life expectancy ${yrData.lifeExpM} (M) / ${yrData.lifeExpF} (F)</p>
        </div>
      </div>

      <div class="calc-summary" style="margin-bottom:10px">
        <div class="calc-stat">
          <div class="calc-stat-label">Children (0–14)</div>
          <div class="calc-stat-val num" style="font-size:19px">${yrData.shares.young.toFixed(1)}%</div>
        </div>
        <div class="calc-stat">
          <div class="calc-stat-label">Working (15–64)</div>
          <div class="calc-stat-val num" style="font-size:19px">${yrData.shares.working.toFixed(1)}%</div>
        </div>
        <div class="calc-stat is-highlight">
          <div class="calc-stat-label">Seniors (65+)</div>
          <div class="calc-stat-val num" style="font-size:19px">${yrData.shares.senior.toFixed(1)}%</div>
        </div>
      </div>

      <div class="pyramid-host"></div>

      <div class="source-caption">
        <span><strong>Source:</strong> Statistics Norway (SSB Table 07459 &amp; Vital Statistics) · ${yrData.year}</span>
        <span>${overlayActive ? 'Red dashed outline = 2005 cohort baseline' : '5-year age bands (thousands)'}</span>
      </div>
    `;

    const svg = renderPopulationPyramid({
      bands: AGE_BANDS,
      male: yrData.male,
      female: yrData.female,
      compareMale: overlayActive ? base2005.male : null,
      compareFemale: overlayActive ? base2005.female : null,
    });
    pyramidPanel.querySelector('.pyramid-host').appendChild(svg);

    pyramidPanel.querySelectorAll('[data-pyr-year]').forEach((b) => {
      b.addEventListener('click', () => {
        activeYear = Number(b.dataset.pyrYear);
        drawPyramid();
      });
    });
    const cb = pyramidPanel.querySelector('#toggle-ghost');
    if (cb) {
      cb.addEventListener('change', () => {
        show2005Ghost = cb.checked;
        drawPyramid();
      });
    }
  }
  drawPyramid();
  atlasGrid.appendChild(pyramidPanel);

  // Right panel: Interactive Regional Atlas + Detail Card + Compact Comparison Table
  const regionPanel = document.createElement('section');
  regionPanel.className = 'panel';

  function drawRegions() {
    const selected = NORWAY_REGIONS.find((r) => r.code === selectedCode) || NORWAY_REGIONS[0];
    const sortedRegions = [...NORWAY_REGIONS].sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortDesc ? -diff : diff;
    });

    const metricLabel =
      mapMetric === 'medianIncome' ? 'Median Household Income' :
      mapMetric === 'growth5y' ? '5-Year Pop. Growth' : 'Resident Population';

    regionPanel.innerHTML = `
      <div class="control-bar">
        <div class="seg-group" role="tablist" aria-label="Choropleth shading metric">
          <button type="button" class="seg-btn ${mapMetric === 'population' ? 'is-active' : ''}" data-map-metric="population">Population</button>
          <button type="button" class="seg-btn ${mapMetric === 'medianIncome' ? 'is-active' : ''}" data-map-metric="medianIncome">Median Income</button>
          <button type="button" class="seg-btn ${mapMetric === 'growth5y' ? 'is-active' : ''}" data-map-metric="growth5y">5-Yr Growth</button>
        </div>
        <span class="mono" style="font-size:11.5px;color:#5F6E7D">Shaded by: ${metricLabel}</span>
      </div>

      <div class="panel-head">
        <div>
          <h2 class="panel-title">Interactive NUTS-2 Regional Atlas (2025)</h2>
          <p class="panel-sub">Select any region on the map or table to inspect county composition and household metrics</p>
        </div>
      </div>

      <div class="atlas-body">
        <div class="map-wrap" id="norway-map-host"></div>

        <div class="region-detail">
          <div class="region-detail-head">
            <h3>${selected.name}</h3>
            <span class="region-code">${selected.code}</span>
          </div>
          <p style="font-size:12px;color:#3E4C59;margin-bottom:9px"><strong>Hub:</strong> ${selected.hub} · ${selected.counties}</p>
          <div class="region-metrics">
            <div class="region-metric-box">
              <span>2025 Population</span>
              <strong>${fmtInt(selected.population)}</strong>
            </div>
            <div class="region-metric-box">
              <span>Share of Nation</span>
              <strong>${selected.sharePct.toFixed(1)}%</strong>
            </div>
            <div class="region-metric-box">
              <span>Median Income (Net)</span>
              <strong>NOK ${fmtInt(selected.medianIncome)}</strong>
            </div>
            <div class="region-metric-box">
              <span>5-Yr Growth / AKU</span>
              <strong>+${selected.growth5y.toFixed(1)}% · ${selected.unempRate.toFixed(1)}%</strong>
            </div>
          </div>
          <p style="font-size:12px;color:#3E4C59;line-height:1.45">${selected.note}</p>
        </div>
      </div>

      <div class="table-wrap" style="margin-top:12px">
        <table class="data-table">
          <thead>
            <tr>
              <th>Region (NUTS-2)</th>
              <th class="num"><button type="button" class="sort-btn" data-sort="population">Pop. (2025)</button></th>
              <th class="num"><button type="button" class="sort-btn" data-sort="medianIncome">Income (NOK)</button></th>
              <th class="num"><button type="button" class="sort-btn" data-sort="unempRate">AKU (%)</button></th>
              <th class="num"><button type="button" class="sort-btn" data-sort="growth5y">5-Yr (%)</button></th>
            </tr>
          </thead>
          <tbody>
            ${sortedRegions.map((r) => `
              <tr data-region-row="${r.code}" class="${r.code === selectedCode ? 'is-selected' : ''}" style="cursor:pointer">
                <td><span class="mono" style="color:#5F6E7D;margin-right:6px">${r.code}</span>${r.name}</td>
                <td class="num mono">${fmtInt(r.population)}</td>
                <td class="num mono">${fmtInt(r.medianIncome)}</td>
                <td class="num mono">${r.unempRate.toFixed(1)}%</td>
                <td class="num mono" style="color:#1B6B5C">+${r.growth5y.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="source-caption">
        <span><strong>Sources:</strong> SSB Table 07459 (2025 County Registry) &amp; Table 06944 (Household Income)</span>
        <span>Sum of 7 regions: 5,627,429 (100.0%)</span>
      </div>
    `;

    const mapSvg = renderNorwayMap({
      regions: NORWAY_REGIONS,
      metricKey: mapMetric,
      selectedCode,
      onSelect(code) {
        selectedCode = code;
        drawRegions();
      },
    });
    regionPanel.querySelector('#norway-map-host').appendChild(mapSvg);

    regionPanel.querySelectorAll('[data-map-metric]').forEach((b) => {
      b.addEventListener('click', () => {
        mapMetric = b.dataset.mapMetric;
        drawRegions();
      });
    });

    regionPanel.querySelectorAll('[data-region-row]').forEach((tr) => {
      tr.addEventListener('click', () => {
        selectedCode = tr.dataset.regionRow;
        drawRegions();
      });
    });

    regionPanel.querySelectorAll('[data-sort]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.sort;
        if (sortKey === key) sortDesc = !sortDesc;
        else { sortKey = key; sortDesc = true; }
        drawRegions();
      });
    });
  }
  drawRegions();
  atlasGrid.appendChild(regionPanel);
  root.appendChild(atlasGrid);
}
