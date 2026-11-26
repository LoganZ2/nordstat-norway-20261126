export const STATBANK_SERIES = [
  { id: 'NA-01', domain: 'Economy', indicator: 'Mainland GDP Volume Growth', unit: '% YoY', table: 'SSB 09170', v2021: 4.5, v2022: 4.3, v2023: 0.7, v2024: 0.6, v2025: 1.7 },
  { id: 'NA-02', domain: 'Economy', indicator: 'Total GDP Volume Growth', unit: '% YoY', table: 'SSB 09170', v2021: 3.9, v2022: 3.0, v2023: 0.5, v2024: 1.4, v2025: 1.1 },
  { id: 'NA-03', domain: 'Economy', indicator: 'Nominal GDP (Current Prices)', unit: 'NOK bn', table: 'SSB 09170', v2021: 4224, v2022: 5569, v2023: 5112, v2024: 5382, v2025: 5511 },
  { id: 'NA-04', domain: 'Economy', indicator: 'Goods Export Value', unit: 'NOK bn', table: 'SSB 08801', v2021: 1384, v2022: 2641, v2023: 1756, v2024: 2440, v2025: 2501 },
  { id: 'NA-05', domain: 'Economy', indicator: 'Goods Trade Surplus', unit: 'NOK bn', table: 'SSB 08801', v2021: 525, v2022: 1574, v2023: 734, v2024: 569, v2025: 630 },
  { id: 'PR-01', domain: 'Prices', indicator: 'Consumer Price Index (All-Items CPI)', unit: '% YoY', table: 'SSB 14700', v2021: 3.5, v2022: 5.8, v2023: 5.5, v2024: 3.1, v2025: 3.1 },
  { id: 'PR-02', domain: 'Prices', indicator: 'Core Inflation (CPI-ATE)', unit: '% YoY', table: 'SSB 14700', v2021: 1.7, v2022: 3.9, v2023: 6.2, v2024: 3.7, v2025: 3.0 },
  { id: 'PR-03', domain: 'Prices', indicator: 'Norges Bank Sight Deposit Rate (Year-End)', unit: '%', table: 'Norges Bank', v2021: 0.50, v2022: 2.75, v2023: 4.50, v2024: 4.50, v2025: 4.00 },
  { id: 'LB-01', domain: 'Labour', indicator: 'AKU Unemployment Rate (Aged 15–74)', unit: '%', table: 'SSB 13760', v2021: 4.4, v2022: 3.2, v2023: 3.6, v2024: 4.0, v2025: 4.6 },
  { id: 'LB-02', domain: 'Labour', indicator: 'Average Monthly Gross Earnings (Full-Time)', unit: 'NOK', table: 'SSB 11418', v2021: 50790, v2022: 53150, v2023: 56360, v2024: 59370, v2025: 62070 },
  { id: 'LB-03', domain: 'Labour', indicator: 'Median Monthly Gross Earnings (Full-Time)', unit: 'NOK', table: 'SSB 11418', v2021: 45830, v2022: 47720, v2023: 50660, v2024: 53400, v2025: 55800 },
  { id: 'DM-01', domain: 'Population', indicator: 'Total Resident Population', unit: 'Million', table: 'SSB 07459', v2021: 5.41, v2022: 5.46, v2023: 5.52, v2024: 5.58, v2025: 5.63 },
  { id: 'DM-02', domain: 'Population', indicator: 'Total Fertility Rate (Children / Woman)', unit: 'Rate', table: 'SSB 04232', v2021: 1.55, v2022: 1.41, v2023: 1.40, v2024: 1.44, v2025: 1.48 },
  { id: 'DM-03', domain: 'Population', indicator: 'Share of Population Aged 65 and Older', unit: '%', table: 'SSB 07459', v2021: 17.9, v2022: 18.2, v2023: 18.5, v2024: 18.7, v2025: 18.9 },
  { id: 'EN-01', domain: 'Climate', indicator: 'Territorial Greenhouse Gas Emissions (AR5)', unit: 'Mt CO₂e', table: 'SSB 13931', v2021: 49.2, v2022: 48.8, v2023: 46.6, v2024: 44.6, v2025: 44.1 },
  { id: 'EN-02', domain: 'Climate', indicator: 'Renewable Share of Electricity Generation', unit: '%', table: 'SSB 08307', v2021: 98.4, v2022: 98.5, v2023: 98.2, v2024: 98.3, v2025: 98.1 },
];

