import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app } from './app.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(currentDir, '../../frontend/dist');
const port = Number(process.env.PORT || 3000);

app.use('/*', async (c, next) => {
  if (c.req.path.startsWith('/api/')) {
    return next();
  }

  return serveStatic({ root: frontendDist })(c, next);
});

app.get('*', async (c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.notFound();
  }

  try {
    const html = await readFile(path.join(frontendDist, 'index.html'), 'utf-8');
    return c.html(html);
  } catch {
    return c.text('Frontend build missing. Run `npm run build` first.', 503);
  }
});

serve({ fetch: app.fetch, port });
console.log(`CheckIN server running on http://localhost:${port}`);
