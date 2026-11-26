import { renderOverview } from './views/overview.js';

const rootEl = document.getElementById('app-root');
const navEl = document.getElementById('primary-nav');
const navToggle = document.getElementById('nav-toggle');
const quickSearch = document.getElementById('quick-search');

let renderSeq = 0;

function parseHash() {
  const raw = (window.location.hash || '#/').replace(/^#/, '');
  const [pathPart, queryPart] = raw.split('?');
  const segment = pathPart.replace(/^\/+|\/+$/g, '').split('/')[0] || '';
  const params = new URLSearchParams(queryPart || '');
  return { route: segment || 'overview', params };
}

function updateActiveNav(route) {
  const normalized = route === 'regions' ? 'demographics' : route;
  document.querySelectorAll('.nav-link').forEach((link) => {
    const active = link.dataset.route === normalized;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

async function renderRoute() {
  const seq = ++renderSeq;
  const { route, params } = parseHash();
  updateActiveNav(route);

  if (navEl && navEl.classList.contains('is-open')) {
    navEl.classList.remove('is-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }

  if (route === 'overview') {
    renderOverview(rootEl);
    window.scrollTo(0, 0);
    return;
  }

  if (route === 'economy') {
    const mod = await import('./views/economy.js');
    if (seq !== renderSeq) return;
    mod.renderEconomy(rootEl, params);
    window.scrollTo(0, 0);
    return;
  }

  if (route === 'demographics' || route === 'regions') {
    const mod = await import('./views/demographics.js');
    if (seq !== renderSeq) return;
    mod.renderDemographics(rootEl, params);
    window.scrollTo(0, 0);
    return;
  }

  if (route === 'tables') {
    const mod = await import('./views/tables.js');
    if (seq !== renderSeq) return;
    mod.renderTables(rootEl, params);
    window.scrollTo(0, 0);
    return;
  }

  if (route === 'releases') {
    const mod = await import('./views/releases.js');
    if (seq !== renderSeq) return;
    mod.renderReleases(rootEl, params);
    window.scrollTo(0, 0);
    return;
  }

  renderOverview(rootEl);
}

if (navToggle && navEl) {
  navToggle.addEventListener('click', () => {
    const open = navEl.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

if (quickSearch) {
  quickSearch.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const q = quickSearch.value.trim();
    if (!q) return;
    const lower = q.toLowerCase();
    if (lower.includes('cpi') || lower.includes('inflat') || lower.includes('wage') || lower.includes('rate')) {
      window.location.hash = '#/economy';
    } else if (lower.includes('oslo') || lower.includes('vestland') || lower.includes('region') || lower.includes('age') || lower.includes('pyramid')) {
      window.location.hash = `#/demographics?q=${encodeURIComponent(q)}`;
    } else if (lower.includes('release') || lower.includes('calendar') || lower.includes('method')) {
      window.location.hash = '#/releases';
    } else {
      window.location.hash = `#/tables?q=${encodeURIComponent(q)}`;
    }
  });
}

window.addEventListener('hashchange', renderRoute);
renderRoute();
