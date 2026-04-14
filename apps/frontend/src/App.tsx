import { createEffect, createSignal, Show } from 'solid-js';
import { client } from './api';

type LoginUser = {
  id: string;
  username: string;
  displayname: string;
  permission: number;
  group: string[];
};

const isLoginUser = (value: unknown): value is LoginUser => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.username === 'string' &&
    typeof v.displayname === 'string' &&
    typeof v.permission === 'number' &&
    Array.isArray(v.group) &&
    v.group.every((item) => typeof item === 'string')
  );
};

export function App() {
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [token, setToken] = createSignal(localStorage.getItem('checkin_jwt') || '');
  const [user, setUser] = createSignal<LoginUser | null>(null);
  const [error, setError] = createSignal('');

  const loadMe = async (jwt: string) => {
    const res = await client.api.auth.me.$get({}, { headers: { Authorization: `Bearer ${jwt}` } });
    if (!res.ok) {
      setToken('');
      localStorage.removeItem('checkin_jwt');
      return;
    }

    const data = await res.json();
    if (!isLoginUser(data)) {
      setToken('');
      setUser(null);
      localStorage.removeItem('checkin_jwt');
      return;
    }
    setUser(data);
  };

  createEffect(() => {
    const jwt = token();
    if (!jwt) {
      setUser(null);
      return;
    }

    void loadMe(jwt);
  });

  const onLogin = async (event: SubmitEvent) => {
    event.preventDefault();
    setError('');

    const res = await client.api.auth.login.$post({
      json: {
        username: username(),
        password: password()
      }
    });

    if (!res.ok) {
      setError('Anmeldung fehlgeschlagen. Bitte Zugangsdaten prüfen.');
      return;
    }

    const data = await res.json();
    if (
      !data ||
      typeof data !== 'object' ||
      typeof (data as Record<string, unknown>).token !== 'string' ||
      !isLoginUser((data as Record<string, unknown>).user)
    ) {
      setError('Unerwartete Serverantwort.');
      return;
    }

    const tokenData = (data as { token: string; user: LoginUser }).token;
    const userData = (data as { token: string; user: LoginUser }).user;
    localStorage.setItem('checkin_jwt', tokenData);
    setToken(tokenData);
    setUser(userData);
  };

  const onLogout = () => {
    localStorage.removeItem('checkin_jwt');
    setToken('');
    setUser(null);
    setPassword('');
  };

  return (
    <main class="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div class="mx-auto max-w-4xl">
        <header class="mb-8 rounded-xl bg-slate-900 p-6 text-white shadow">
          <h1 class="text-2xl font-bold">CheckIN</h1>
          <p class="text-sm text-slate-300">Anwesenheitsverwaltung mit Hono + Prisma + Solid</p>
        </header>

        <Show
          when={user()}
          fallback={
            <section class="rounded-xl bg-white p-6 shadow">
              <h2 class="mb-4 text-xl font-semibold text-slate-800">Login</h2>
              <form class="space-y-4" onSubmit={onLogin}>
                <label class="block">
                  <span class="mb-1 block text-sm font-medium text-slate-700">Benutzername</span>
                  <input
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-cyan-500 focus:ring"
                    value={username()}
                    onInput={(e) => setUsername(e.currentTarget.value)}
                    required
                  />
                </label>
                <label class="block">
                  <span class="mb-1 block text-sm font-medium text-slate-700">Passwort</span>
                  <input
                    type="password"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-cyan-500 focus:ring"
                    value={password()}
                    onInput={(e) => setPassword(e.currentTarget.value)}
                    required
                  />
                </label>
                <Show when={error()}>
                  <p class="text-sm text-red-600">{error()}</p>
                </Show>
                <button
                  class="rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white transition hover:bg-cyan-700"
                  type="submit"
                >
                  Anmelden
                </button>
              </form>
            </section>
          }
        >
          <section class="rounded-xl bg-white p-6 shadow">
            <h2 class="mb-4 text-xl font-semibold text-slate-800">Dashboard</h2>
            <p class="text-slate-700">
              Willkommen, <span class="font-semibold">{user()?.displayname}</span>!
            </p>
            <p class="mt-2 text-sm text-slate-600">Benutzer: {user()?.username}</p>
            <p class="text-sm text-slate-600">Rechtelevel: {user()?.permission}</p>
            <button
              class="mt-6 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-800"
              onClick={onLogout}
            >
              Abmelden
            </button>
          </section>
        </Show>
      </div>
    </main>
  );
}
