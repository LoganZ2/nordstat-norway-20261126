const SECONDARY_CSS = `
:root{--tint-n:var(--tn);--tint-c:var(--tc);--muted:var(--mut)}
.btn{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;font-size:12px;font-weight:600;border-radius:3px;border:1px solid var(--navy);background:var(--navy);color:var(--inv);cursor:pointer}
.btn:hover{background:var(--navy2);text-decoration:none}
.btn-ghost{background:var(--surf);color:var(--navy);border-color:var(--rule)}.btn-ghost:hover{background:var(--sub)}
.grid-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start}
.grid-atlas{display:grid;grid-template-columns:minmax(0,.96fr) minmax(0,1.24fr);gap:14px;align-items:start}
.calc-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:10px}
.calc-stat{background:var(--bg);border:1px solid var(--rule);border-radius:3px;padding:8px 10px}
.calc-stat.is-highlight{background:var(--tint-n);border-color:var(--navy)}
.calc-stat-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.calc-stat-val{font:700 20px/1.15 var(--serif);margin-top:2px;color:var(--ink);font-variant-numeric:tabular-nums}
.calc-stat-note{font-size:10.5px;color:var(--ink2);margin-top:2px}
.calc-inputs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 12px}
.field-row{display:flex;flex-direction:column;gap:3px}
.field-row label{display:flex;justify-content:space-between;align-items:baseline;gap:6px;font-size:11.2px;font-weight:600;color:var(--ink2)}
.field-row label .mono{white-space:nowrap;flex-shrink:0}
.field-row input[type="range"]{width:100%;accent-color:var(--navy);margin:0}
.field-row input[type="number"],.field-row select,.inline-select{width:100%;padding:4px 7px;border:1px solid var(--rule);border-radius:3px;font:12.5px var(--mono);background:var(--bg)}
.inline-select{width:auto;font-size:11.5px;padding:3px 6px;background:var(--surf)}
.quick-pp-bar{margin-top:9px;padding:6px 9px;background:var(--tint-c);border:1px solid #E8CBC7;border-radius:3px;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11.2px;color:var(--ink)}
.quick-pp-btn{border:0;background:transparent;color:var(--crim);font-weight:700;cursor:pointer;white-space:nowrap;padding:0}
.quick-pp-btn:hover{text-decoration:underline}
.atlas-body{display:grid;grid-template-columns:224px minmax(0,1fr);gap:12px;align-items:start}
.map-wrap{background:var(--bg);border:1px solid var(--rule);border-radius:3px;padding:5px}
.region-path{cursor:pointer;transition:opacity .12s}.region-path:hover{opacity:.85}
.region-detail{background:var(--bg);border:1px solid var(--rule);border-left:3px solid var(--navy);border-radius:3px;padding:9px 11px}
.region-detail-head{display:flex;justify-content:space-between;align-items:baseline;gap:6px;margin-bottom:5px}
.region-detail-head h3{font-size:15.5px}.region-code{font:700 11px var(--mono);color:var(--navy)}
.compare-bar{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:7px;font-size:11px;color:var(--ink2)}
.region-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-bottom:7px}
.region-metric-box{background:var(--surf);border:1px solid var(--rule);padding:5px 8px;border-radius:2px}
.region-metric-box span{display:block;font-size:9.8px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.region-metric-box strong{font:700 13.5px var(--mono);color:var(--ink)}
.cmp-delta{font:600 10px var(--mono);color:var(--crim);margin-top:1px}
.table-wrap{width:100%;overflow-x:auto}
.data-table{width:100%;border-collapse:collapse;font-size:12px}
.data-table th{text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--ink2);padding:5px 7px;border-bottom:2px solid var(--navy);background:var(--bg);white-space:nowrap}
.data-table th.num,.data-table td.num{text-align:right}
.data-table td{padding:4.5px 7px;border-bottom:1px solid var(--sub);vertical-align:middle}
.data-table tbody tr:hover{background:#F9F8F4}
.data-table tbody tr.is-selected{background:var(--tint-n);font-weight:600}
.data-table tbody tr.is-compared{background:var(--tint-c)}
.sort-btn{border:0;background:transparent;padding:0;font:inherit;text-transform:inherit;color:inherit;cursor:pointer}
.sort-btn:hover{color:var(--navy)}
.toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:9px;margin-bottom:11px}
.filter-input{min-width:220px;padding:6px 10px;border:1px solid var(--rule);border-radius:3px;background:var(--surf);font-size:12.5px}
@media (max-width:980px){.grid-two,.grid-atlas{grid-template-columns:minmax(0,1fr)}}
@media (max-width:720px){.calc-summary,.calc-inputs,.atlas-body{grid-template-columns:minmax(0,1fr)}}
`;

export function ensureSecondaryStyles() {
  if (document.getElementById('nordstat-sec-css')) return;
  const s = document.createElement('style');
  s.id = 'nordstat-sec-css';
  s.textContent = SECONDARY_CSS;
  document.head.appendChild(s);
}
