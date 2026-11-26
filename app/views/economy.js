import { ECONOMY_SNAPSHOT, CPI_BASKET, CALC_PRESETS, MACRO_ACCOUNTS } from '../data/economy.js';
import { renderHorizontalBars } from '../charts/barChart.js';

const GROUP_RATES = {
  housing: 3.6,
  food: 4.4,
  transport: 2.2,
  dining: 3.2,
  other: 2.5,
};

function fmtNok(num) {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function renderEconomy(root) {
  let basketMode = 'rate';
  let activePreset = 'osloRenter';
  let state = { ...CALC_PRESETS[activePreset] };

  root.innerHTML = '';

  // Page header
  const header = document.createElement('section');
  header.className = 'page-header';
  header.innerHTML = `
    <div>
      <div class="kicker">Macroeconomic Accounts &amp; Consumer Prices</div>
      <h1 class="page-title">Norway Economy, Inflation Basket &amp; Real Wage Calculator</h1>
      <p class="page-lead">Explore COICOP 2018 expenditure weights, measure how 2025 price changes affect your household budget, and review reconciled 2016–2025 national accounts.</p>
    </div>
    <div class="header-stamp">
      <strong>Headline CPI: 3.1% (FY 2025)</strong>
      <span>Core CPI-ATE ~3.0% · Norges Bank Target 2.0%</span>
    </div>
  `;
  root.appendChild(header);

  // Compact 4-metric economic strip
  const strip = document.createElement('section');
  strip.className = 'kpi-grid';
  strip.style.marginBottom = '16px';
  strip.innerHTML = ECONOMY_SNAPSHOT.map((m) => `
    <div class="calc-stat" style="background:#fff;border-top:3px solid #12324B">
      <div class="calc-stat-label">${m.label}</div>
      <div class="calc-stat-val num" style="font-size:21px">${m.value}</div>
      <div class="calc-stat-note">${m.note}</div>
    </div>
  `).join('');
  root.appendChild(strip);

  // Two-column interactive section: CPI Basket + Personal Inflation Calculator
  const twoCol = document.createElement('div');
  twoCol.className = 'grid-two';

  // Left: CPI Basket Breakdown Chart
  const basketPanel = document.createElement('section');
  basketPanel.className = 'panel';

  function drawBasket() {
    const enriched = CPI_BASKET.map((d) => ({
      ...d,
      contrib: (d.weight * d.rate) / 100,
    }));

    const key = basketMode === 'weight' ? 'weight' : basketMode === 'contrib' ? 'contrib' : 'rate';
    const sorted = [...enriched].sort((a, b) => b[key] - a[key]);

    const headline =
      basketMode === 'rate'
        ? 'Food (+4.4%) and dining (+4.2%) led consumer price gains in 2025'
        : basketMode === 'weight'
        ? 'Housing & electricity carry 31.2% of Norway’s household CPI basket'
        : 'Housing & power (+1.12 pp) drove over one-third of 3.1% headline inflation';

    basketPanel.innerHTML = `
      <div class="control-bar">
        <div class="seg-group" role="tablist" aria-label="CPI view mode">
          <button type="button" class="seg-btn ${basketMode === 'rate' ? 'is-active' : ''}" data-mode="rate">2025 Inflation (%)</button>
          <button type="button" class="seg-btn ${basketMode === 'weight' ? 'is-active' : ''}" data-mode="weight">Basket Weight (%)</button>
          <button type="button" class="seg-btn ${basketMode === 'contrib' ? 'is-active' : ''}" data-mode="contrib">Contribution (pp)</button>
        </div>
      </div>
      <div class="panel-head">
        <div>
          <h2 class="panel-title">${headline}</h2>
          <p class="panel-sub">COICOP 2018 main consumption divisions · Weights sum to 100.0%</p>
        </div>
      </div>
      <div class="basket-chart-host"></div>
      <div class="source-caption">
        <span><strong>Source:</strong> Statistics Norway (SSB), CPI Table 14700 · FY 2025</span>
        <span>Reconciled headline: 3.1%</span>
      </div>
    `;

    const svg = renderHorizontalBars({
      items: sorted,
      valueKey: key,
      unit: basketMode === 'contrib' ? ' pp' : '%',
      maxVal: basketMode === 'rate' ? 5.2 : basketMode === 'weight' ? 35 : 1.35,
      refLine: basketMode === 'rate' ? { value: 3.1, label: 'All-items 3.1%' } : null,
    });
    basketPanel.querySelector('.basket-chart-host').appendChild(svg);

    basketPanel.querySelectorAll('[data-mode]').forEach((b) => {
      b.addEventListener('click', () => {
        basketMode = b.dataset.mode;
        drawBasket();
      });
    });
  }
  drawBasket();
  twoCol.appendChild(basketPanel);

  // Right: Interactive Personal Inflation & Real Wage Calculator
  const calcPanel = document.createElement('section');
  calcPanel.className = 'panel';

  function computePersonalMetrics() {
    const totalShare = state.housing + state.food + state.transport + state.dining + state.other || 1;
    const personalCpi = (
      state.housing * GROUP_RATES.housing +
      state.food * GROUP_RATES.food +
      state.transport * GROUP_RATES.transport +
      state.dining * GROUP_RATES.dining +
      state.other * GROUP_RATES.other
    ) / totalShare;
    const realWageChange = state.wageRaise - personalCpi;
    const annualSpendEst = state.wageNok * 12 * 0.68;
    const annualCostNok = (annualSpendEst * personalCpi) / 100;
    const gapVsNational = personalCpi - 3.1;
    return { personalCpi, realWageChange, annualCostNok, gapVsNational, totalShare };
  }

  function drawCalculator() {
    const res = computePersonalMetrics();
    const realTone = res.realWageChange >= 0 ? '#1B6B5C' : '#B4382B';

    calcPanel.innerHTML = `
      <div class="control-bar">
        <div class="seg-group" role="group" aria-label="Household presets">
          ${Object.entries(CALC_PRESETS).map(([key, p]) => `
            <button type="button" class="seg-btn ${activePreset === key ? 'is-active' : ''}" data-preset="${key}">
              ${p.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="panel-head">
        <div>
          <h2 class="panel-title">Personal Inflation &amp; Real Wage Calculator</h2>
          <p class="panel-sub">Weight your spending shares against FY 2025 SSB category inflation rates</p>
        </div>
      </div>

      <div class="calc-summary">
        <div class="calc-stat is-highlight">
          <div class="calc-stat-label">Personal CPI</div>
          <div class="calc-stat-val num" id="calc-personal-cpi">${res.personalCpi.toFixed(2)}%</div>
          <div class="calc-stat-note" id="calc-gap">${res.gapVsNational >= 0 ? '+' : ''}${res.gapVsNational.toFixed(2)} pp vs 3.1% natl.</div>
        </div>
        <div class="calc-stat">
          <div class="calc-stat-label">Real Wage Change</div>
          <div class="calc-stat-val num" id="calc-real-wage" style="color:${realTone}">${res.realWageChange >= 0 ? '+' : ''}${res.realWageChange.toFixed(2)}%</div>
          <div class="calc-stat-note">After personal inflation</div>
        </div>
        <div class="calc-stat">
          <div class="calc-stat-label">Annual Price Impact</div>
          <div class="calc-stat-val num" id="calc-nok-impact" style="font-size:19px">+NOK ${fmtNok(res.annualCostNok)}</div>
          <div class="calc-stat-note">Est. household cost/yr</div>
        </div>
      </div>

      <div class="calc-inputs">
        <div class="field-row">
          <label for="in-housing"><span>Housing &amp; Power (+3.6%)</span><span class="mono" id="lbl-housing">${state.housing}%</span></label>
          <input id="in-housing" type="range" min="10" max="60" value="${state.housing}">
        </div>
        <div class="field-row">
          <label for="in-food"><span>Food &amp; Groceries (+4.4%)</span><span class="mono" id="lbl-food">${state.food}%</span></label>
          <input id="in-food" type="range" min="5" max="35" value="${state.food}">
        </div>
        <div class="field-row">
          <label for="in-transport"><span>Transport (+2.2%)</span><span class="mono" id="lbl-transport">${state.transport}%</span></label>
          <input id="in-transport" type="range" min="0" max="35" value="${state.transport}">
        </div>
        <div class="field-row">
          <label for="in-dining"><span>Dining &amp; Leisure (+3.2%)</span><span class="mono" id="lbl-dining">${state.dining}%</span></label>
          <input id="in-dining" type="range" min="0" max="35" value="${state.dining}">
        </div>
        <div class="field-row">
          <label for="in-wage"><span>Monthly Wage (NOK)</span><span class="mono">Avg 62 070</span></label>
          <input id="in-wage" type="number" min="20000" max="250000" step="500" value="${state.wageNok}">
        </div>
        <div class="field-row">
          <label for="in-raise"><span>Annual Raise (%)</span><span class="mono">Avg 4.5%</span></label>
          <input id="in-raise" type="number" min="-5" max="20" step="0.1" value="${state.wageRaise}">
        </div>
      </div>

      <div class="source-caption">
        <span><strong>Method:</strong> Laspeyres re-weighting on SSB Table 14700 &amp; Table 11418 (2025)</span>
        <span class="mono" id="lbl-share-note">Normalized weights: 100%</span>
      </div>
    `;

    const updateLive = () => {
      const r = computePersonalMetrics();
      calcPanel.querySelector('#calc-personal-cpi').textContent = `${r.personalCpi.toFixed(2)}%`;
      calcPanel.querySelector('#calc-gap').textContent = `${r.gapVsNational >= 0 ? '+' : ''}${r.gapVsNational.toFixed(2)} pp vs 3.1% natl.`;
      const rw = calcPanel.querySelector('#calc-real-wage');
      rw.textContent = `${r.realWageChange >= 0 ? '+' : ''}${r.realWageChange.toFixed(2)}%`;
      rw.style.color = r.realWageChange >= 0 ? '#1B6B5C' : '#B4382B';
      calcPanel.querySelector('#calc-nok-impact').textContent = `+NOK ${fmtNok(r.annualCostNok)}`;
      calcPanel.querySelector('#lbl-housing').textContent = `${state.housing}%`;
      calcPanel.querySelector('#lbl-food').textContent = `${state.food}%`;
      calcPanel.querySelector('#lbl-transport').textContent = `${state.transport}%`;
      calcPanel.querySelector('#lbl-dining').textContent = `${state.dining}%`;
    };

    const bindRange = (id, key) => {
      calcPanel.querySelector(id).addEventListener('input', (e) => {
        state[key] = Number(e.target.value);
        activePreset = 'custom';
        calcPanel.querySelectorAll('[data-preset]').forEach((b) => b.classList.remove('is-active'));
        updateLive();
      });
    };
    bindRange('#in-housing', 'housing');
    bindRange('#in-food', 'food');
    bindRange('#in-transport', 'transport');
    bindRange('#in-dining', 'dining');

    calcPanel.querySelector('#in-wage').addEventListener('input', (e) => {
      const val = Number(e.target.value);
      if (Number.isFinite(val) && val > 0) {
        state.wageNok = val;
        updateLive();
      }
    });
    calcPanel.querySelector('#in-raise').addEventListener('input', (e) => {
      const val = Number(e.target.value);
      if (Number.isFinite(val)) {
        state.wageRaise = val;
        updateLive();
      }
    });

    calcPanel.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activePreset = btn.dataset.preset;
        state = { ...CALC_PRESETS[activePreset] };
        drawCalculator();
      });
    });
  }
  drawCalculator();
  twoCol.appendChild(calcPanel);
  root.appendChild(twoCol);

  // Bottom Historical Macroeconomic Accounts Table
  const tablePanel = document.createElement('section');
  tablePanel.className = 'panel';
  tablePanel.style.marginTop = '18px';
  tablePanel.innerHTML = `
    <div class="panel-head">
      <div>
        <h2 class="panel-title">Reconciled National Macroeconomic Accounts (2016–2025)</h2>
        <p class="panel-sub">Annual GDP, consumer price inflation, Norges Bank sight deposit rate, full-time monthly earnings, and external goods balance</p>
      </div>
      <a class="btn btn-ghost" href="#/tables">Filter &amp; Export CSV &rarr;</a>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Year</th>
            <th class="num">Nominal GDP (NOK bn)</th>
            <th class="num">Mainland GDP (%)</th>
            <th class="num">Headline CPI (%)</th>
            <th class="num">Policy Rate (Dec %)</th>
            <th class="num">Avg. Monthly Wage (NOK)</th>
            <th class="num">Goods Surplus (NOK bn)</th>
          </tr>
        </thead>
        <tbody>
          ${MACRO_ACCOUNTS.map((r) => `
            <tr>
              <td class="mono"><strong>${r.year}</strong></td>
              <td class="num mono">${fmtNok(r.nominalGdp)}</td>
              <td class="num mono" style="color:${r.mainlandGrowth < 0 ? '#B4382B' : '#1B6B5C'};font-weight:600">${r.mainlandGrowth > 0 ? '+' : ''}${r.mainlandGrowth.toFixed(1)}%</td>
              <td class="num mono">${r.cpi.toFixed(1)}%</td>
              <td class="num mono">${r.policyRate.toFixed(2)}%</td>
              <td class="num mono">${fmtNok(r.monthlyWage)}</td>
              <td class="num mono">${fmtNok(r.tradeSurplus)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="source-caption">
      <span><strong>Sources:</strong> Statistics Norway (SSB Tables 09170, 14700, 11418, 08801) &amp; Norges Bank Policy Rate Registry</span>
      <span>2025 figures represent preliminary national accounts &amp; Nov 2025 earnings census</span>
    </div>
  `;
  root.appendChild(tablePanel);
}
