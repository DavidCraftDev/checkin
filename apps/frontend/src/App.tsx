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
    <main class="flex h-screen items-center justify-center bg-gray-200">
      <div class="w-full max-w-md rounded-lg bg-white p-4 shadow-md">
        <div class="mb-2 flex h-20 items-end justify-start rounded-md bg-green-600 p-4 md:h-40">
          <span class="text-xl font-semibold text-white md:text-2xl">CheckIN</span>
        </div>

        <Show
          when={user()}
          fallback={
            <section class="flex flex-col gap-4 p-2">
              <h2 class="text-2xl font-bold">Anmelden</h2>
              <form class="flex flex-col gap-4" onSubmit={onLogin}>
                <label class="flex flex-col gap-2">
                  <span class="text-sm font-medium text-gray-700">Benutzername</span>
                  <input
                    class="w-full rounded-lg border-2 border-gray-200 px-4 py-2 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    value={username()}
                    onInput={(e) => setUsername(e.currentTarget.value)}
                    placeholder="Benutzername"
                    autocomplete="username"
                    required
                  />
                </label>
                <label class="flex flex-col gap-2">
                  <span class="text-sm font-medium text-gray-700">Passwort</span>
                  <input
                    type="password"
                    class="w-full rounded-lg border-2 border-gray-200 px-4 py-2 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    value={password()}
                    onInput={(e) => setPassword(e.currentTarget.value)}
                    placeholder="Passwort"
                    autocomplete="current-password"
                    required
                  />
                </label>
                <Show when={error()}>
                  <p class="text-sm text-red-600">{error()}</p>
                </Show>
                <button
                  class="rounded-full bg-green-600 p-2 font-semibold text-white shadow-md transition-transform active:scale-95 hover:bg-green-700"
                  type="submit"
                >
                  Anmelden
                </button>
              </form>
            </section>
          }
        >
          <section class="flex flex-col gap-3 p-2">
            <h2 class="text-2xl font-bold">Dashboard</h2>
            <p class="text-gray-700">
              Willkommen, <span class="font-semibold">{user()?.displayname}</span>
            </p>
            <p class="text-sm text-gray-600">Benutzername: {user()?.username}</p>
            <p class="text-sm text-gray-600">Rechtelevel: {user()?.permission}</p>
            <button
              class="mt-2 rounded-full bg-green-600 p-2 font-semibold text-white shadow-md transition-transform active:scale-95 hover:bg-green-700"
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
