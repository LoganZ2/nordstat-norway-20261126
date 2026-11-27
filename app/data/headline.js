export const YEARS_ANNUAL = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

export const HEADLINE_KPIS = [
  ['gdp', 'Mainland GDP Growth', '+1.7%', '+1.1 pp vs 2024', 'delta-up', 'navy', 'FY 2025', 'SSB 09170 · Feb 2026', '#/economy', 'gdp', [1.1, 2.2, 2.2, 2.3, -4.7, 4.5, 4.3, 0.7, 0.6, 1.7]],
  ['cpi', 'CPI Inflation (Annual)', '3.1%', 'Target 2.0%', 'delta-warn', 'crimson', 'FY 2025', 'SSB 14700 · Jan 2026', '#/economy', 'cpi', [3.5, 1.9, 2.8, 2.2, 1.3, 3.5, 5.8, 5.5, 3.1, 3.1]],
  ['unemp', 'Unemployment (AKU)', '4.6%', '+0.6 pp vs 2024', 'delta-neutral', 'ochre', 'Q4 2025', 'SSB 13760 · Q4 2025', '#/tables', 'unemp', [4.7, 4.2, 3.8, 3.7, 4.4, 4.4, 3.2, 3.6, 4.0, 4.6]],
  ['pop', 'Resident Population', '5.63M', '+0.9% YoY', 'delta-up', 'teal', '2025', 'SSB 07459 · 15 Counties', '#/demographics', 'ghg', [5.23, 5.28, 5.31, 5.35, 5.38, 5.41, 5.46, 5.52, 5.58, 5.63]],
];

export const SERIES_TABS = [
  ['gdp', 'Mainland GDP', 'GDP'],
  ['cpi', 'CPI Inflation', 'CPI'],
  ['unemp', 'Unemployment', 'Jobs'],
  ['ghg', 'GHG Emissions', 'GHG'],
];

export const GDP_SERIES = {
  id: 'gdp',
  headline: 'Mainland GDP rebounded to +1.7% in 2025, topping its 10-year average',
  subtitle: 'Annual volume change (%), excluding petroleum extraction & ocean transport',
  unit: '%', kind: 'bar', color: '#12324B', negColor: '#B4382B',
  reference: { value: 1.5, label: 'Avg +1.5%' },
  source: 'Statistics Norway (SSB), National Accounts Table 09170 · Feb 2026',
  values: [1.1, 2.2, 2.2, 2.3, -4.7, 4.5, 4.3, 0.7, 0.6, 1.7],
  notes: {
    2020: 'Pandemic contraction across services & hospitality',
    2021: 'Post-lockdown domestic reopening surge',
    2024: '4.50% policy rate dampened housing & retail',
    2025: 'Broad recovery led by private demand & hydro power',
  },
};

export const LATEST_BULLETINS = [
  ['National Accounts', 'Feb 2026 · SSB 09170', 'Nominal GDP hit NOK 5,511 bn with NOK 630 bn surplus', 'Mainland growth reached +1.7% alongside resilient offshore exports.', '#/economy'],
  ['Wages & Prices', 'Jan 2026 · SSB 11418', 'Monthly earnings rose 4.5% to NOK 62,070 (median 55,800)', 'Real purchasing power grew +1.4% above 3.1% headline CPI.', '#/economy'],
  ['Demography', 'Feb 2026 · SSB 07459', 'Population reached 5.627M across 15 counties; 65+ at 18.9%', 'Oslo & Akershus hold 26.3% of residents; fertility at 1.48.', '#/demographics'],
  ['Climate & EVs', 'Jan 2026 · SSB 13931', 'EV share hit 95.9% of new cars; GHG fell to 44.1 Mt CO₂e', '98.1% renewable hydro/wind power grid cut territorial emissions.', '#/tables'],
];
