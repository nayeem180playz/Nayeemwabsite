/* /sitemap.xml and /robots.txt, generated from the Firebase database. */
const SITE = process.env.SITE_URL || 'https://nayeemplayz.netlify.app';
const DB = 'https://nayeem-wabsite-default-rtdb.firebaseio.com';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const slug = t => String(t || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'item';
const httpUrl = u => { const m = String(u || '').trim().split(/\s+/)[0]; return /^https?:\/\//i.test(m) ? m : ''; };
const listOf = v => (v ? Object.keys(v).map(id => Object.assign({ id }, v[id])).reverse().filter(i => !i.locked && !i.enc) : []);
const get = async p => { const r = await fetch(DB + '/' + p + '.json'); if (!r.ok) throw new Error('db'); return r.json(); };
const day = d => { const x = new Date(d); return isNaN(x) ? '' : x.toISOString().slice(0, 10); };

exports.handler = async (event) => {
  const h = event.headers || {};
  const origin = SITE;
  const raw = event.rawUrl || event.path || '';
  if (/robots\.txt/.test(raw)) {
    return { statusCode: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
      body: 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin.html\n\nSitemap: ' + origin + '/sitemap.xml\n' };
  }
  const r = await Promise.allSettled([get('blog'), get('projects'), get('apps'), get('gallery')]);
  const g = i => (r[i].status === 'fulfilled' ? listOf(r[i].value) : []);
  const blog = g(0), projects = g(1), apps = g(2), gallery = g(3);
  const img = u => (httpUrl(u) ? `<image:image><image:loc>${esc(httpUrl(u))}</image:loc></image:image>` : '');
  const url = (loc, extra, last) => `<url><loc>${esc(origin + loc)}</loc>${last ? `<lastmod>${last}</lastmod>` : ''}${extra || ''}</url>`;
  const parts = [url('/', gallery.slice(0, 900).map(i => (httpUrl(i.image) ? `<image:image><image:loc>${esc(httpUrl(i.image))}</image:loc></image:image>` : '')).join(''))];
  blog.forEach(i => parts.push(url('/blog/' + i.id + '/' + slug(i.slug||i.title), img(i.image), day(i.date || i.updatedAt || i.createdAt))));
  projects.forEach(i => parts.push(url('/project/' + i.id + '/' + slug(i.slug||i.title), img(i.image), day(i.updatedAt || i.createdAt))));
  apps.forEach(i => parts.push(url('/app/' + i.id + '/' + slug(i.slug||i.title), img(i.image) + (Array.isArray(i.screenshots) ? i.screenshots.slice(0, 20).map(img).join('') : ''), day(i.updatedAt || i.createdAt))));
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' + parts.join('\n') + '\n</urlset>';
  return { statusCode: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate', 'Netlify-CDN-Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400' }, body: xml };
};
