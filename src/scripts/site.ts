// Page behavior: language, theme, mobile menu, toast and copy email.
import { COPY, type Lang } from '../i18n/copy';
import { servicesHtml, projectsHtml, progressHtml, stepsHtml } from '../lib/templates';

const EMAIL = 'contacto@jstevenfm.com';
const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let lang: Lang = 'es';

function store(key: string, value?: string): string | null {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch (e) { /* Storage can be blocked; the page works without it. */ }
  return null;
}

function byId<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

// Language
function render() {
  const c = COPY[lang];
  root.lang = lang;
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    // Text sits in a span so the swap animation never touches glass backgrounds.
    const t = document.createElement('span');
    t.className = 'i18n-t';
    t.textContent = String(c[el.dataset.i18n as string]);
    el.replaceChildren(t);
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((el) => {
    const [attr, key] = (el.dataset.i18nAttr as string).split(':');
    el.setAttribute(attr, String(c[key]));
  });
  document.querySelectorAll<HTMLElement>('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  byId('services').innerHTML = servicesHtml(c);
  byId('projects').innerHTML = projectsHtml(c);
  byId('progress').innerHTML = progressHtml(c);
  byId('steps').innerHTML = stepsHtml(c);
}

let swapOut = 0;
let swapIn = 0;
function applyLang() {
  render();
  // render() resets the menu label to "open"; keep it accurate while the panel is open.
  if (menuOpen) setMenu(true);
}
function setLang(next: Lang) {
  if (next === lang) return;
  lang = next;
  store('jf-lang', next);
  clearTimeout(swapOut);
  clearTimeout(swapIn);
  root.classList.remove('lang-in');
  if (reduceMotion.matches) { root.classList.remove('lang-out'); applyLang(); return; }
  root.classList.add('lang-out');
  swapOut = window.setTimeout(() => {
    applyLang();
    root.classList.remove('lang-out');
    root.classList.add('lang-in');
    swapIn = window.setTimeout(() => root.classList.remove('lang-in'), 300);
  }, 100);
}

// Theme: follows the system until the visitor picks one. The saved choice is applied in <head> to avoid a flash.
function isDark() {
  const t = root.getAttribute('data-theme');
  if (t) return t === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Mobile and tablet menu
const menuBtn = byId<HTMLButtonElement>('menu-toggle');
const panel = byId('menu-panel');
let menuOpen = false;

// Hide an element after its closing animation, or right away when motion is reduced.
function hideAnimated(el: HTMLElement, done?: () => void) {
  if (reduceMotion.matches || el.hidden) { el.hidden = true; done?.(); return; }
  el.classList.add('is-closing');
  let finished = false;
  function finish(e?: AnimationEvent) {
    if (finished || (e && e.target !== el)) return;
    finished = true;
    el.removeEventListener('animationend', finish);
    clearTimeout(fallback);
    if (!el.classList.contains('is-closing')) return;
    el.classList.remove('is-closing');
    el.hidden = true;
    done?.();
  }
  el.addEventListener('animationend', finish);
  // animationend can be skipped (background tab, interrupted animation), so a timer guarantees the hide.
  const fallback = window.setTimeout(finish, 260);
}

function setMenu(open: boolean) {
  menuOpen = open;
  if (open) { panel.classList.remove('is-closing'); panel.hidden = false; }
  else hideAnimated(panel);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', String(COPY[lang][open ? 'menuClose' : 'menuLabel']));
}

// Toast
const toast = byId('toast');
let toastTimer = 0;
function showToast(key: string) {
  toast.textContent = String(COPY[lang][key]);
  toast.classList.remove('is-closing');
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => hideAnimated(toast), 2800);
}

const savedLang = store('jf-lang');
lang = savedLang === 'es' || savedLang === 'en' ? savedLang : ((navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en');
render();
document.querySelectorAll<HTMLElement>('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang as Lang)));

byId('theme-toggle').addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  store('jf-theme', next);
});

menuBtn.addEventListener('click', () => setMenu(!menuOpen));
panel.addEventListener('click', (e) => { if ((e.target as Element).closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus(); } });

document.querySelectorAll('.js-cv').forEach((b) => b.addEventListener('click', () => showToast('toastCv')));
document.querySelectorAll('.js-soon').forEach((b) => b.addEventListener('click', () => showToast('toastBlog')));

const copyBtn = byId('copy-mail');
copyBtn.addEventListener('click', () => {
  if (!navigator.clipboard) { showToast('toastCopyFail'); return; }
  navigator.clipboard.writeText(EMAIL).then(() => {
    showToast('toastCopied');
    copyBtn.classList.add('is-done');
    window.setTimeout(() => copyBtn.classList.remove('is-done'), 1800);
  }, () => showToast('toastCopyFail'));
});