export const RELEASE_CALENDAR = [
  { date: '2026-12-10', time: '08:00 CET', domain: 'Prices', title: 'Consumer Price Index (CPI & CPI-ATE), November 2026', table: 'SSB Table 14700', status: 'Scheduled' },
  { date: '2026-12-15', time: '08:00 CET', domain: 'Economy', title: 'External Trade in Goods, November 2026', table: 'SSB Table 08801', status: 'Scheduled' },
  { date: '2026-12-17', time: '10:00 CET', domain: 'Prices', title: 'Norges Bank Monetary Policy Report & Rate Decision', table: 'Norges Bank', status: 'Scheduled' },
  { date: '2026-12-18', time: '08:00 CET', domain: 'Labour', title: 'Labour Force Survey (AKU), Q4 Trend Estimate', table: 'SSB Table 13760', status: 'Scheduled' },
  { date: '2027-01-11', time: '08:00 CET', domain: 'Prices', title: 'Annual CPI Revision & 2027 COICOP Basket Weights', table: 'SSB Table 14700', status: 'Scheduled' },
  { date: '2027-02-04', time: '08:00 CET', domain: 'Labour', title: 'Annual Earnings Census (A-ordningen), Nov 2026 Benchmark', table: 'SSB Table 11418', status: 'Scheduled' },
  { date: '2027-02-12', time: '08:00 CET', domain: 'Economy', title: 'Preliminary Annual National Accounts, FY 2026', table: 'SSB Table 09170', status: 'Scheduled' },
  { date: '2027-02-22', time: '08:00 CET', domain: 'Population', title: 'Population Registry by County, Age & Sex (1 Jan 2027)', table: 'SSB Table 07459', status: 'Scheduled' },
  { date: '2027-03-09', time: '08:00 CET', domain: 'Population', title: 'Vital Statistics: Births, Fertility & Life Expectancy 2026', table: 'SSB Table 04232', status: 'Scheduled' },
  { date: '2027-06-03', time: '08:00 CET', domain: 'Climate', title: 'Territorial Emissions to Air (Preliminary FY 2026)', table: 'SSB Table 13931', status: 'Scheduled' },
];

export const METHODOLOGY_NOTES = [
  {
    standard: 'Mainland vs. Total GDP (SNA 2008 / ESA 2010)',
    detail: 'Because offshore petroleum and ocean transport fluctuate sharply with global hydrocarbon prices, Norwegian fiscal and monetary authorities track Mainland Norway GDP in chain-linked constant prices as the core indicator of domestic business cycles.',
  },
  {
    standard: 'CPI & COICOP 2018 Weighting',
    detail: 'Expenditure weights (1,000 per mille) are updated every January directly from National Accounts household final consumption rather than lagging budget surveys. Core CPI-ATE strips out energy products and direct tax adjustments.',
  },
  {
    standard: 'Labour Force Survey (AKU / ILO Standard)',
    detail: 'The quarterly and monthly AKU survey covers all residents aged 15–74 actively seeking work, complementing NAV registered jobseeker counts with internationally comparable unemployment figures.',
  },
  {
    standard: 'NUTS-2 Regions & County Boundaries (2024 Reform)',
    detail: 'Following Norway’s January 2024 administrative re-division into 15 counties (separating Oslo/Akershus, Buskerud/Østfold, Vestfold/Telemark, and Troms/Finnmark), county registries aggregate cleanly into 7 official Eurostat NUTS-2 regions.',
  },
];
