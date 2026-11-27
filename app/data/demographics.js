export const AGE_BANDS = [
  '0–4', '5–9', '10–14', '15–19', '20–24', '25–29',
  '30–34', '35–39', '40–44', '45–49', '50–54', '55–59',
  '60–64', '65–69', '70–74', '75–79', '80–84', '85+',
];

export const PYRAMID_YEARS = {
  2025: {
    year: 2025, totalLabel: '5,627,429', medianAge: '41.1 yrs', tfr: '1.48',
    lifeExpM: '80.9 yrs', lifeExpF: '84.7 yrs',
    shares: { young: 16.2, working: 64.9, senior: 18.9 },
    male:   [141, 154, 170, 174, 178, 194, 206, 204, 194, 189, 192, 188, 169, 152, 134, 108, 63, 42],
    female: [134, 146, 161, 164, 167, 184, 195, 193, 183, 179, 183, 181, 166, 153, 140, 118, 77, 71],
  },
  2015: {
    year: 2015, totalLabel: '5,166,493', medianAge: '39.2 yrs', tfr: '1.72',
    lifeExpM: '80.1 yrs', lifeExpF: '84.1 yrs',
    shares: { young: 18.0, working: 65.8, senior: 16.2 },
    male:   [158, 161, 161, 167, 176, 178, 174, 175, 187, 188, 173, 158, 144, 133, 95, 63, 41, 31],
    female: [150, 153, 153, 158, 166, 170, 165, 166, 177, 178, 165, 153, 143, 135, 101, 74, 57, 62],
  },
  2005: {
    year: 2005, totalLabel: '4,623,291', medianAge: '38.0 yrs', tfr: '1.84',
    lifeExpM: '77.7 yrs', lifeExpF: '82.5 yrs',
    shares: { young: 19.5, working: 65.5, senior: 15.0 },
    male:   [149, 159, 161, 152, 141, 148, 171, 179, 167, 158, 151, 147, 116, 86, 72, 62, 41, 24],
    female: [142, 151, 153, 144, 136, 144, 165, 171, 159, 152, 146, 143, 117, 93, 85, 83, 68, 57],
  },
};

