/**
 * In-browser fake of the Express API, used only when NEXT_PUBLIC_DATA_MODE=demo.
 * It speaks the same contract (envelope, pagination, error codes) so switching to the
 * real backend needs no component changes. State lives in memory for the tab's lifetime.
 */
import * as db from './data';

type Json = Record<string, unknown>;
type Req = { method: string; params: Record<string, string>; query: URLSearchParams; body: Json };
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

/* PINs for demo posts: every seeded post uses 1234; new posts keep the PIN they were created with. */
const pins = new Map<string, string>();
const pinOf = (id: string) => pins.get(id) ?? '1234';

/** CRUD + PIN + report handlers for one community collection. */
function community<T extends { id: string; createdAt: string; status: string }>(
  base: string,
  rows: T[],
  prefix: string,
  filter: (row: T, q: URLSearchParams) => boolean,
  build: (body: Json) => Omit<T, 'id' | 'createdAt' | 'status'>,
  doneStatus = 'done',
  /** Sold / rented posts stay listed (dimmed); filled jobs and found tutors drop off. */
  keepDone = false,
): [string, string, Handler][] {
  const visible = (r: T) => r.status === 'active' || (keepDone && r.status === doneStatus);
  return [
    ['GET', base, ({ query }) => paginate(rows.filter((r) => visible(r) && filter(r, query)).sort(byNewest), query)],
    ['GET', `${base}/:id`, ({ params }) => {
      const row = rows.find((r) => r.id === params.id && visible(r));
      return row ? ok(row) : fail(404, 'NOT_FOUND', 'পোস্টটি পাওয়া যায়নি');
    }],
    ['POST', base, ({ body }) => {
      const pin = String(body.pin ?? '');
      if (!/^\d{4,6}$/.test(pin)) return fail(422, 'VALIDATION', 'পিন ৪ থেকে ৬ সংখ্যার হতে হবে', [{ path: 'pin', message: 'পিন ৪ থেকে ৬ সংখ্যার হতে হবে' }]);
      const row = { ...build(body), id: db.nextId(prefix), createdAt: new Date().toISOString(), status: 'active' } as T;
      rows.unshift(row);
      pins.set(row.id, pin);
      return created({ id: row.id, status: 'published' }, 'পোস্ট প্রকাশিত হয়েছে');
    }],
    ['PATCH', `${base}/:id`, ({ params, body }) => {
      const row = rows.find((r) => r.id === params.id);
      if (!row) return fail(404, 'NOT_FOUND', 'পোস্টটি পাওয়া যায়নি');
      if (String(body.pin) !== pinOf(row.id)) return fail(403, 'INVALID_PIN', 'পিন মেলেনি', [{ path: 'pin', message: 'পিন মেলেনি' }]);
      const { pin: _pin, ...rest } = body;
      Object.assign(row, rest);
      return ok(row, 'হালনাগাদ হয়েছে');
    }],
    ['POST', `${base}/:id/manage`, ({ params, body }) => {
      const row = rows.find((r) => r.id === params.id);
      if (!row) return fail(404, 'NOT_FOUND', 'পোস্টটি পাওয়া যায়নি');
      if (String(body.pin) !== pinOf(row.id)) return fail(403, 'INVALID_PIN', 'পিন মেলেনি। আবার চেষ্টা করুন।', [{ path: 'pin', message: 'পিন মেলেনি' }]);
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
  ...community('/jobs', db.jobs, 'job',
    (r, q) => matches(q.get('search'), r.company, r.title, r.address),
    (b) => ({ company: String(b.company), title: String(b.title), vacancies: Number(b.vacancies), salary: String(b.salary ?? ''), education: String(b.education ?? ''), details: String(b.details ?? ''), phone: String(b.phone), whatsapp: Boolean(b.whatsapp), address: String(b.address ?? ''), image: ((b.images as string[]) ?? [])[0] ?? null, deadline: String(b.deadline) })),
  ...community('/listings', db.listings, 'lst',
    (r, q) => (!q.get('category') || r.category === q.get('category')) && matches(q.get('search'), r.title, r.address, r.description),
    (b) => ({ category: String(b.category), title: String(b.title), condition: String(b.condition), price: Number(b.price), description: String(b.description ?? ''), images: (b.images as string[]) ?? [], sellerName: String(b.sellerName), phone: String(b.phone), whatsapp: Boolean(b.whatsapp), address: String(b.address ?? '') }),
    'sold', true),
  ...community('/rentals', db.rentals, 'rnt',
    (r, q) => (!q.get('type') || r.type === q.get('type')) && matches(q.get('search'), r.title, r.address, r.description),
    (b) => ({ type: String(b.type), title: String(b.title), rent: Number(b.rent), rooms: Number(b.rooms), gas: Boolean(b.gas), attachedBath: Boolean(b.attachedBath), description: String(b.description ?? ''), ownerName: String(b.ownerName), phone: String(b.phone), whatsapp: Boolean(b.whatsapp), address: String(b.address), mapUrl: String(b.mapUrl ?? ''), images: (b.images as string[]) ?? [], featured: false, verified: false }),
    'rented', true),
  ...community('/vehicles', db.vehicles, 'veh',
    (r, q) => !q.get('type') || r.type === q.get('type'),
    (b) => ({ type: String(b.type), ownerName: String(b.ownerName), description: String(b.description ?? ''), phone: String(b.phone), whatsapp: Boolean(b.whatsapp), featured: false, verified: false })),
  ...community('/tuitions', db.tuitions, 'tui',
    (r, q) => (!q.get('kind') || r.kind === q.get('kind')) && matches(q.get('search'), r.subject, r.classLevel, r.address, r.name),
    (b) => ({ kind: String(b.kind), name: String(b.name), phone: String(b.phone), qualification: String(b.qualification ?? ''), experience: String(b.experience ?? ''), classLevel: String(b.classLevel), subject: String(b.subject), address: String(b.address ?? ''), note: String(b.note ?? ''), photo: ((b.images as string[]) ?? [])[0] ?? null })),

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

  /* ---- auth (no portal login yet) ---- */
  ['POST', '/auth/refresh', () => fail(401, 'NO_SESSION', 'লগইন করা নেই')],
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
    return r.handler({ method, params, query: url.searchParams, body });
  }
  return fail(404, 'ROUTE_NOT_FOUND', `ডেমো সার্ভারে ${method} ${path} নেই`);
}
