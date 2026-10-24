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