// All 15 official Norwegian counties (fylker, 2024-2026 administrative registry)
// Population sums to EXACT 5,627,429 (SSB Table 07459); net household income SSB 06944; AKU SSB 13760; EV share OFV 2025
export const NORWAY_COUNTIES = [
  {
    code: '32', name: 'Akershus', hub: 'Lillestrøm / Bærum',
    population: 749207, sharePct: 13.3, medianIncome: 782400, unempRate: 4.6, growth5y: 7.6, evShare: 97.1,
    path: 'M97,226 L112,226 L118,242 L114,257 L104,258 L103,249 L107,242 L99,240 L95,248 L92,240 Z',
    label: null,
  },
  {
    code: '03', name: 'Oslo', hub: 'Oslo (Capital)',
    population: 728714, sharePct: 12.9, medianIncome: 635200, unempRate: 5.2, growth5y: 5.1, evShare: 97.4,
    path: 'M99,240 L107,242 L103,249 L95,248 Z',
    label: null,
  },
  {
    code: '46', name: 'Vestland', hub: 'Bergen',
    population: 658342, sharePct: 11.7, medianIncome: 689500, unempRate: 3.9, growth5y: 3.4, evShare: 96.9,
    path: 'M32,188 L56,184 L68,194 L64,218 L52,238 L34,244 L24,234 L22,208 Z',
    label: [44, 216],
  },
  {
    code: '11', name: 'Rogaland', hub: 'Stavanger',
    population: 508922, sharePct: 9.0, medianIncome: 721600, unempRate: 4.1, growth5y: 5.2, evShare: 96.8,
    path: 'M24,234 L34,244 L52,238 L50,262 L44,274 L30,272 L22,254 Z',
    label: [36, 258],
  },
  {
    code: '50', name: 'Trøndelag', hub: 'Trondheim',
    population: 489166, sharePct: 8.7, medianIncome: 672100, unempRate: 4.0, growth5y: 4.1, evShare: 95.9,
    path: 'M82,148 L108,128 L124,132 L120,162 L106,176 L80,174 L72,162 Z',
    label: [100, 157],
  },
  {
    code: '34', name: 'Innlandet', hub: 'Hamar / Lillehammer',
    population: 379488, sharePct: 6.7, medianIncome: 618400, unempRate: 4.2, growth5y: 1.8, evShare: 93.1,
    path: 'M68,194 L80,174 L106,176 L116,196 L114,226 L97,226 L80,222 L64,218 Z',
    label: [92, 204],
  },
  {
    code: '42', name: 'Agder', hub: 'Kristiansand',
    population: 323930, sharePct: 5.8, medianIncome: 654300, unempRate: 4.4, growth5y: 4.7, evShare: 95.6,
    path: 'M44,274 L50,262 L66,264 L74,282 L56,298 L40,290 Z',
    label: [56, 283],
  },
  {
    code: '31', name: 'Østfold', hub: 'Sarpsborg / Fredrikstad',
    population: 316477, sharePct: 5.6, medianIncome: 632100, unempRate: 5.1, growth5y: 4.3, evShare: 95.2,
    path: 'M104,258 L114,257 L119,274 L106,278 L100,268 Z',
    label: [110, 270],
  },
  {
    code: '15', name: 'Møre og Romsdal', hub: 'Ålesund / Molde',
    population: 273169, sharePct: 4.9, medianIncome: 664800, unempRate: 3.8, growth5y: 2.7, evShare: 95.5,
    path: 'M46,168 L72,162 L80,174 L68,194 L56,184 L40,180 Z',
    label: [62, 178],
  },
  {
    code: '33', name: 'Buskerud', hub: 'Drammen',
    population: 272981, sharePct: 4.9, medianIncome: 668500, unempRate: 4.7, growth5y: 4.1, evShare: 95.8,
    path: 'M64,218 L80,222 L97,226 L92,240 L95,248 L82,250 L68,236 Z',
    label: [81, 236],
  },
  {
    code: '39', name: 'Vestfold', hub: 'Tønsberg',
    population: 259332, sharePct: 4.6, medianIncome: 661200, unempRate: 4.8, growth5y: 4.6, evShare: 96.0,
    path: 'M82,250 L95,248 L96,264 L85,270 L81,260 Z',
    label: [89, 261],
  },
  {
    code: '18', name: 'Nordland', hub: 'Bodø',
    population: 243272, sharePct: 4.3, medianIncome: 638700, unempRate: 4.1, growth5y: 0.8, evShare: 92.4,
    path: 'M108,128 L120,104 L138,76 L154,70 L160,82 L144,104 L132,126 L124,132 Z',
    label: [134, 105],
  },
  {
    code: '40', name: 'Telemark', hub: 'Skien',
    population: 177923, sharePct: 3.2, medianIncome: 624900, unempRate: 4.7, growth5y: 2.4, evShare: 94.4,
    path: 'M52,238 L68,236 L82,250 L81,260 L85,270 L74,282 L66,264 L50,262 Z',
    label: [68, 256],
  },
  {
    code: '55', name: 'Troms', hub: 'Tromsø',
    population: 171218, sharePct: 3.0, medianIncome: 652400, unempRate: 3.9, growth5y: 1.6, evShare: 91.8,
    path: 'M142,60 L166,44 L182,50 L174,66 L160,82 L154,70 L138,76 Z',
    label: [162, 62],
  },
  {
    code: '56', name: 'Finnmark', hub: 'Vadsø / Alta',
    population: 75288, sharePct: 1.3, medianIncome: 614200, unempRate: 4.5, growth5y: -0.4, evShare: 86.2,
    path: 'M166,44 L188,20 L216,14 L234,26 L224,48 L202,44 L188,58 L182,50 Z',
    label: [204, 34],
  },
];
