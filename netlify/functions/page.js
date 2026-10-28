/* Serves index.html with SEO meta tags filled in on the server, so Google and
   social-media crawlers (WhatsApp, Facebook, X ...) see real titles, images and text. */
const fs = require('fs'), path = require('path');
const DB = 'https://nayeem-wabsite-default-rtdb.firebaseio.com';
const NAME = 'Nayeem Hossen';
const SITE = process.env.SITE_URL || 'https://nayeemplayz.netlify.app';
const COLL = { blog: 'blog', project: 'projects', app: 'apps' };

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = t => String(t || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'item';
const plain = h => String(h || '').replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, ' ').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const clip = (t, n) => (t.length > n ? t.slice(0, n - 1).trim() + '\u2026' : t);
const httpUrl = u => { const m = String(u || '').trim().split(/\s+/)[0]; return /^https?:\/\//i.test(m) ? m : ''; };
const listOf = v => (v ? Object.keys(v).map(id => Object.assign({ id }, v[id])).reverse().filter(i => !i.locked && !i.enc) : []);

async function getJSON(p) {
  const r = await fetch(DB + '/' + p + '.json');
  if (!r.ok) throw new Error('db ' + r.status);
  return r.json();
}
async function template(origin) {
  const c = [process.env.LAMBDA_TASK_ROOT && path.join(process.env.LAMBDA_TASK_ROOT, 'index.html'),
    path.join(__dirname, 'index.html'), path.join(__dirname, '../../index.html'), path.join(process.cwd(), 'index.html')].filter(Boolean);
  for (const f of c) { try { return fs.readFileSync(f, 'utf8'); } catch (e) { /* try next */ } }
  const r = await fetch(origin + '/index.html'); return r.text();
}
function seoBlock(m, fav) {
  return `<title>${esc(m.title)}</title>
<meta name="description" content="${esc(m.desc)}">
<link rel="canonical" href="${esc(m.url)}">
<meta name="robots" content="${m.robots || 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'}">
<meta property="og:site_name" content="${NAME}">
<meta property="og:type" content="${m.type || 'website'}">
<meta property="og:title" content="${esc(m.title)}">
<meta property="og:description" content="${esc(m.desc)}">
<meta property="og:url" content="${esc(m.url)}">
<meta property="og:image" content="${esc(m.image)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(m.title)}">
<meta name="twitter:description" content="${esc(m.desc)}">
<meta name="twitter:image" content="${esc(m.image)}">
<meta name="theme-color" content="#7ae12b">
${fav}
<script type="application/ld+json" id="ld">${JSON.stringify(m.ld).replace(/</g, '\\u003c')}</script>`;
}
function build(html, m, noscript) {
  const fav = (html.match(/<link rel="(?:icon|apple-touch-icon)"[^>]*>/g) || []).join('\n');
  return html
    .replace(/<!--SEO-->[\s\S]*?<!--\/SEO-->/, () => '<!--SEO-->\n' + seoBlock(m, fav) + '\n<!--/SEO-->')
    .replace('<!--NOSCRIPT-->', () => noscript);
}

async function main(event) {
  const h = event.headers || {};
  const host = h['x-forwarded-host'] || h.host;
  const origin = SITE;
  let pathname = '/';
  try { pathname = new URL(event.rawUrl || ('https://x' + event.path)).pathname; } catch (e) { pathname = event.path || '/'; }
  let html;
  try { html = await template('https://' + host); } catch (e) { return { statusCode: 500, body: 'template missing' }; }
  const headers = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Netlify-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400'
  };
  const defImg = origin + '/og-image.jpg';
  const m = pathname.match(/^\/(blog|project|app)\/([A-Za-z0-9_-]+)/);

  /* ---------- detail page ---------- */
  if (m) {
    const type = m[1], id = m[2];
    let it = null;
    let failed = false;
    try { it = await getJSON(COLL[type] + '/' + id); } catch (e) { failed = true; }
    if (failed) return { statusCode: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }, body: html };
    if (!it || typeof it !== 'object') {
      const meta = { title: 'Not found | ' + NAME, desc: 'This page does not exist.', url: origin + pathname, image: defImg, robots: 'noindex,follow', ld: {} };
      return { statusCode: 404, headers: Object.assign({}, headers, { 'Netlify-CDN-Cache-Control': 'public, s-maxage=60' }), body: build(html, meta, '<h1>Not found</h1>') };
    }
    if (it.locked || it.enc) {
      const lurl = origin + '/' + type + '/' + id + '/' + slug(it.slug || it.title);
      const lm = { title: String(it.title || 'Protected') + ' | ' + NAME, desc: 'This page is password protected.', url: lurl, image: defImg, robots: 'noindex,nofollow', ld: {} };
      return { statusCode: 200, headers: Object.assign({}, headers, { 'Netlify-CDN-Cache-Control': 'public, s-maxage=60' }), body: build(html, lm, '<h1>' + esc(it.title || 'Protected') + '</h1><p>This page is password protected.</p>') };
    }
    const url = origin + '/' + type + '/' + id + '/' + slug(it.slug||it.title);
    const text = plain(it.description);
    const desc = clip(text, 155) || 'Details by ' + NAME;
    const img = httpUrl(it.image) || defImg;
    const au = { '@type': 'Person', name: NAME, url: origin + '/' };
    let ld;
    if (type === 'blog') ld = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: it.title, description: desc, image: [img], datePublished: it.date || undefined, author: au, mainEntityOfPage: url };
    else if (type === 'app') ld = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: it.title, description: desc, image: img, applicationCategory: 'MobileApplication', operatingSystem: 'Android', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, url, downloadUrl: httpUrl(it.link) || undefined, author: au };
    else ld = { '@context': 'https://schema.org', '@type': 'CreativeWork', name: it.title, description: desc, image: img, url, author: au, keywords: Array.isArray(it.tags) ? it.tags.join(', ') : undefined };
    const meta = { title: String(it.title || NAME) + ' | ' + NAME, desc, url, image: img, type: type === 'blog' ? 'article' : 'website', ld };
    const ns = `<article><h1>${esc(it.title)}</h1>${httpUrl(it.image) ? `<img src="${esc(httpUrl(it.image))}" alt="${esc(it.title)}">` : ''}<p>${esc(clip(text, 4000))}</p></article>`;
    return { statusCode: 200, headers, body: build(html, meta, ns) };
  }

  /* ---------- home page ---------- */
  let blog = [], projects = [], apps = [], gallery = [];
  try {
    const r = await Promise.allSettled([getJSON('blog'), getJSON('projects'), getJSON('apps'), getJSON('gallery')]);
    const g = i => (r[i].status === 'fulfilled' ? listOf(r[i].value) : []);
    blog = g(0); projects = g(1); apps = g(2); gallery = g(3);
  } catch (e) { /* keep empty lists */ }
  const link = (t, i) => `<li><a href="/${t}/${i.id}/${slug(i.slug||i.title)}">${esc(i.title)}</a></li>`;
  const ns = '<h2>Nayeem Hossen</h2><p>App developer and content creator from Cumilla, Bangladesh.</p>'
    + (projects.length ? '<h2>Projects</h2><ul>' + projects.map(i => link('project', i)).join('') + '</ul>' : '')
    + (apps.length ? '<h2>Apps</h2><ul>' + apps.map(i => link('app', i)).join('') + '</ul>' : '')
    + (blog.length ? '<h2>Blog</h2><ul>' + blog.map(i => link('blog', i)).join('') + '</ul>' : '');
  const desc = 'Nayeem Hossen is an app developer and content creator from Cumilla, Bangladesh. Explore his Android apps, projects, blog posts and photo gallery.';
  const meta = {
    title: NAME + ' \u2013 App Developer & Content Creator from Cumilla, Bangladesh', desc, url: origin + '/', image: defImg,
    ld: { '@context': 'https://schema.org', '@graph': [
      { '@type': 'Person', name: NAME, url: origin + '/', image: defImg, jobTitle: 'App Developer & Content Creator', address: { '@type': 'PostalAddress', addressLocality: 'Cumilla', addressCountry: 'BD' } },
      { '@type': 'WebSite', name: NAME, url: origin + '/', inLanguage: 'en' }] }
  };
  return { statusCode: 200, headers, body: build(html, meta, ns) };
}

/* If anything goes wrong, still serve the plain page so the site never shows an error. */
exports.handler = async (event) => {
  try {
    return await main(event);
  } catch (e) {
    console.error('page function error:', e && e.message);
    try {
      const host = (event.headers || {})['x-forwarded-host'] || (event.headers || {}).host || '';
      const html = await template('https://' + host);
      return { statusCode: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate' }, body: html };
    } catch (e2) {
      return { statusCode: 500, body: 'Temporary error, please reload.' };
    }
  }
};
