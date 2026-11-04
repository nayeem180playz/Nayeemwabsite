/* /rss.xml : RSS feed of the blog posts. */
const SITE = process.env.SITE_URL || 'https://nayeemplayz.netlify.app';
const DB = 'https://nayeem-wabsite-default-rtdb.firebaseio.com';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const slug = t => String(t || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'item';
const plain = h => String(h || '').replace(/<\/(p|div|h[1-6]|li|blockquote|pre)>/gi, ' ').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const clip = (t, n) => (t.length > n ? t.slice(0, n - 1).trim() + '\u2026' : t);
const httpUrl = u => { const m = String(u || '').trim().split(/\s+/)[0]; return /^https?:\/\//i.test(m) ? m : ''; };

exports.handler = async () => {
  try {
    const r = await fetch(DB + '/blog.json');
    if (!r.ok) throw new Error('db');
    const v = (await r.json()) || {};
    const items = Object.keys(v).map(id => Object.assign({ id }, v[id])).filter(i => !i.locked && !i.enc)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 30);
    const last = items[0] && !isNaN(new Date(items[0].date)) ? new Date(items[0].date).toUTCString() : new Date().toUTCString();
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n'
      + '<title>Nayeem Hossen \u2013 Blog</title>\n<link>' + SITE + '/</link>\n<description>Blog posts by Nayeem Hossen: apps, development and content creation.</description>\n<language>en</language>\n'
      + '<lastBuildDate>' + last + '</lastBuildDate>\n<atom:link href="' + SITE + '/rss.xml" rel="self" type="application/rss+xml"/>\n'
      + items.map(i => {
        const url = SITE + '/blog/' + i.id + '/' + slug(i.slug || i.title);
        const d = !isNaN(new Date(i.date)) ? new Date(i.date).toUTCString() : '';
        const img = httpUrl(i.image);
        return '<item>\n<title>' + esc(i.title) + '</title>\n<link>' + esc(url) + '</link>\n<guid isPermaLink="true">' + esc(url) + '</guid>\n'
          + (d ? '<pubDate>' + d + '</pubDate>\n' : '')
          + '<description>' + esc((img ? '<p><img src="' + img + '" alt=""/></p>' : '') + '<p>' + esc(clip(plain(i.description), 400)) + '</p>') + '</description>\n</item>';
      }).join('\n') + '\n</channel>\n</rss>';
    return { statusCode: 200, headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate', 'Netlify-CDN-Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400' }, body: xml };
  } catch (e) {
    return { statusCode: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '300' }, body: 'Feed temporarily unavailable.' };
  }
};
