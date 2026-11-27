import { STATBANK_SERIES } from '../data/tables.js';
import { NORWAY_COUNTIES } from '../data/demographics.js';
import { CPI_HISTORY_1990_2025 } from '../data/economy.js';
import { ensureSecondaryStyles } from './secondaryStyles.js';

const fmtInt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function formatCell(val, unit) {
  if (unit === 'NOK' || unit === 'NOK bn') return fmtInt(val);
  if (unit === '%' && (val === 0.5 || val === 2.75 || val === 4.5 || val === 4)) return val.toFixed(2);
  return Number.isInteger(val) ? String(val) : val.toFixed(1);
}

export function renderTables(root, params) {
  ensureSecondaryStyles();
  let dataset = 'national';
  let query = params?.get('q') || '';
  let domain = 'All';
  let sortKey = 'id';
  let sortAsc = true;
  let statusMsg = '';

  const cpiRows = CPI_HISTORY_1990_2025.map(([year, idx], i, arr) => ({
    year,
    idx,
    yoy: i === 0 ? 4.1 : Number((((idx / arr[i - 1][1]) - 1) * 100).toFixed(1)),
    from2015: Number((idx - 100).toFixed(1)),
  })).reverse();

  root.innerHTML = '';

  const header = document.createElement('section');
  header.className = 'page-header';
  header.innerHTML = `
    <div>
      <div class="kicker">Open Statistical Tables · Offline CSV Export</div>
      <h1 class="page-title">StatBank Indicator &amp; County Data Explorer</h1>
      <p class="page-lead">Search, filter, sort, and export reconciled national time series (2021–2025), all 15 Norwegian counties (2025), or the 36-year historical CPI series (1990–2025).</p>
    </div>
    <div class="header-stamp">
      <strong>3 Reconciled Datasets</strong>
      <span>67 rows · Instant offline RFC-4180 CSV</span>
    </div>`;
  root.appendChild(header);

  const panel = document.createElement('section');
  panel.className = 'panel';
  const domains = ['All', 'Economy', 'Prices', 'Labour', 'Population', 'Climate'];

  function downloadCsv(filename, headers, rows) {
    const lines = [headers.join(','), ...rows.map((r) => r.map((v) => typeof v === 'string' && v.includes(',') ? `"${v.replace(/"/g, '""')}"` : v).join(','))];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    statusMsg = `Exported ${rows.length} rows to ${filename}`;
    const el = panel.querySelector('#csv-status');
    if (el) el.textContent = statusMsg;
  }

  function draw() {
    const q = query.trim().toLowerCase();
    let tableHtml = '';
    let rowCount = 0;
    let exportFn = () => {};

    if (dataset === 'national') {
      const rows = STATBANK_SERIES
        .filter((r) => domain === 'All' || r.domain === domain)
        .filter((r) => !q || r.indicator.toLowerCase().includes(q) || r.table.toLowerCase().includes(q) || r.domain.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
        .sort((a, b) => {
          const av = a[sortKey] ?? a.id, bv = b[sortKey] ?? b.id;
          const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
          return sortAsc ? cmp : -cmp;
        });
      rowCount = rows.length;
      exportFn = () => downloadCsv(`nordstat-national-${domain.toLowerCase()}.csv`, ['Code', 'Domain', 'Indicator', 'Unit', 'Source', '2021', '2022', '2023', '2024', '2025'], rows.map((r) => [r.id, r.domain, r.indicator, r.unit, r.table, r.v2021, r.v2022, r.v2023, r.v2024, r.v2025]));
      tableHtml = `
        <table class="data-table">
          <thead><tr>
            <th><button type="button" class="sort-btn" data-sort="id">Code</button></th>
            <th><button type="button" class="sort-btn" data-sort="domain">Domain</button></th>
            <th><button type="button" class="sort-btn" data-sort="indicator">Indicator</button></th>
            <th>Unit</th><th>Source</th>
            <th class="num"><button type="button" class="sort-btn" data-sort="v2021">2021</button></th>
            <th class="num"><button type="button" class="sort-btn" data-sort="v2022">2022</button></th>
            <th class="num"><button type="button" class="sort-btn" data-sort="v2023">2023</button></th>
            <th class="num"><button type="button" class="sort-btn" data-sort="v2024">2024</button></th>
            <th class="num"><button type="button" class="sort-btn" data-sort="v2025">2025</button></th>
          </tr></thead>
          <tbody>${rows.length ? rows.map((r) => `
            <tr>
              <td class="mono" style="color:#5F6E7D">${r.id}</td><td><span class="tag-pill">${r.domain}</span></td>
              <td><strong>${r.indicator}</strong></td><td class="mono" style="color:#5F6E7D">${r.unit}</td><td class="mono">${r.table}</td>
              <td class="num mono">${formatCell(r.v2021, r.unit)}</td><td class="num mono">${formatCell(r.v2022, r.unit)}</td>
              <td class="num mono">${formatCell(r.v2023, r.unit)}</td><td class="num mono">${formatCell(r.v2024, r.unit)}</td>
              <td class="num mono"><strong>${formatCell(r.v2025, r.unit)}</strong></td>
            </tr>`).join('') : `<tr><td colspan="10" style="text-align:center;padding:20px;color:#5F6E7D">No indicators matched "${query}".</td></tr>`}
          </tbody>
        </table>`;
    } else if (dataset === 'counties') {
      const rows = NORWAY_COUNTIES
        .filter((c) => !q || c.name.toLowerCase().includes(q) || c.hub.toLowerCase().includes(q) || c.code.includes(q))
        .sort((a, b) => {
          const k = sortKey in a ? sortKey : 'population';
          const cmp = typeof a[k] === 'number' ? a[k] - b[k] : String(a[k]).localeCompare(String(b[k]));
          return sortAsc ? cmp : -cmp;
        });
      rowCount = rows.length;
      exportFn = () => downloadCsv('nordstat-norway-15-counties-2025.csv', ['Code', 'County', 'Hub', 'Population_2025', 'Share_Pct', 'Median_Net_Income_NOK', 'AKU_Unemp_Pct', 'Growth_5yr_Pct', 'EV_Share_Pct'], rows.map((c) => [c.code, c.name, c.hub, c.population, c.sharePct, c.medianIncome, c.unempRate, c.growth5y, c.evShare]));
      tableHtml = `
        <table class="data-table">
          <thead><tr>
            <th><button type="button" class="sort-btn" data-sort="code">Code</button></th>
            <th><button type="button" class="sort-btn" data-sort="name">County (Fylke)</button></th>
            <th>Primary Hub</th>
            <th class="num"><button type="button" class="sort-btn" data-sort="population">Pop. (2025)</button></th>
            <th class="num"><button type="button" class="sort-btn" data-sort="sharePct">Share %</button></th>
            <th class="num"><button type="button" class="sort-btn" data-sort="medianIncome">Net Income (NOK)</button></th>
            <th class="num"><button type="button" class="sort-btn" data-sort="unempRate">AKU %</button></th>
            <th class="num"><button type="button" class="sort-btn" data-sort="growth5y">5-Yr %</button></th>
            <th class="num"><button type="button" class="sort-btn" data-sort="evShare">EV Share %</button></th>
          </tr></thead>
          <tbody>${rows.map((c) => `
            <tr>
              <td class="mono">${c.code}</td><td><strong>${c.name}</strong></td><td style="color:#3E4C59">${c.hub}</td>
              <td class="num mono">${fmtInt(c.population)}</td><td class="num mono">${c.sharePct.toFixed(1)}%</td>
              <td class="num mono">${fmtInt(c.medianIncome)}</td><td class="num mono">${c.unempRate.toFixed(1)}%</td>
              <td class="num mono" style="color:${c.growth5y < 0 ? '#B4382B' : '#1B6B5C'}">${c.growth5y >= 0 ? '+' : ''}${c.growth5y.toFixed(1)}%</td>
              <td class="num mono">${c.evShare.toFixed(1)}%</td>
            </tr>`).join('')}
          </tbody>
        </table>`;
    } else {
      const rows = cpiRows.filter((r) => !q || String(r.year).includes(q));
      rowCount = rows.length;
      exportFn = () => downloadCsv('nordstat-norway-cpi-1990-2025.csv', ['Year', 'CPI_Index_2015_100', 'Annual_Inflation_Pct', 'Change_vs_2015_Pts'], rows.map((r) => [r.year, r.idx, r.yoy, r.from2015]));
      tableHtml = `
        <table class="data-table">
          <thead><tr>
            <th>Year</th><th class="num">CPI Index (2015=100)</th><th class="num">Annual Inflation (%)</th>
            <th class="num">Pts vs 2015 Base</th><th>Primary Source</th>
          </tr></thead>
          <tbody>${rows.map((r) => `
            <tr>
              <td class="mono"><strong>${r.year}</strong></td>
              <td class="num mono">${r.idx.toFixed(1)}</td>
              <td class="num mono" style="color:${r.yoy >= 4 ? '#B4382B' : '#111921'};font-weight:600">${r.yoy.toFixed(1)}%</td>
              <td class="num mono">${r.from2015 >= 0 ? '+' : ''}${r.from2015.toFixed(1)}</td>
              <td class="mono" style="color:#5F6E7D">SSB Table 03013 / 14700</td>
            </tr>`).join('')}
          </tbody>
        </table>`;
    }

    panel.innerHTML = `
      <div class="toolbar">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <div class="seg-group" role="tablist" aria-label="Dataset selector">
            <button type="button" class="seg-btn ${dataset === 'national' ? 'is-active' : ''}" data-ds="national">National Series (16)</button>
            <button type="button" class="seg-btn ${dataset === 'counties' ? 'is-active' : ''}" data-ds="counties">15 Counties (2025)</button>
            <button type="button" class="seg-btn ${dataset === 'cpi' ? 'is-active' : ''}" data-ds="cpi">CPI 1990–2025 (36)</button>
          </div>
          <input id="tbl-search" class="filter-input" type="search" value="${query.replace(/"/g, '&quot;')}" placeholder="Filter rows...">
        </div>
        <button type="button" class="btn" id="btn-export-csv">Download CSV (${rowCount})</button>
      </div>
      ${dataset === 'national' ? `
        <div class="control-bar" style="margin-bottom:8px">
          <div class="seg-group" role="tablist" aria-label="Domain filter">
            ${domains.map((d) => `<button type="button" class="seg-btn ${d === domain ? 'is-active' : ''}" data-domain="${d}">${d}</button>`).join('')}
          </div>
        </div>` : ''}
      <div class="table-wrap">${tableHtml}</div>
      <div class="source-caption">
        <span id="csv-status">${statusMsg || `Showing ${rowCount} verified rows · Click any column heading to sort`}</span>
        <span>Offline CSV export · Zero external network calls</span>
      </div>`;

    const inp = panel.querySelector('#tbl-search');
    inp.addEventListener('input', (e) => {
      query = e.target.value;
      const pos = e.target.selectionStart;
      draw();
      const next = panel.querySelector('#tbl-search');
      next.focus(); next.setSelectionRange(pos, pos);
    });
    panel.querySelectorAll('[data-ds]').forEach((b) => b.addEventListener('click', () => {
      dataset = b.dataset.ds;
      sortKey = dataset === 'counties' ? 'population' : 'id';
      sortAsc = dataset !== 'counties';
      statusMsg = '';
      draw();
    }));
    panel.querySelectorAll('[data-domain]').forEach((b) => b.addEventListener('click', () => { domain = b.dataset.domain; draw(); }));
    panel.querySelectorAll('[data-sort]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.sort;
      if (sortKey === k) sortAsc = !sortAsc;
      else { sortKey = k; sortAsc = k === 'id' || k === 'name' || k === 'indicator'; }
      draw();
    }));
    panel.querySelector('#btn-export-csv').addEventListener('click', exportFn);
  }
  draw();
  root.appendChild(panel);
}
