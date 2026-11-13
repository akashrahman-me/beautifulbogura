/**
 * In-browser fake of the Express API, used only when NEXT_PUBLIC_DATA_MODE=demo.
 * It speaks the same contract (envelope, pagination, error codes) so switching to the
 * real backend needs no component changes. State lives in memory for the tab's lifetime.
 */
import * as db from './data';

type Json = Record<string, unknown>;
/** `userId` is the signed-in caller, read from the `Authorization: Bearer demo.<id>` header. */
type Req = { method: string; params: Record<string, string>; query: URLSearchParams; body: Json; userId: string | null };
type Handler = (req: Req) => Response | Promise<Response>;

const LATENCY = 350;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
const ok = (data: unknown, message = 'OK') => json(200, { success: true, message, data });
const created = (data: unknown, message = 'Created') => json(201, { success: true, message, data });
const fail = (status: number, code: string, message: string, errors?: { path: string; message: string }[]) =>
  json(status, { success: false, code, message, errors });

function paginate<T>(rows: T[], q: URLSearchParams) {
  const page = Math.max(1, Number(q.get('page') ?? 1));
  const limit = Math.min(50, Math.max(1, Number(q.get('limit') ?? 12)));
  const total = rows.length;
  return json(200, {
    success: true,
    message: 'OK',
    data: rows.slice((page - 1) * limit, page * limit),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
}

const norm = (s: unknown) => String(s ?? '').toLowerCase();
const matches = (q: string | null, ...fields: unknown[]) => !q || fields.some((f) => norm(f).includes(norm(q)));
const byNewest = (a: { createdAt: string }, b: { createdAt: string }) => b.createdAt.localeCompare(a.createdAt);

const DAY = 864e5;
const today = () => new Date().getDay();
const donorStatus = (last: string | null) =>
  last == null ? 'unknown' : (Date.now() - new Date(last).getTime()) / DAY >= 120 ? 'ready' : 'not-yet';

/* ---- demo sign-in ----
 * Social sign-in is a provider redirect in real life; here any provider signs you in at once as one
 * demo user. The session is kept in localStorage so a reload stays signed in (the real API uses an
 * httpOnly refresh cookie). The first seeded post of every kind belongs to this user.
 */
const DEMO_USER_ID = 'usr_demo';
const SESSION_KEY = 'bb-demo-session';
const PROVIDER_NAMES: Record<string, string> = { google: 'Google', facebook: 'Facebook', apple: 'Apple' };
type DemoUser = { id: string; name: string; email: string | null; avatar: string | null; provider: string };

const store = () => (typeof localStorage === 'undefined' ? null : localStorage);
const readSession = (): DemoUser | null => {
  try {
    return JSON.parse(store()?.getItem(SESSION_KEY) ?? 'null') as DemoUser | null;
  } catch {
    return null;
  }
};
const session = (user: DemoUser) => ({ accessToken: `demo.${user.id}`, user });

const UNAUTHENTICATED = () => fail(401, 'UNAUTHENTICATED', 'পোস্ট করতে আগে সাইন ইন করুন');
const NOT_OWNER = () => fail(403, 'NOT_OWNER', 'শুধু পোস্টদাতা নিজে এই পোস্ট পরিবর্তন করতে পারেন');

type Owned = { id: string; createdAt: string; status: string; ownerId?: string };
/** Every community collection, so `/me/posts` can gather a user's posts across all of them. */
const collections: { kind: string; rows: Owned[]; title: (r: Owned) => string; href: (r: Owned) => string }[] = [];

/** CRUD + ownership + report handlers for one community collection. */
function community<T extends Owned>(opts: {
  base: string;
  rows: T[];
  prefix: string;
  /** `kind` as the client names it in `/me/posts`. */
  kind: string;
  title: (row: T) => string;
  href: (row: T) => string;
  filter: (row: T, q: URLSearchParams) => boolean;
  build: (body: Json) => Omit<T, 'id' | 'createdAt' | 'status' | 'ownerId'>;
  doneStatus?: string;
  /** Sold / rented posts stay listed (dimmed); filled jobs and found tutors drop off. */
  keepDone?: boolean;
}): [string, string, Handler][] {
  const { base, rows, prefix, filter, build, doneStatus = 'done', keepDone = false } = opts;
  // Seeded posts: the first belongs to the demo user so the owner controls can be tried.
  rows.forEach((r, i) => (r.ownerId ??= i === 0 ? DEMO_USER_ID : `usr_seed_${i}`));
  collections.push({ kind: opts.kind, rows, title: opts.title as (r: Owned) => string, href: opts.href as (r: Owned) => string });

  const visible = (r: T) => r.status === 'active' || (keepDone && r.status === doneStatus);
  const owned = (id: string, userId: string | null) => {
    const row = rows.find((r) => r.id === id && r.status !== 'deleted');
    if (!row) return fail(404, 'NOT_FOUND', 'পোস্টটি পাওয়া যায়নি');
    if (!userId) return UNAUTHENTICATED();
    if (row.ownerId !== userId) return NOT_OWNER();
    return row;
  };
  return [
    ['GET', base, ({ query }) => paginate(rows.filter((r) => visible(r) && filter(r, query)).sort(byNewest), query)],
    ['GET', `${base}/:id`, ({ params }) => {
      const row = rows.find((r) => r.id === params.id && visible(r));
      return row ? ok(row) : fail(404, 'NOT_FOUND', 'পোস্টটি পাওয়া যায়নি');
    }],
    ['POST', base, ({ body, userId }) => {
      if (!userId) return UNAUTHENTICATED();
      const row = { ...build(body), id: db.nextId(prefix), createdAt: new Date().toISOString(), status: 'active', ownerId: userId } as T;
      rows.unshift(row);
      return created({ id: row.id, status: 'published' }, 'পোস্ট প্রকাশিত হয়েছে');
    }],
    ['PATCH', `${base}/:id`, ({ params, body, userId }) => {
      const row = owned(params.id, userId);
      if (row instanceof Response) return row;
      const { ownerId: _o, id: _i, status: _s, ...rest } = body;
      Object.assign(row, rest);
      return ok(row, 'হালনাগাদ হয়েছে');
    }],
    ['POST', `${base}/:id/manage`, ({ params, body, userId }) => {
      const row = owned(params.id, userId);
      if (row instanceof Response) return row;
      row.status = body.action === 'delete' ? 'deleted' : doneStatus;
      return ok({ ok: true });
    }],
    ['POST', `${base}/:id/report`, () => ok({ ok: true }, 'রিপোর্ট গ্রহণ করা হয়েছে')],
  ];
}

const routes: [string, string, Handler][] = [
  ['GET', '/weather', () => ok(db.weather)],
  ['GET', '/services/popular', () => ok(db.popular)],

  /* ---- doctors ---- */
  ['GET', '/doctors/stats', () => {
    const counts = new Map<string, number>();
    db.doctors.forEach((d) => counts.set(d.specialty, (counts.get(d.specialty) ?? 0) + 1));
    return ok({
      total: db.doctors.length,
      sittingToday: db.doctors.filter((d) => d.chambers.some((c) => c.days.includes(today()))).length,
      specialties: [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    });
  }],
  ['GET', '/doctors', ({ query }) => {
    const sp = query.get('specialty');
    const todayOnly = query.get('today') === 'true';
    const rows = db.doctors
      .map((d) => ({ ...d, sittingToday: d.chambers.some((c) => c.days.includes(today())) }))
      .filter((d) => (!sp || d.specialty === sp) && (!todayOnly || d.sittingToday))
      .filter((d) => matches(query.get('search'), d.name, d.specialty, d.phone, ...d.chambers.map((c) => c.hospital)));
    return paginate(rows, query);
  }],
  ['GET', '/doctors/:id', ({ params }) => {
    const d = db.doctors.find((x) => x.id === params.id);
    return d ? ok({ ...d, sittingToday: d.chambers.some((c) => c.days.includes(today())) }) : fail(404, 'NOT_FOUND', 'ডাক্তারের তথ্য পাওয়া যায়নি');
  }],
  ['POST', '/doctors', () => created({ id: db.nextId('doc'), status: 'pending' }, 'অ্যাডমিন যাচাইয়ের পর প্রকাশিত হবে')],

  /* ---- blood bank ---- */
  ['GET', '/donors/stats', () => {
    const byGroup: Record<string, number> = {};
    const status = { ready: 0, notYet: 0, unknown: 0 };
    db.donors.forEach((d) => {
      byGroup[d.group] = (byGroup[d.group] ?? 0) + 1;
      const s = donorStatus(d.lastDonation);
      if (s === 'ready') status.ready++;
      else if (s === 'not-yet') status.notYet++;
      else status.unknown++;
    });
    return ok({ total: db.donors.length, byGroup, ...status });
  }],
  ['GET', '/donors', ({ query }) => {
    const g = query.get('group');
    const st = query.get('status');
    const rows = db.donors
      .filter((d) => (!g || d.group === g) && (!st || donorStatus(d.lastDonation) === st))
      .filter((d) => matches(query.get('search'), d.name, d.phone, d.address))
      .sort((a, b) => Number(donorStatus(b.lastDonation) === 'ready') - Number(donorStatus(a.lastDonation) === 'ready'));
    return paginate(rows, query);
  }],
  ['POST', '/donors', ({ body }) => {
    if (db.donors.some((d) => d.phone === body.phone)) return fail(409, 'DONOR_EXISTS', 'এই নম্বরে আগে নিবন্ধন করা হয়েছে', [{ path: 'phone', message: 'এই নম্বরে আগে নিবন্ধন করা হয়েছে' }]);
    const donor = { id: db.nextId('don'), name: String(body.name), group: String(body.group), phone: String(body.phone), address: String(body.address ?? ''), lastDonation: (body.lastDonation as string) || null };
    db.donors.unshift(donor);
    return created(donor, 'নিবন্ধন সম্পন্ন হয়েছে');
  }],
  ['PATCH', '/donors/:id/last-donation', ({ params, body }) => {
    const d = db.donors.find((x) => x.id === params.id);
    if (!d) return fail(404, 'NOT_FOUND', 'দাতার তথ্য পাওয়া যায়নি');
    if (String(body.phone) !== d.phone) return fail(403, 'PHONE_MISMATCH', 'মোবাইল নম্বর মেলেনি', [{ path: 'phone', message: 'নিবন্ধিত মোবাইল নম্বর লিখুন' }]);
    d.lastDonation = String(body.lastDonation);
    return ok(d, 'তারিখ হালনাগাদ হয়েছে');
  }],

  /* ---- directories ---- */
  ['GET', '/directory/:type', ({ params, query }) =>
    paginate(db.directory.filter((e) => e.type === params.type && matches(query.get('search'), e.name, e.role, e.address, e.phone)), query)],
  ['POST', '/directory/:type', () => created({ id: db.nextId('dir'), status: 'pending' }, 'অ্যাডমিন যাচাইয়ের পর প্রকাশিত হবে')],
  ['POST', '/directory/:type/:id/rate', ({ params, body }) => {
    const e = db.directory.find((x) => x.id === params.id);
    if (!e) return fail(404, 'NOT_FOUND', 'তথ্য পাওয়া যায়নি');
    const n = (e.ratingCount ?? 0) + 1;
    e.rating = ((e.rating ?? 0) * (n - 1) + Number(body.stars)) / n;
    e.ratingCount = n;
    return ok(e, 'রেটিং দেওয়ার জন্য ধন্যবাদ');
  }],

  /* ---- community posts ---- */
  ...community({ base: '/jobs', rows: db.jobs, prefix: 'job', kind: 'job', title: (r) => r.title, href: (r) => `/jobs/${r.id}`,
    filter: (r, q) => matches(q.get('search'), r.company, r.title, r.address),
    build: (b) => ({ company: String(b.company), title: String(b.title), vacancies: Number(b.vacancies), salary: String(b.salary ?? ''), education: String(b.education ?? ''), details: String(b.details ?? ''), phone: String(b.phone), whatsapp: Boolean(b.whatsapp), address: String(b.address ?? ''), image: ((b.images as string[]) ?? [])[0] ?? null, deadline: String(b.deadline) }) }),
  ...community({ base: '/listings', rows: db.listings, prefix: 'lst', kind: 'listing', title: (r) => r.title, href: () => '/buy-sell',
    filter: (r, q) => (!q.get('category') || r.category === q.get('category')) && matches(q.get('search'), r.title, r.address, r.description),
    build: (b) => ({ category: String(b.category), title: String(b.title), condition: String(b.condition), price: Number(b.price), description: String(b.description ?? ''), images: (b.images as string[]) ?? [], sellerName: String(b.sellerName), phone: String(b.phone), whatsapp: Boolean(b.whatsapp), address: String(b.address ?? '') }),
    doneStatus: 'sold', keepDone: true }),
  ...community({ base: '/rentals', rows: db.rentals, prefix: 'rnt', kind: 'rental', title: (r) => r.title, href: () => '/to-let',
    filter: (r, q) => (!q.get('type') || r.type === q.get('type')) && matches(q.get('search'), r.title, r.address, r.description),
    build: (b) => ({ type: String(b.type), title: String(b.title), rent: Number(b.rent), rooms: Number(b.rooms), gas: Boolean(b.gas), attachedBath: Boolean(b.attachedBath), description: String(b.description ?? ''), ownerName: String(b.ownerName), phone: String(b.phone), whatsapp: Boolean(b.whatsapp), address: String(b.address), mapUrl: String(b.mapUrl ?? ''), images: (b.images as string[]) ?? [], featured: false, verified: false }),
    doneStatus: 'rented', keepDone: true }),
  ...community({ base: '/vehicles', rows: db.vehicles, prefix: 'veh', kind: 'vehicle', title: (r) => r.ownerName, href: () => '/car-rent',
    filter: (r, q) => !q.get('type') || r.type === q.get('type'),
    build: (b) => ({ type: String(b.type), ownerName: String(b.ownerName), description: String(b.description ?? ''), phone: String(b.phone), whatsapp: Boolean(b.whatsapp), featured: false, verified: false }) }),
  ...community({ base: '/tuitions', rows: db.tuitions, prefix: 'tui', kind: 'tuition', title: (r) => `${r.subject} — ${r.classLevel}`, href: () => '/tuition',
    filter: (r, q) => (!q.get('kind') || r.kind === q.get('kind')) && matches(q.get('search'), r.subject, r.classLevel, r.address, r.name),
    build: (b) => ({ kind: String(b.kind), name: String(b.name), phone: String(b.phone), qualification: String(b.qualification ?? ''), experience: String(b.experience ?? ''), classLevel: String(b.classLevel), subject: String(b.subject), address: String(b.address ?? ''), note: String(b.note ?? ''), photo: ((b.images as string[]) ?? [])[0] ?? null }) }),

  /* ---- skilled workers ---- */
  ['GET', '/workers', ({ query }) => {
    const t = query.get('trade');
    return paginate(db.workers.filter((w) => (!t || w.trades.includes(t)) && matches(query.get('search'), w.name, w.phone)), query);
  }],
  ['POST', '/workers', ({ body }) => {
    const w = { id: db.nextId('wrk'), name: String(body.name), phone: String(body.phone), trades: body.trades as string[], address: String(body.address ?? ''), createdAt: new Date().toISOString() };
    db.workers.unshift(w);
    return created(w, 'নিবন্ধন সম্পন্ন হয়েছে');
  }],

  /* ---- education ---- */
  ['GET', '/institutions', ({ query }) => {
    const t = query.get('type');
    return paginate(db.institutions.filter((i) => (!t || i.type === t) && matches(query.get('search'), i.name, i.eiin, i.area)), query);
  }],
  ['GET', '/institutions/:id', ({ params }) => {
    const i = db.institutions.find((x) => x.id === params.id);
    return i ? ok(i) : fail(404, 'NOT_FOUND', 'প্রতিষ্ঠানটি পাওয়া যায়নি');
  }],
  ['POST', '/institutions', () => created({ id: db.nextId('ins'), status: 'pending' }, 'অ্যাডমিন যাচাইয়ের পর প্রকাশিত হবে')],
  ['POST', '/institutions/:id/claims', () => created({ id: db.nextId('clm'), status: 'pending' }, 'দাবি জমা হয়েছে')],
  ['GET', '/notices', ({ query }) => {
    const inst = query.get('institution');
    return paginate(db.notices.filter((n) => !inst || n.institutionId === inst).sort(byNewest), query);
  }],

  /* ---- area ---- */
  ['GET', '/area/profile', () => ok(db.areaProfile)],
  ['GET', '/area/unions', () => ok(db.unions)],
  ['GET', '/area/administration', () => ok(db.administration)],
  ['GET', '/area/municipality', () => ok(db.municipality)],

  /* ---- search ---- */
  ['GET', '/search', ({ query }) => {
    const q = query.get('q');
    if (!q) return ok([]);
    const hits = [
      ...db.doctors.filter((d) => matches(q, d.name, d.specialty)).map((d) => ({ kind: 'doctor', id: d.id, title: d.name, subtitle: `${d.specialty} বিশেষজ্ঞ`, href: `/doctors/${d.id}` })),
      ...db.directory.filter((e) => matches(q, e.name, e.role)).map((e) => ({ kind: 'directory', id: e.id, title: e.name, subtitle: e.role ?? '', href: `/directory/${e.type}` })),
      ...db.institutions.filter((i) => matches(q, i.name)).map((i) => ({ kind: 'institution', id: i.id, title: i.name, subtitle: i.area, href: `/education/${i.id}` })),
      ...db.jobs.filter((j) => j.status === 'active' && matches(q, j.title, j.company)).map((j) => ({ kind: 'job', id: j.id, title: j.title, subtitle: j.company, href: `/jobs/${j.id}` })),
    ];
    return ok(hits.slice(0, 30));
  }],

  /* ---- uploads: object URLs stand in for stored files ---- */
  ['POST', '/uploads', ({ body }) => created({ urls: (body.files as File[]).map((f) => URL.createObjectURL(f)) })],

  /* ---- auth: social sign-in (see the note at the top of the demo sign-in section) ---- */
  ['POST', '/auth/demo/sign-in', ({ body }) => {
    const provider = String(body.provider);
    if (!PROVIDER_NAMES[provider]) return fail(422, 'VALIDATION', 'অজানা সাইন ইন পদ্ধতি');
    const user: DemoUser = { id: DEMO_USER_ID, name: 'ডেমো ব্যবহারকারী', email: 'demo@example.com', avatar: null, provider };
    store()?.setItem(SESSION_KEY, JSON.stringify(user));
    return ok(session(user), `${PROVIDER_NAMES[provider]} দিয়ে সাইন ইন হয়েছে`);
  }],
  ['POST', '/auth/refresh', () => {
    const user = readSession();
    return user ? ok(session(user)) : fail(401, 'NO_SESSION', 'সাইন ইন করা নেই');
  }],
  ['POST', '/auth/logout', () => {
    store()?.removeItem(SESSION_KEY);
    return ok({ ok: true }, 'সাইন আউট হয়েছে');
  }],
  ['GET', '/me/posts', ({ userId }) => {
    if (!userId) return UNAUTHENTICATED();
    const mine = collections.flatMap((c) =>
      c.rows
        .filter((r) => r.ownerId === userId && r.status !== 'deleted')
        .map((r) => ({ kind: c.kind, id: r.id, title: c.title(r), status: r.status, createdAt: r.createdAt, href: c.href(r) })),
    );
    return ok(mine.sort(byNewest));
  }],
];

/** Compile "/a/:id/b" patterns once. */
const compiled = routes.map(([method, pattern, handler]) => {
  const keys: string[] = [];
  const re = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)'))}$`);
  return { method, re, keys, handler };
});

export async function demoFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  const method = (init?.method ?? 'GET').toUpperCase();
  const path = url.pathname.replace(/^.*\/api\/v1/, '') || '/';

  await sleep(LATENCY);
  if (init?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  for (const r of compiled) {
    if (r.method !== method) continue;
    const m = r.re.exec(path);
    if (!m) continue;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    let body: Json = {};
    if (typeof init?.body === 'string') body = JSON.parse(init.body) as Json;
    else if (init?.body instanceof FormData) body = { files: init.body.getAll('files') };
    const auth = new Headers(init?.headers).get('Authorization') ?? '';
    const userId = auth.startsWith('Bearer demo.') && readSession() ? auth.slice('Bearer demo.'.length) : null;
    return r.handler({ method, params, query: url.searchParams, body, userId });
  }
  return fail(404, 'ROUTE_NOT_FOUND', `ডেমো সার্ভারে ${method} ${path} নেই`);
}
