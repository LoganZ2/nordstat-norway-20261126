export const ECONOMY_SNAPSHOT = [
  { label: 'Nominal GDP (Total)', value: 'NOK 5,511 bn', note: 'FY 2025 · SSB Table 09170' },
  { label: 'Avg. Monthly Earnings', value: 'NOK 62,070', note: 'Nov 2025 · Median 55,800 · SSB 11418' },
  { label: 'Norges Bank Policy Rate', value: '4.00%', note: 'Dec 2025 · Down from 4.50% peak' },
  { label: 'Goods Trade Surplus', value: 'NOK 630 bn', note: 'FY 2025 · Exports 2,501 bn · SSB 08801' },
];

// COICOP 2018 weights sum to 100.0%; weighted 2025 inflation reconciles to 3.1% headline CPI
export const CPI_BASKET = [
  { code: '04', name: 'Housing, water & electricity', short: 'Housing & Power', weight: 31.2, rate: 3.6, color: '#12324B' },
  { code: '07', name: 'Transport & fuels', short: 'Transport', weight: 13.8, rate: 2.2, color: '#235073' },
  { code: '01', name: 'Food & non-alcoholic beverages', short: 'Food & Groceries', weight: 11.5, rate: 4.4, color: '#B4382B' },
  { code: '12', name: 'Financial, alcohol, educ. & misc.', short: 'Services & Other', weight: 10.4, rate: 3.7, color: '#587490' },
  { code: '09', name: 'Recreation, sport & culture', short: 'Recreation', weight: 8.5, rate: 2.5, color: '#1B6B5C' },
  { code: '11', name: 'Restaurants & accommodation', short: 'Dining & Hotels', weight: 5.9, rate: 4.2, color: '#A9641B' },
  { code: '05', name: 'Furnishings & household equip.', short: 'Furnishings', weight: 5.9, rate: 1.6, color: '#6E7F91' },
  { code: '08', name: 'Information & communication', short: 'Comms & Media', weight: 5.3, rate: 0.9, color: '#7D8E9E' },
  { code: '03', name: 'Clothing & footwear', short: 'Clothing', weight: 4.3, rate: 1.2, color: '#8C9BA8' },
  { code: '06', name: 'Health & care services', short: 'Health', weight: 3.2, rate: 3.8, color: '#2E7D6E' },
];

export const CALC_PRESETS = {
  national: { label: 'National Avg.', housing: 31, food: 12, transport: 14, dining: 14, other: 29, wageNok: 62070, wageRaise: 4.5 },
  osloRenter: { label: 'Oslo Renter', housing: 42, food: 14, transport: 8, dining: 16, other: 20, wageNok: 65400, wageRaise: 4.4 },
  commuterFamily: { label: 'Family (Car)', housing: 34, food: 18, transport: 19, dining: 10, other: 19, wageNok: 58500, wageRaise: 4.2 },
};

// Annual average CPI index 1990-2025 (2015 = 100, Statistics Norway SSB Tables 03013 & 14700)
export const CPI_HISTORY_1990_2025 = [
  [1990, 59.9], [1991, 61.9], [1992, 63.4], [1993, 64.8], [1994, 65.7], [1995, 67.3],
  [1996, 68.1], [1997, 69.9], [1998, 71.5], [1999, 73.1], [2000, 75.4], [2001, 77.7],
  [2002, 78.7], [2003, 80.6], [2004, 81.0], [2005, 82.3], [2006, 84.2], [2007, 84.8],
  [2008, 88.0], [2009, 89.9], [2010, 92.1], [2011, 93.3], [2012, 93.9], [2013, 95.9],
  [2014, 97.9], [2015, 100.0], [2016, 103.5], [2017, 105.5], [2018, 108.4], [2019, 110.8],
  [2020, 112.2], [2021, 116.1], [2022, 122.9], [2023, 129.6], [2024, 133.6], [2025, 137.7],
];

export const MACRO_ACCOUNTS = [
  { year: 2025, nominalGdp: 5511, mainlandGrowth: 1.7, cpi: 3.1, policyRate: 4.00, monthlyWage: 62070, tradeSurplus: 630 },
  { year: 2024, nominalGdp: 5382, mainlandGrowth: 0.6, cpi: 3.1, policyRate: 4.50, monthlyWage: 59370, tradeSurplus: 569 },
  { year: 2023, nominalGdp: 5112, mainlandGrowth: 0.7, cpi: 5.5, policyRate: 4.50, monthlyWage: 56360, tradeSurplus: 734 },
  { year: 2022, nominalGdp: 5569, mainlandGrowth: 4.3, cpi: 5.8, policyRate: 2.75, monthlyWage: 53150, tradeSurplus: 1574 },
  { year: 2021, nominalGdp: 4224, mainlandGrowth: 4.5, cpi: 3.5, policyRate: 0.50, monthlyWage: 50790, tradeSurplus: 525 },
  { year: 2020, nominalGdp: 3461, mainlandGrowth: -4.7, cpi: 1.3, policyRate: 0.00, monthlyWage: 48750, tradeSurplus: 28 },
  { year: 2019, nominalGdp: 3569, mainlandGrowth: 2.3, cpi: 2.2, policyRate: 1.50, monthlyWage: 47290, tradeSurplus: 158 },
  { year: 2018, nominalGdp: 3554, mainlandGrowth: 2.2, cpi: 2.8, policyRate: 0.75, monthlyWage: 45610, tradeSurplus: 281 },
  { year: 2017, nominalGdp: 3304, mainlandGrowth: 2.2, cpi: 1.9, policyRate: 0.50, monthlyWage: 44310, tradeSurplus: 162 },
  { year: 2016, nominalGdp: 3117, mainlandGrowth: 1.1, cpi: 3.5, policyRate: 0.50, monthlyWage: 43300, tradeSurplus: 132 },
];
