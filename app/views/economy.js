import { ECONOMY_SNAPSHOT, CPI_BASKET, CALC_PRESETS, CPI_HISTORY_1990_2025, MACRO_ACCOUNTS } from '../data/economy.js';
import { renderHorizontalBars } from '../charts/barChart.js';
import { ensureSecondaryStyles } from './secondaryStyles.js';

const GROUP_RATES = { housing: 3.6, food: 4.4, transport: 2.2, dining: 3.2, other: 2.5 };
const CPI_BY_YEAR = new Map(CPI_HISTORY_1990_2025);
const fmtNok = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export function renderEconomy(root) {
  ensureSecondaryStyles();
  let basketMode = 'rate';
  let calcTab = 'personal';
  let activePreset = 'osloRenter';
  let state = { ...CALC_PRESETS[activePreset] };
  let ppState = { amount: 100000, fromYear: 2015, toYear: 2025 };

  root.innerHTML = '';

  const header = document.createElement('section');
  header.className = 'page-header';
  header.innerHTML = `
    <div>
      <div class="kicker">Macroeconomic Accounts &amp; Consumer Prices</div>
      <h1 class="page-title">Norway Economy, Inflation Basket &amp; NOK Calculators</h1>
      <p class="page-lead">Inspect COICOP 2018 weights, model your personal household inflation &amp; real wage, or convert historical NOK purchasing power across 1990–2025.</p>
    </div>
    <div class="header-stamp">
      <strong>Headline CPI: 3.1% (FY 2025)</strong>
      <span>Index 137.7 (2015=100) · Target 2.0%</span>
    </div>`;
  root.appendChild(header);

  const strip = document.createElement('section');
  strip.className = 'kpi-grid';
  strip.innerHTML = ECONOMY_SNAPSHOT.map((m) => `
    <div class="calc-stat" style="background:#fff;border-top:3px solid #12324B">
      <div class="calc-stat-label">${m.label}</div>
      <div class="calc-stat-val num">${m.value}</div>
      <div class="calc-stat-note">${m.note}</div>
    </div>`).join('');
  root.appendChild(strip);

  const twoCol = document.createElement('div');
  twoCol.className = 'grid-two';

  // Left: COICOP CPI Basket Chart
  const basketPanel = document.createElement('section');
  basketPanel.className = 'panel';

  function drawBasket() {
    const enriched = CPI_BASKET.map((d) => ({ ...d, contrib: (d.weight * d.rate) / 100 }));
    const key = basketMode === 'weight' ? 'weight' : basketMode === 'contrib' ? 'contrib' : 'rate';
    const sorted = [...enriched].sort((a, b) => b[key] - a[key]);
    const headline =
      basketMode === 'rate' ? 'Food (+4.4%) and dining (+4.2%) led consumer price gains in 2025' :
      basketMode === 'weight' ? 'Housing & electricity carry 31.2% of Norway’s household CPI basket' :
      'Housing & power (+1.12 pp) drove over a third of 3.1% headline inflation';

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
          <p class="panel-sub">COICOP 2018 main divisions · Parentheses show basket weight (sum = 100.0%)</p>
        </div>
      </div>
      <div class="basket-chart-host"></div>
      <div class="source-caption">
        <span><strong>Source:</strong> Statistics Norway (SSB), CPI Table 14700 · FY 2025</span>
        <span>Reconciled headline: 3.1%</span>
      </div>`;

    basketPanel.querySelector('.basket-chart-host').appendChild(renderHorizontalBars({
      items: sorted,
      valueKey: key,
      unit: basketMode === 'contrib' ? ' pp' : '%',
      maxVal: basketMode === 'rate' ? 5.2 : basketMode === 'weight' ? 35 : 1.35,
      refLine: basketMode === 'rate' ? { value: 3.1, label: 'All-items 3.1%' } : null,
      showWeight: basketMode === 'rate',
    }));
    basketPanel.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { basketMode = b.dataset.mode; drawBasket(); }));
  }
  drawBasket();
  twoCol.appendChild(basketPanel);

  // Right: Dual-Mode Calculator (Personal CPI & Real Wage | Historical NOK Purchasing Power 1990-2025)
  const calcPanel = document.createElement('section');
  calcPanel.className = 'panel';

  function computePersonal() {
    const total = state.housing + state.food + state.transport + state.dining + state.other || 1;
    const personalCpi = (
      state.housing * GROUP_RATES.housing + state.food * GROUP_RATES.food +
      state.transport * GROUP_RATES.transport + state.dining * GROUP_RATES.dining +
      state.other * GROUP_RATES.other
    ) / total;
    const realWageChange = state.wageRaise - personalCpi;
    const annualCostNok = (state.wageNok * 12 * 0.68 * personalCpi) / 100;
    return { personalCpi, realWageChange, annualCostNok, gapVsNational: personalCpi - 3.1 };
  }

  function computePurchasingPower() {
    const cFrom = CPI_BY_YEAR.get(ppState.fromYear) || 100;
    const cTo = CPI_BY_YEAR.get(ppState.toYear) || 137.7;
    const factor = cTo / cFrom;
    const equiv = ppState.amount * factor;
    const cumPct = (factor - 1) * 100;
    const span = Math.abs(ppState.toYear - ppState.fromYear);
    const cagr = span > 0 ? (Math.pow(factor, 1 / (ppState.toYear - ppState.fromYear)) - 1) * 100 : 0;
    return { cFrom, cTo, equiv, cumPct, cagr, span };
  }

  function drawCalculator() {
    const topTabs = `
      <div class="control-bar">
        <div class="seg-group" role="tablist" aria-label="Calculator mode">
          <button type="button" class="seg-btn ${calcTab === 'personal' ? 'is-active' : ''}" data-calc-tab="personal">Personal CPI &amp; Wage</button>
          <button type="button" class="seg-btn ${calcTab === 'power' ? 'is-active' : ''}" data-calc-tab="power">NOK Value (1990–2025)</button>
        </div>
        ${calcTab === 'personal' ? `
          <div class="seg-group" role="group" aria-label="Household presets">
            ${Object.entries(CALC_PRESETS).map(([k, p]) => `<button type="button" class="seg-btn ${activePreset === k ? 'is-active' : ''}" data-preset="${k}">${p.label}</button>`).join('')}
          </div>` : `<span class="mono" style="font-size:11px;color:#5F6E7D">SSB 03013 · 2015=100</span>`}
      </div>`;

    if (calcTab === 'personal') {
      const res = computePersonal();
      const realTone = res.realWageChange >= 0 ? '#1B6B5C' : '#B4382B';
      calcPanel.innerHTML = `${topTabs}
        <div class="panel-head">
          <div>
            <h2 class="panel-title">Personal Inflation &amp; Real Wage Calculator</h2>
            <p class="panel-sub">Weight your budget shares against FY 2025 SSB category inflation rates</p>
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
            <div class="calc-stat-val num" id="calc-nok-impact" style="font-size:18px">+NOK ${fmtNok(res.annualCostNok)}</div>
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
        <div class="quick-pp-bar">
          <span><strong>NOK Purchasing Power (1990–2025):</strong> NOK 100 000 in 2015 = <strong>NOK 137 700</strong> in 2025 (+37.7%)</span>
          <button type="button" class="quick-pp-btn" id="btn-open-pp">Convert years &rarr;</button>
        </div>
        <div class="source-caption">
          <span><strong>Method:</strong> Laspeyres re-weighting · SSB Tables 14700, 11418 &amp; 03013</span>
          <span class="mono">Normalized: 100%</span>
        </div>`;

      const updateLive = () => {
        const r = computePersonal();
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
      [['#in-housing', 'housing'], ['#in-food', 'food'], ['#in-transport', 'transport'], ['#in-dining', 'dining']].forEach(([sel, k]) => {
        calcPanel.querySelector(sel).addEventListener('input', (e) => {
          state[k] = Number(e.target.value);
          activePreset = 'custom';
          calcPanel.querySelectorAll('[data-preset]').forEach((b) => b.classList.remove('is-active'));
          updateLive();
        });
      });
      calcPanel.querySelector('#in-wage').addEventListener('input', (e) => { const v = Number(e.target.value); if (v > 0) { state.wageNok = v; updateLive(); } });
      calcPanel.querySelector('#in-raise').addEventListener('input', (e) => { const v = Number(e.target.value); if (Number.isFinite(v)) { state.wageRaise = v; updateLive(); } });
      calcPanel.querySelector('#btn-open-pp').addEventListener('click', () => { calcTab = 'power'; drawCalculator(); });
      calcPanel.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => { activePreset = b.dataset.preset; state = { ...CALC_PRESETS[activePreset] }; drawCalculator(); }));
    } else {
      const pp = computePurchasingPower();
      const yearsOpts = CPI_HISTORY_1990_2025.map(([y]) => y);
      calcPanel.innerHTML = `${topTabs}
        <div class="panel-head">
          <div>
            <h2 class="panel-title">Historical NOK Purchasing Power Calculator (1990–2025)</h2>
            <p class="panel-sub">Convert Norwegian krone values using SSB’s official annual CPI index (2015=100)</p>
          </div>
        </div>
        <div class="calc-summary">
          <div class="calc-stat is-highlight">
            <div class="calc-stat-label">Equivalent in ${ppState.toYear}</div>
            <div class="calc-stat-val num" id="pp-equiv" style="font-size:18px">NOK ${fmtNok(pp.equiv)}</div>
            <div class="calc-stat-note" id="pp-idx">CPI ${pp.cFrom.toFixed(1)} &rarr; ${pp.cTo.toFixed(1)}</div>
          </div>
          <div class="calc-stat">
            <div class="calc-stat-label">Cumulative Change</div>
            <div class="calc-stat-val num" id="pp-cum" style="color:${pp.cumPct >= 0 ? '#B4382B' : '#1B6B5C'}">${pp.cumPct >= 0 ? '+' : ''}${pp.cumPct.toFixed(1)}%</div>
            <div class="calc-stat-note">Over ${pp.span} years</div>
          </div>
          <div class="calc-stat">
            <div class="calc-stat-label">Avg. Annual CPI</div>
            <div class="calc-stat-val num" id="pp-cagr">${pp.cagr.toFixed(2)}%</div>
            <div class="calc-stat-note">Compound annual rate</div>
          </div>
        </div>
        <div class="calc-inputs">
          <div class="field-row" style="grid-column:1/-1">
            <label for="pp-amount"><span>Amount in Base Year (NOK)</span><span class="mono">e.g. 100 000 kr</span></label>
            <input id="pp-amount" type="number" min="1" max="100000000" step="1000" value="${ppState.amount}">
          </div>
          <div class="field-row">
            <label for="pp-from"><span>From Year</span><span class="mono">1990–2025</span></label>
            <select id="pp-from">${yearsOpts.map((y) => `<option value="${y}" ${y === ppState.fromYear ? 'selected' : ''}>${y} (CPI ${CPI_BY_YEAR.get(y).toFixed(1)})</option>`).join('')}</select>
          </div>
          <div class="field-row">
            <label for="pp-to"><span>To Year</span><span class="mono">1990–2025</span></label>
            <select id="pp-to">${yearsOpts.map((y) => `<option value="${y}" ${y === ppState.toYear ? 'selected' : ''}>${y} (CPI ${CPI_BY_YEAR.get(y).toFixed(1)})</option>`).join('')}</select>
          </div>
        </div>
        <div class="quick-pp-bar">
          <span><strong>Benchmarks:</strong> 1990&rarr;2025 = +129.9% (2.40%/yr) · 2000&rarr;2025 = +82.6% · 2020&rarr;2025 = +22.7%</span>
        </div>
        <div class="source-caption">
          <span><strong>Source:</strong> Statistics Norway (SSB Table 03013 / 14700) · Annual CPI 2015=100</span>
          <a href="#/tables">View 36-yr table &rarr;</a>
        </div>`;

      const refreshPp = () => {
        const r = computePurchasingPower();
        calcPanel.querySelector('#pp-equiv').textContent = `NOK ${fmtNok(r.equiv)}`;
        calcPanel.querySelector('#pp-idx').textContent = `CPI ${r.cFrom.toFixed(1)} -> ${r.cTo.toFixed(1)}`;
        const cum = calcPanel.querySelector('#pp-cum');
        cum.textContent = `${r.cumPct >= 0 ? '+' : ''}${r.cumPct.toFixed(1)}%`;
        cum.style.color = r.cumPct >= 0 ? '#B4382B' : '#1B6B5C';
        calcPanel.querySelector('#pp-cagr').textContent = `${r.cagr.toFixed(2)}%`;
      };
      calcPanel.querySelector('#pp-amount').addEventListener('input', (e) => { const v = Number(e.target.value); if (v > 0) { ppState.amount = v; refreshPp(); } });
      calcPanel.querySelector('#pp-from').addEventListener('change', (e) => { ppState.fromYear = Number(e.target.value); drawCalculator(); });
      calcPanel.querySelector('#pp-to').addEventListener('change', (e) => { ppState.toYear = Number(e.target.value); drawCalculator(); });
    }

    calcPanel.querySelectorAll('[data-calc-tab]').forEach((b) => b.addEventListener('click', () => { calcTab = b.dataset.calcTab; drawCalculator(); }));
  }
  drawCalculator();
  twoCol.appendChild(calcPanel);
  root.appendChild(twoCol);

  const tablePanel = document.createElement('section');
  tablePanel.className = 'panel';
  tablePanel.style.marginTop = '58px';
  tablePanel.innerHTML = `
    <div class="panel-head">
      <div>
        <h2 class="panel-title">Reconciled National Macroeconomic Accounts (2016–2025)</h2>
        <p class="panel-sub">Annual GDP, headline CPI, Norges Bank sight deposit rate, full-time monthly earnings, and external goods balance</p>
      </div>
      <a class="btn btn-ghost" href="#/tables">Filter &amp; Export CSV &rarr;</a>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Year</th><th class="num">Nominal GDP (NOK bn)</th><th class="num">Mainland GDP (%)</th>
            <th class="num">Headline CPI (%)</th><th class="num">Policy Rate (%)</th>
            <th class="num">Monthly Wage (NOK)</th><th class="num">Goods Surplus (NOK bn)</th>
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
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="source-caption">
      <span><strong>Sources:</strong> Statistics Norway (SSB Tables 09170, 14700, 11418, 08801) &amp; Norges Bank</span>
      <span>2025 figures represent preliminary national accounts &amp; Nov 2025 earnings census</span>
    </div>`;
  root.appendChild(tablePanel);
}
