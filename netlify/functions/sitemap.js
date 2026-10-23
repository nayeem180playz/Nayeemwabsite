
/* /sitemap.xml and /robots.txt, generated from Firebase database. */

const SITE = (
  process.env.SITE_URL || 'https://nayeemplayz.netlify.app'
).replace(/\/+$/, '');

const DB = 'https://nayeem-wabsite-default-rtdb.firebaseio.com';

const esc = (value) =>
  String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;'
  }[char]));

const slug = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';

const httpUrl = (value) => {
  const url = String(value || '').trim();

  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol)
      ? parsed.href
      : '';
  } catch {
    return '';
  }
};

const listOf = (value) =>
  value && typeof value === 'object'
    ? Object.keys(value)
        .map((id) => Object.assign({ id }, value[id]))
        .reverse()
    : [];

const get = async (path) => {
  const response = await fetch(`${DB}/${path}.json`);

  if (!response.ok) {
    throw new Error(`Firebase request failed: ${path}`);
  }

  return response.json();
};

const day = (value) => {
  if (!value) return '';

  const date = new Date(value);

  return isNaN(date.getTime())
    ? ''
    : date.toISOString().slice(0, 10);
};

// FIX: Both image:loc and image:image tags are properly closed.
const imageTag = (value) => {
  const imageUrl = httpUrl(value);

  if (!imageUrl) return '';

  return (
    `<image:image>` +
    `<image:loc>${esc(imageUrl)}</image:loc>` +
    `</image:image>`
  );
};

const urlEntry = (path, images = '', lastmod = '') => {
  const lastmodTag = lastmod
    ? `<lastmod>${esc(lastmod)}</lastmod>`
    : '';

  return (
    `<url>` +
    `<loc>${esc(SITE + path)}</loc>` +
    lastmodTag +
    images +
    `</url>`
  );
};

const headers = {
  'Cache-Control': 'public, max-age=0, must-revalidate'
};

exports.handler = async (event) => {
  const rawUrl = event.rawUrl || event.path || '';

  // robots.txt
  if (/\/robots\.txt(?:\?|$)/i.test(rawUrl)) {
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/plain; charset=utf-8'
      },
      body:
        'User-agent: *\n' +
        'Allow: /\n' +
        'Disallow: /admin\n' +
        'Disallow: /admin.html\n\n' +
        `Sitemap: ${SITE}/sitemap.xml\n`
    };
  }

  try {
    const results = await Promise.allSettled([
      get('blog'),
      get('projects'),
      get('apps'),
      get('gallery')
    ]);

    const getList = (index) =>
      results[index].status === 'fulfilled'
        ? listOf(results[index].value)
        : [];

    const blog = getList(0);
    const projects = getList(1);
    const apps = getList(2);
    const gallery = getList(3);

    const entries = [];

    // Homepage with gallery images
    const galleryImages = gallery
      .slice(0, 900)
      .map((item) => imageTag(item.image))
      .join('');

    entries.push(urlEntry('/', galleryImages));

    // Blog posts
    blog.forEach((item) => {
      const id = encodeURIComponent(item.id);
      const path =
        `/blog/${id}/${slug(item.slug || item.title)}`;

      entries.push(
        urlEntry(
          path,
          imageTag(item.image),
          day(item.date || item.updatedAt || item.createdAt)
        )
      );
    });

    // Projects
    projects.forEach((item) => {
      const id = encodeURIComponent(item.id);
      const path =
        `/project/${id}/${slug(item.slug || item.title)}`;

      entries.push(
        urlEntry(
          path,
          imageTag(item.image),
          day(item.updatedAt || item.createdAt)
        )
      );
    });

    // Apps and screenshots
    apps.forEach((item) => {
      const id = encodeURIComponent(item.id);
      const path =
        `/app/${id}/${slug(item.slug || item.title)}`;

      const screenshots = Array.isArray(item.screenshots)
        ? item.screenshots.slice(0, 20).map(imageTag).join('')
        : '';

      entries.push(
        urlEntry(
          path,
          imageTag(item.image) + screenshots,
          day(item.updatedAt || item.createdAt)
        )
      );
    });

    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset ' +
      'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
      'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
      entries.join('\n') +
      '\n</urlset>';

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/xml; charset=utf-8',
        'Netlify-CDN-Cache-Control':
          'public, s-maxage=600, stale-while-revalidate=86400'
      },
      body: xml
    };
  } catch (error) {
    console.error('Sitemap generation failed:', error);

    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'text/plain; charset=utf-8'
      },
      body: 'Sitemap generation failed.'
    };
  }
};
