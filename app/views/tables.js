import { STATBANK_SERIES } from '../data/tables.js';

function formatCell(val, unit) {
  if (unit === 'NOK' || unit === 'NOK bn') {
    return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  if (unit === '%' && Math.abs(val * 100 - Math.round(val * 100)) < 0.01 && (val === 0.5 || val === 2.75 || val === 4.5 || val === 4)) {
    return val.toFixed(2);
  }
  return Number.isInteger(val) ? String(val) : val.toFixed(1);
}

export function renderTables(root, params) {
  let query = (params && params.get('q')) ? params.get('q') : '';
  let domain = 'All';
  let sortKey = 'id';
  let sortAsc = true;
  let statusMsg = '';

  root.innerHTML = '';

  const header = document.createElement('section');
  header.className = 'page-header';
  header.innerHTML = `
    <div>
      <div class="kicker">Open Statistical Tables · Offline CSV Export</div>
      <h1 class="page-title">StatBank Indicator Explorer (2021–2025)</h1>
      <p class="page-lead">Search, filter by statistical domain, sort multi-year national indicators, and export your filtered selection as RFC-4180 CSV with primary SSB / Norges Bank table citations.</p>
    </div>
    <div class="header-stamp">
      <strong>16 Reconciled Series</strong>
      <span>All values carry unit &amp; primary table code</span>
    </div>
  `;
  root.appendChild(header);

  const panel = document.createElement('section');
  panel.className = 'panel';

  const domains = ['All', 'Economy', 'Prices', 'Labour', 'Population', 'Climate'];

  function getFiltered() {
    const q = query.trim().toLowerCase();
    return STATBANK_SERIES
      .filter((row) => domain === 'All' || row.domain === domain)
      .filter((row) => !q || row.indicator.toLowerCase().includes(q) || row.table.toLowerCase().includes(q) || row.domain.toLowerCase().includes(q) || row.id.toLowerCase().includes(q))
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sortAsc ? cmp : -cmp;
      });
  }

  function exportCsv(rows) {
    const cols = ['Code', 'Domain', 'Indicator', 'Unit', 'Primary Source', '2021', '2022', '2023', '2024', '2025'];
    const lines = [cols.join(',')];
    rows.forEach((r) => {
      const vals = [r.id, r.domain, `"${r.indicator.replace(/"/g, '""')}"`, r.unit, r.table, r.v2021, r.v2022, r.v2023, r.v2024, r.v2025];
      lines.push(vals.join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nordstat-norway-${domain.toLowerCase()}-2021-2025.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    statusMsg = `Exported ${rows.length} rows to CSV (${link.download})`;
    const msgEl = panel.querySelector('#csv-status');
    if (msgEl) msgEl.textContent = statusMsg;
  }

  function draw() {
    const rows = getFiltered();
    panel.innerHTML = `
      <div class="toolbar">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <input id="tbl-search" class="filter-input" type="search" value="${query.replace(/"/g, '&quot;')}" placeholder="Filter indicator, domain, or SSB table...">
          <div class="seg-group" role="tablist" aria-label="Statistical domain filter">
            ${domains.map((d) => `
              <button type="button" class="seg-btn ${d === domain ? 'is-active' : ''}" data-domain="${d}">${d}</button>
            `).join('')}
          </div>
        </div>
        <button type="button" class="btn" id="btn-export-csv">Download CSV (${rows.length})</button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th><button type="button" class="sort-btn" data-sort="id">Code</button></th>
              <th><button type="button" class="sort-btn" data-sort="domain">Domain</button></th>
              <th><button type="button" class="sort-btn" data-sort="indicator">Indicator</button></th>
              <th>Unit</th>
              <th>Source Table</th>
              <th class="num"><button type="button" class="sort-btn" data-sort="v2021">2021</button></th>
              <th class="num"><button type="button" class="sort-btn" data-sort="v2022">2022</button></th>
              <th class="num"><button type="button" class="sort-btn" data-sort="v2023">2023</button></th>
              <th class="num"><button type="button" class="sort-btn" data-sort="v2024">2024</button></th>
              <th class="num"><button type="button" class="sort-btn" data-sort="v2025">2025</button></th>
            </tr>
          </thead>
          <tbody>
            ${rows.length === 0 ? `
              <tr><td colspan="10" style="text-align:center;padding:24px;color:#5F6E7D">No indicators matched "${query}". Try clearing the search filter.</td></tr>
            ` : rows.map((r) => `
              <tr>
                <td class="mono" style="color:#5F6E7D">${r.id}</td>
                <td><span class="tag-pill">${r.domain}</span></td>
                <td><strong>${r.indicator}</strong></td>
                <td class="mono" style="color:#5F6E7D">${r.unit}</td>
                <td class="mono" style="font-size:11.5px">${r.table}</td>
                <td class="num mono">${formatCell(r.v2021, r.unit)}</td>
                <td class="num mono">${formatCell(r.v2022, r.unit)}</td>
                <td class="num mono">${formatCell(r.v2023, r.unit)}</td>
                <td class="num mono">${formatCell(r.v2024, r.unit)}</td>
                <td class="num mono"><strong>${formatCell(r.v2025, r.unit)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="source-caption">
        <span id="csv-status">${statusMsg || `Showing ${rows.length} of ${STATBANK_SERIES.length} verified national series`}</span>
        <span>All downloads generated locally in browser · Zero external requests</span>
      </div>
    `;

    const searchInput = panel.querySelector('#tbl-search');
    searchInput.addEventListener('input', (e) => {
      query = e.target.value;
      const pos = e.target.selectionStart;
      draw();
      const next = panel.querySelector('#tbl-search');
      next.focus();
      next.setSelectionRange(pos, pos);
    });

    panel.querySelectorAll('[data-domain]').forEach((b) => {
      b.addEventListener('click', () => {
        domain = b.dataset.domain;
        draw();
      });
    });

    panel.querySelectorAll('[data-sort]').forEach((b) => {
      b.addEventListener('click', () => {
        const key = b.dataset.sort;
        if (sortKey === key) sortAsc = !sortAsc;
        else { sortKey = key; sortAsc = key === 'id' || key === 'indicator'; }
        draw();
      });
    });

    panel.querySelector('#btn-export-csv').addEventListener('click', () => exportCsv(rows));
  }

  draw();
  root.appendChild(panel);
}
