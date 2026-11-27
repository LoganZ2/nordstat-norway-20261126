import { renderOverview } from './views/overview.js';

const rootEl = document.getElementById('app-root');
const navEl = document.getElementById('primary-nav');
const navBtn = document.getElementById('nav-toggle');
const searchEl = document.getElementById('quick-search');
let seq = 0;

async function dispatch() {
  const cur = ++seq;
  const [p, q] = (location.hash || '#/').slice(1).split('?');
  const route = (p || '').replace(/^\/+|\/+$/g, '').split('/')[0] || 'overview';
  const params = new URLSearchParams(q || '');
  const norm = route === 'regions' ? 'demographics' : route;
  document.querySelectorAll('.nav-link').forEach((a) => {
    const on = a.dataset.route === norm;
    a.classList.toggle('is-active', on);
    on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
  if (navEl?.classList.contains('is-open')) {
    navEl.classList.remove('is-open');
    navBtn?.setAttribute('aria-expanded', 'false');
  }
  if (norm === 'economy') { const m = await import('./views/economy.js'); if (cur === seq) { m.renderEconomy(rootEl, params); scrollTo(0, 0); } return; }
  if (norm === 'demographics') { const m = await import('./views/demographics.js'); if (cur === seq) { m.renderDemographics(rootEl, params); scrollTo(0, 0); } return; }
  if (norm === 'tables') { const m = await import('./views/tables.js'); if (cur === seq) { m.renderTables(rootEl, params); scrollTo(0, 0); } return; }
  if (norm === 'releases') { const m = await import('./views/releases.js'); if (cur === seq) { m.renderReleases(rootEl, params); scrollTo(0, 0); } return; }
  renderOverview(rootEl);
  scrollTo(0, 0);
}

navBtn?.addEventListener('click', () => navBtn.setAttribute('aria-expanded', String(navEl.classList.toggle('is-open'))));
searchEl?.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const q = searchEl.value.trim();
  if (!q) return;
  const low = q.toLowerCase();
  location.hash = /cpi|inflat|wage|nok|rate/.test(low) ? '#/economy'
    : /oslo|vestland|rogaland|trond|finnmark|county|region|pyramid|age/.test(low) ? `#/demographics?q=${encodeURIComponent(q)}`
    : /release|calendar|method/.test(low) ? '#/releases'
    : `#/tables?q=${encodeURIComponent(q)}`;
});
addEventListener('hashchange', dispatch);
dispatch();
