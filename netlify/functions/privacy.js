/* /privacy  (website policy)  and  /privacy/<appId>/<slug>  (policy for one app, built from the app's settings). */
const SITE = process.env.SITE_URL || 'https://nayeemplayz.netlify.app';
const DB = 'https://nayeem-wabsite-default-rtdb.firebaseio.com';
const NAME = 'Nayeem Hossen';
const EMAIL = 'nayeemhossen816@gmail.com';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = t => String(t || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'item';
const fmt = d => { const x = new Date(d); return isNaN(x) ? '' : x.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }); };
const para = t => String(t || '').split(/\n+/).map(s => s.trim()).filter(Boolean).map(s => '<p>' + esc(s) + '</p>').join('');
const G = 'https://policies.google.com/privacy';

function sec(h, body) { return '<h2>' + h + '</h2>' + body; }
const ul = a => '<ul>' + a.map(x => '<li>' + x + '</li>').join('') + '</ul>';

function appPolicy(app, o) {
  const n = esc(app);
  const collect = [];
  collect.push(o.acc
    ? '<p>If you sign in, the app receives your email address and basic profile information (such as your name and profile picture) from your sign-in provider, for example Google. We use it only to sign you in and to provide the features of the app.</p>'
    : '<p>' + n + ' does not require an account and we do not knowingly collect personal information such as your name, phone number or precise location.</p>');
  if (o.an) collect.push('<p>The app may collect anonymous usage and diagnostic information (for example app version, device model, crashes and how features are used) through Google Analytics for Firebase or Firebase Crashlytics, to fix problems and improve the app. This information does not identify you personally.</p>');
  if (o.ads) collect.push('<p>The app shows ads provided by Google AdMob. AdMob may collect and use your device advertising ID, IP address and device information to show and measure ads, including personalised ads where the law allows. You can reset your advertising ID or opt out of personalised ads in your device settings. See <a href="' + G + '" rel="noopener">Google\u2019s Privacy Policy</a>.</p>');
  if (o.pur) collect.push('<p>In-app purchases are processed by Google Play. We do not receive or store your payment card details.</p>');
  const svc = ['Google Play Services'];
  if (o.an || o.acc) svc.push('Firebase / Google Analytics for Firebase');
  if (o.ads) svc.push('Google AdMob');
  return sec('Information we collect', collect.join(''))
    + sec('Device permissions', '<p>The app may ask for device permissions (for example internet access) only to provide its features. Permission data is not sold or shared for advertising.</p>')
    + sec('Third-party services', '<p>The app uses the following third-party services, which have their own privacy policies:</p>' + ul(svc) + '<p>See <a href="' + G + '" rel="noopener">Google\u2019s Privacy Policy</a>.</p>')
    + sec('Sharing of information', '<p>We do not sell your personal information. We share information only with the services listed above, to operate the app, or when required by law.</p>')
    + sec('Data retention and deletion', '<p>Information is kept only as long as needed for the purposes above. To ask for any data connected to you to be deleted, email <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> and we will respond within a reasonable time.</p>')
    + sec('Children\u2019s privacy', '<p>The app is not directed to children under 13 and we do not knowingly collect personal information from children. If you believe a child has given us information, contact us and we will delete it.</p>')
    + sec('Security', '<p>We use reasonable measures to protect information, but no method of storage or transmission is completely secure.</p>');
}
function sitePolicy() {
  return sec('Information we collect', ul([
      '<b>Contact form:</b> if you send a message we store your name, email address and message so that we can reply.',
      '<b>Usage statistics:</b> we count visits and page views and use Google Analytics to understand how the website is used (pages visited, device and approximate location). This data is aggregated.',
      '<b>Browser storage:</b> your browser may store small items such as the light/dark theme, a session marker so a visit is counted once, and unlocked content for password-protected pages during your session.'
    ]))
    + sec('Third-party services', '<p>This website uses Google Firebase (database), Google Analytics, YouTube (embedded videos) and Netlify (hosting). They may process technical data such as your IP address under their own privacy policies. See <a href="' + G + '" rel="noopener">Google\u2019s Privacy Policy</a>.</p>')
    + sec('Our apps', '<p>Each app has its own privacy policy, linked from its page on this website.</p>')
    + sec('Sharing of information', '<p>We do not sell your personal information. We share information only with the services above or when required by law.</p>')
    + sec('Your choices', '<p>You can block cookies and storage in your browser settings. To ask us to delete a message you sent, email <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.</p>')
    + sec('Children\u2019s privacy', '<p>This website is not directed to children under 13 and we do not knowingly collect their personal information.</p>');
}
function html(title, desc, url, updated, body, status) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(url)}">
<meta name="robots" content="${status === 200 ? 'index,follow' : 'noindex,follow'}"><link rel="icon" href="/favicon.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>:root{--bg:#f8f7ef;--ink:#111;--mute:#666;--lime:#7ae12b;--line:#ecebe0}@media(prefers-color-scheme:dark){:root{--bg:#0e1118;--ink:#f2f2ec;--mute:#9aa2b1;--line:#232a38}}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:Poppins,system-ui,sans-serif;background:var(--bg);color:var(--ink);line-height:1.75}
.w{max-width:760px;margin:0 auto;padding:22px 22px 70px}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:34px}
.logo{display:inline-flex;align-items:center;gap:10px;font-weight:600;font-size:14px;color:inherit;text-decoration:none}.logo b{background:var(--lime);color:#111;border-radius:8px;padding:2px 9px;font-weight:800}
h1{font-size:clamp(28px,6vw,40px);line-height:1.2;margin-bottom:6px}h2{font-size:19px;margin:28px 0 8px}p,li{font-size:15px;color:var(--mute);margin-bottom:10px}ul{padding-left:22px}li b{color:var(--ink)}
a{color:#3a8a00}.up{font-size:13px;color:var(--mute);margin-bottom:22px}.back{font-size:14px;font-weight:600;color:var(--ink);text-decoration:none}footer{margin-top:40px;padding-top:18px;border-top:1px solid var(--line);font-size:13px;color:var(--mute)}</style></head>
<body><div class="w"><header><a class="logo" href="/"><b>N</b>${NAME}</a><a class="back" href="/">\u2190 Back to website</a></header>
<main><h1>${esc(title.split(' | ')[0])}</h1><div class="up">${updated ? 'Last updated: ' + esc(updated) : ''}</div>${body}</main>
<footer>\u00a9 ${new Date().getUTCFullYear()} ${NAME}. Contact: <a href="mailto:${EMAIL}">${EMAIL}</a></footer></div></body></html>`;
}
const H = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate', 'Netlify-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' };

async function main(event) {
  let p = '/privacy';
  try { p = new URL(event.rawUrl || ('https://x' + event.path)).pathname; } catch (e) { p = event.path || '/privacy'; }
  const m = p.match(/^\/privacy\/([A-Za-z0-9_-]+)/);
  if (!m) {
    const intro = '<p>This policy explains how ' + NAME + '\u2019s website at ' + esc(SITE.replace(/^https?:\/\//, '')) + ' handles information.</p>';
    return { statusCode: 200, headers: H, body: html('Privacy Policy | ' + NAME, 'How this website collects and uses information.', SITE + '/privacy', '3 November 2026', intro + sitePolicy(), 200) };
  }
  let app = null, failed = false;
  try { const r = await fetch(DB + '/apps/' + m[1] + '.json'); if (!r.ok) throw new Error('db'); app = await r.json(); } catch (e) { failed = true; }
  if (failed) return { statusCode: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '120' }, body: 'Temporarily unavailable. Please try again.' };
  if (!app || typeof app !== 'object') return { statusCode: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: html('Not found | ' + NAME, 'Page not found', SITE + p, '', '<p>This privacy policy does not exist.</p>', 404) };
  const name = app.title || 'App';
  const url = SITE + '/privacy/' + m[1] + '/' + slug(app.slug || app.title);
  const o = (!app.enc && app.priv && typeof app.priv === 'object') ? app.priv : {};
  const custom = !app.enc && app.privText ? String(app.privText).trim() : '';
  const intro = '<p>This Privacy Policy explains how <b>' + esc(name) + '</b> (\u201cthe app\u201d), developed by ' + NAME + ', handles information. By using the app you agree to this policy.</p>';
  const body = intro + (custom ? sec('Privacy policy', para(custom)) + sec('Contact', '<p>Questions? Email <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.</p>') : appPolicy(name, o) + sec('Changes to this policy', '<p>We may update this policy from time to time. The date at the top shows when it was last changed.</p>') + sec('Contact', '<p>Questions about this policy? Email <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.</p>'));
  return { statusCode: 200, headers: H, body: html('Privacy Policy \u2013 ' + name + ' | ' + NAME, 'Privacy policy of the ' + name + ' app by ' + NAME + '.', url, fmt(app.updatedAt || app.createdAt) || '3 November 2026', body, 200) };
}
exports.handler = async (event) => {
  try { return await main(event); } catch (e) { console.error('privacy error', e && e.message); return { statusCode: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: 'Temporary error, please reload.' }; }
};
