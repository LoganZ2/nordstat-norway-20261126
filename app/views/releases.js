import { RELEASE_CALENDAR, METHODOLOGY_NOTES } from '../data/tables.js';

export function renderReleases(root) {
  let activeDomain = 'All';
  root.innerHTML = '';

  const header = document.createElement('section');
  header.className = 'page-header';
  header.innerHTML = `
    <div>
      <div class="kicker">Publication Schedule &amp; Statistical Standards</div>
      <h1 class="page-title">Official Release Calendar &amp; Methodology</h1>
      <p class="page-lead">Advance release schedule at 08:00 CET alongside classification definitions, weighting procedures, and international comparability standards.</p>
    </div>
    <div class="header-stamp">
      <strong>Release Embargo: 08:00 CET</strong>
      <span>Pre-announced 12-month calendar</span>
    </div>
  `;
  root.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'grid-editorial';

  const calPanel = document.createElement('section');
  calPanel.className = 'panel';

  const domains = ['All', 'Economy', 'Prices', 'Labour', 'Population', 'Climate'];

  function drawCalendar() {
    const items = RELEASE_CALENDAR.filter((r) => activeDomain === 'All' || r.domain === activeDomain);
    calPanel.innerHTML = `
      <div class="control-bar">
        <div class="seg-group" role="tablist" aria-label="Filter releases by domain">
          ${domains.map((d) => `
            <button type="button" class="seg-btn ${d === activeDomain ? 'is-active' : ''}" data-rel-domain="${d}">${d}</button>
          `).join('')}
        </div>
        <span class="mono" style="font-size:11.5px;color:#5F6E7D">${items.length} scheduled publications</span>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Release Date</th>
              <th>Time</th>
              <th>Domain</th>
              <th>Publication Title</th>
              <th>Primary Table</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((r) => `
              <tr>
                <td class="mono"><strong>${r.date}</strong></td>
                <td class="mono" style="color:#5F6E7D">${r.time}</td>
                <td><span class="tag-pill">${r.domain}</span></td>
                <td>${r.title}</td>
                <td class="mono" style="font-size:11.5px">${r.table}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="source-caption">
        <span><strong>Publication Standard:</strong> Simultaneous public release in accordance with UN Fundamental Principles of Official Statistics</span>
      </div>
    `;

    calPanel.querySelectorAll('[data-rel-domain]').forEach((b) => {
      b.addEventListener('click', () => {
        activeDomain = b.dataset.relDomain;
        drawCalendar();
      });
    });
  }
  drawCalendar();
  grid.appendChild(calPanel);

  const methodPanel = document.createElement('aside');
  methodPanel.className = 'panel';
  methodPanel.innerHTML = `
    <div class="panel-head">
      <div>
        <h2 class="panel-title">Methodological Notes</h2>
        <p class="panel-sub">Classifications &amp; reconciliation conventions</p>
      </div>
    </div>
    <ul class="bulletin-list">
      ${METHODOLOGY_NOTES.map((m) => `
        <li class="bulletin-item">
          <div class="bulletin-title" style="font-size:14px">${m.standard}</div>
          <p class="bulletin-summary">${m.detail}</p>
        </li>
      `).join('')}
    </ul>
  `;
  grid.appendChild(methodPanel);
  root.appendChild(grid);
}
