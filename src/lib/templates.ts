// HTML for the copy-driven lists. Astro uses it for the first render and the client reuses it on language change.
import type { Copy } from '../i18n/copy';

const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"></path></svg>';

export function esc(s: unknown): string {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
}

function tags(list: string[]): string {
  return list.map((t) => '<li class="tag">' + esc(t) + '</li>').join('');
}

export function servicesHtml(c: Copy): string {
  return c.services.map((s) =>
    '<li class="card card--service glass"><img src="/images/icon-' + s[0] + '-256.webp" srcset="/images/icon-' + s[0] + '-128.webp 128w, /images/icon-' + s[0] + '-256.webp 256w" sizes="112px" alt="" width="112" height="112" loading="lazy" decoding="async"><h3>' + esc(s[1]) + '</h3><p>' + esc(s[2]) + '</p></li>'
  ).join('');
}

export function projectsHtml(c: Copy): string {
  return c.projects.map((p) => {
    const foot = p.href
      ? '<a class="link" href="' + esc(p.href) + '" target="_blank" rel="noopener">' + esc(p.link) + ARROW + '</a>'
      : '<span class="card__status">' + esc(p.status) + '</span>';
    // A one-word title is a domain; it gets its own class so it shrinks instead of breaking mid-word.
    return '<li class="card card--project glass"><p class="card__client">' + esc(p.client) + '</p><h3' + (p.title.indexOf(' ') < 0 ? ' class="card__url"' : '') + '>' + esc(p.title) + '</h3><p class="card__body">' + esc(p.body) + '</p>' +
      '<ul class="tags" aria-label="Stack">' + tags(p.tags) + '</ul><div class="card__foot">' + foot + '</div></li>';
  }).join('');
}

export function progressHtml(c: Copy): string {
  return c.progress.map((g) =>
    '<li class="card card--small glass"><div class="card__top"><h4>' + esc(g[0]) + '</h4><span class="tag tag--accent">' + esc(c.inProgress) + '</span></div><p>' + esc(g[1]) + '</p><ul class="tags" aria-label="Stack">' + tags(g[2]) + '</ul></li>'
  ).join('');
}

export function stepsHtml(c: Copy): string {
  return c.steps.map((s) =>
    '<li><span class="dot" aria-hidden="true"></span><div><p class="when">' + esc(s[0]) + '</p><p class="what">' + esc(s[1]) + '</p></div></li>'
  ).join('');
}
