# Nayeem Hossen – portfolio  (https://nayeemplayz.netlify.app)

Deploy: push this whole folder to the GitHub repo connected to Netlify (publish directory = repo root).
The `netlify/functions` folder MUST be included – it creates the SEO tags, /sitemap.xml and /robots.txt.

| File | Purpose |
|---|---|
| index.html | The website (home, projects, apps, blog, about, gallery, contact, detail pages) |
| admin.html | Admin panel at /admin (Firebase email/password login, imgbb uploads, editors) |
| netlify.toml | Netlify settings: functions + URL rewrites |
| _headers | Security headers + keeps /admin out of Google |
| netlify/functions/page.js | Fills title, description, share image and structured data for every page |
| netlify/functions/sitemap.js | Builds /sitemap.xml and /robots.txt from the database automatically |
| google7bf9a8d199ecbad8.html | Google Search Console ownership proof – keep it |
| <indexnow key>.txt | IndexNow key file: lets the admin panel notify Bing/Yandex about new posts |
| og-image.jpg, favicon.png | Share preview image and site icon |
| database.rules.json | Firebase Realtime Database rules (replace YOUR_ADMIN_EMAIL) |

After deploying: Search Console -> Sitemaps -> submit `sitemap.xml` once. New posts are added automatically.
