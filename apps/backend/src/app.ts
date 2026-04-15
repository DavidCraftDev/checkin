import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, type JwtVariables } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import jwtLib from 'jsonwebtoken';
import { PrismaPg } from '@prisma/adapter-pg';
import prismaPkg from '@prisma/client';

const { PrismaClient } = prismaPkg;

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL is required.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});
const app = new Hono<{ Variables: JwtVariables }>();

const jwtSecret = process.env.JWT_SECRET;
const jwtAlgo = 'HS256' as const;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required.');
}

app.use('/api/*', cors());

app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.post('/api/auth/login', async (c) => {
  const body = await c.req
    .json<{ username?: string; password?: string }>()
    .catch(() => ({ username: undefined, password: undefined }));
  const username = body.username?.trim();
  const password = typeof body.password === 'string' ? body.password.trim() : '';

  if (!username || !password) {
    return c.json({ message: 'Username and password are required.' }, 400);
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user?.password) {
    return c.json({ message: 'Invalid credentials.' }, 401);
  }

  const passwordValid = await bcrypt.compare(password, user.password);

  if (!passwordValid) {
    return c.json({ message: 'Invalid credentials.' }, 401);
  }

  const token = jwtLib.sign(
    {
      sub: user.id,
      username: user.username,
      displayname: user.displayname,
      permission: user.permission
    },
    jwtSecret,
    {
      algorithm: jwtAlgo,
      expiresIn: '8h'
    }
  );

  return c.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      displayname: user.displayname,
      permission: user.permission,
      group: user.group
    }
  });
});

app.use('/api/auth/me', jwt({ secret: jwtSecret, alg: jwtAlgo }));
app.get('/api/auth/me', async (c) => {
  const payload = c.get('jwtPayload');
  const userId = payload.sub;

  if (typeof userId !== 'string' || !userId) {
    return c.json({ message: 'Unauthorized.' }, 401);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return c.json({ message: 'Unauthorized.' }, 401);
  }

  return c.json({
    id: user.id,
    username: user.username,
    displayname: user.displayname,
    permission: user.permission,
    group: user.group
  });
});

export type AppType = typeof app;
export { app };
