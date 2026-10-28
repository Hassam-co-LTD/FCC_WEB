import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, delay, of, throwError, timer, mergeMap } from 'rxjs';

import {
  CAPTCHA,
  DEMO_ACCOUNTS,
  DEMO_PERMISSIONS,
  DemoDb,
  createSeedDb,
} from './demo-data';

/*
 * In-browser fake backend used by the demo build (environment.demoMode).
 *
 * It answers every HttpClient request with data from an in-memory database
 * seeded from demo-data.ts, so the app can be showcased without the gateway.
 * Changes are kept in localStorage, so they survive a page reload; clearing
 * site data (or the "Reset demo data" link on the login page) starts over.
 */

// Bump the version whenever demo-data.ts changes so visitors get the new seed
const STORAGE_KEY = 'fcc-demo-db:v1';
const LATENCY_MS = 250;

let db: DemoDb | null = null;

function getDb(): DemoDb {
  if (db) return db;

  let stored: DemoDb | null = null;
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    stored = raw ? (JSON.parse(raw) as DemoDb) : null;
  } catch {
    // unreadable storage: fall back to the seed
  }

  db = stored && typeof stored === 'object' ? stored : createSeedDb();
  return db;
}

function saveDb(): void {
  // Nothing loaded yet (e.g. a captcha POST): don't overwrite storage with "null"
  if (!db) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // storage unavailable: the demo still works for this page load
  }
}

function table(name: string): any[] {
  const store = getDb();
  if (!store[name]) store[name] = [];
  return store[name];
}

/* ------------------------------------------------------------------ */
/* Response helpers                                                    */
/* ------------------------------------------------------------------ */

class DemoError {
  constructor(
    readonly status: number,
    readonly message: string,
  ) {}
}

const notFound = (what: string) => new DemoError(404, `${what} not found`);

const clone = <T>(value: T): T => (value === undefined ? value : JSON.parse(JSON.stringify(value)));
const now = () => new Date().toISOString();
const same = (a: unknown, b: unknown) => String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase();

function nextId(rows: any[]): number {
  return rows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
}

function currentLoginId(): string {
  try {
    return JSON.parse(window.sessionStorage.getItem('userData') || '{}').loginId || 'user';
  } catch {
    return 'user';
  }
}

/* ------------------------------------------------------------------ */
/* Trade & payment transactions (settlement system)                    */
/* ------------------------------------------------------------------ */

const TNX_PREFIX: Record<string, string> = {
  importlc: 'ILC',
  shippingguarantee: 'SG',
  exportcollection: 'EC',
  utg: 'UTG',
  transfers: 'FT',
  exportlc: 'ELC',
  importcollection: 'IC',
};

const EVENT_MODULES: Record<string, string> = {
  'import-lc': 'importlc',
  shippingguarantee: 'shippingguarantee',
  utg: 'utg',
  'export-collection': 'exportcollection',
};

// Fields the client may send but must not overwrite on an existing record
const SYSTEM_KEYS = ['id', 'tnxId', 'createdOn', 'companyId'];

function mergeInto(target: any, body: any, keep: string[] = SYSTEM_KEYS): any {
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    for (const [key, value] of Object.entries(body)) {
      if (!keep.includes(key)) target[key] = value;
    }
  }
  target.updatedOn = now();
  target.updatedBy = currentLoginId();
  return target;
}

function findTnx(module: string, tnxId: string): any {
  const row = table(module).find((r) => same(r.tnxId, tnxId) || String(r.id) === tnxId);
  if (!row) throw notFound(`Transaction ${tnxId}`);
  return row;
}

function createTnx(module: string, body: any): any {
  const rows = table(module);
  const id = nextId(rows);
  const row = {
    ...body,
    id,
    tnxId: `${TNX_PREFIX[module]}${String(Date.now()).slice(-6)}${id}`,
    companyId: 'CORP',
    status: body?.status && body.status !== 'S' ? body.status : 'I',
    eventType: 'NEW',
    eventSequence: 0,
    createdOn: now(),
    createdBy: currentLoginId(),
    updatedOn: now(),
  };
  rows.unshift(row);
  return row;
}

function byStatus(rows: any[], status?: string | null): any[] {
  return status ? rows.filter((r) => same(r.status, status)) : rows;
}

const isLive = (r: any) => ['A', 'L'].includes(String(r.status).toUpperCase());

function handleTradeModule(module: string, seg: string[], req: HttpRequest<any>): any {
  const [action, arg] = seg;
  const body = req.body;
  const method = req.method;

  if (method === 'GET') {
    if (!action) return table(module);
    if (action === 'records' || action === 'status') {
      return byStatus(table(module), arg ?? req.params.get('status'));
    }
    if (action === 'rejectedSnapshot') return clone(findTnx(module, arg));
    if (seg[1] === 'rejected-history') return clone(findTnx(module, action));
    return findTnx(module, action);
  }

  if (method === 'POST' && action === 'save') return createTnx(module, body);

  if (method === 'POST' && action === 'submit') {
    const row = mergeInto(findTnx(module, arg), body);
    row.status = 'S';
    return row;
  }

  if (method === 'POST' && action === 'approve') {
    const row = mergeInto(findTnx(module, arg), body);
    row.status = 'A';
    row.rejectionReason = undefined;
    row.backofficeRefNo = `BO-${TNX_PREFIX[module]}-${Math.floor(Math.random() * 90000) + 10000}`;
    row.backofficeDate = now();
    return row;
  }

  if (method === 'POST' && action === 'rejectReason') {
    const row = findTnx(module, arg);
    row.status = 'R';
    row.rejectionReason = body?.rejectionReason ?? 'Rejected';
    row.updatedOn = now();
    return row;
  }

  if (method === 'PUT' && action === 'updateRejected') {
    const row = mergeInto(findTnx(module, arg), body);
    row.status = 'I';
    return row;
  }

  if (method === 'PUT' && action === 'updatePending') return mergeInto(findTnx(module, arg), body);
  if (method === 'PUT' && action) return mergeInto(findTnx(module, action), body);

  throw notFound(`${method} ${module}/${seg.join('/')}`);
}

function handleEvents(module: string, seg: string[], req: HttpRequest<any>): any {
  const events = table(`events:${module}`);
  const findEvent = (ref: string) => {
    const ev = events.find((e) => same(e.eventRefNo, ref));
    if (!ev) throw notFound(`Amendment ${ref}`);
    return ev;
  };
  const [kind, action, arg] = seg;
  const body = req.body;

  if (kind === 'event' && req.method === 'GET') return findEvent(action);
  if (kind !== 'amend') throw notFound(`events/${seg.join('/')}`);

  if (req.method === 'GET') {
    if (action === 'live-records' || action === 'live-master-records') {
      return table(module).filter(isLive);
    }
    if (action === 'records') return byStatus(events, arg);
    if (arg === 'rejected-history') return clone(findEvent(action));
    // Amendment form is prefilled from the live master record
    return clone(findTnx(module, action));
  }

  if (req.method === 'PUT' && action === 'updatePending') return mergeInto(findEvent(arg), body, ['eventRefNo', 'tnxId']);

  if (req.method === 'PUT' && action === 'updateRejected') {
    const ev = mergeInto(findEvent(arg), body, ['eventRefNo', 'tnxId']);
    ev.status = 'I';
    return ev;
  }

  if (req.method === 'PUT') {
    // Save a new amendment draft for the master transaction `action`
    const master = findTnx(module, action);
    const draft = events.find((e) => same(e.tnxId, master.tnxId) && same(e.status, 'I'));
    if (draft) return mergeInto(draft, body, ['eventRefNo', 'tnxId']);

    const sequence = events.filter((e) => same(e.tnxId, master.tnxId)).length + 1;
    const ev = {
      ...clone(master),
      ...(body ?? {}),
      id: nextId(events),
      tnxId: master.tnxId,
      eventRefNo: `${master.tnxId}-AMD${sequence}`,
      eventType: 'AMEND',
      eventSequence: sequence,
      status: 'I',
      rejectionReason: undefined,
      createdOn: now(),
      updatedOn: now(),
    };
    events.unshift(ev);
    return ev;
  }

  if (req.method === 'POST') {
    const ev = findEvent(arg);
    if (action === 'submit') {
      mergeInto(ev, body?.data ?? body, ['eventRefNo', 'tnxId', 'id']);
      ev.status = 'S';
    } else if (action === 'approve') {
      mergeInto(ev, body?.data ?? body, ['eventRefNo', 'tnxId', 'id']);
      ev.status = 'A';
      // An approved amendment updates the live master transaction
      const master = findTnx(module, ev.tnxId);
      const { id, eventRefNo, eventType, status, createdOn, ...changes } = ev;
      mergeInto(master, changes);
      master.eventSequence = ev.eventSequence;
    } else if (action === 'reject') {
      ev.status = 'R';
      ev.rejectionReason = body?.rejectionReason ?? 'Rejected';
      ev.updatedOn = now();
    }
    return ev;
  }

  throw notFound(`events/${seg.join('/')}`);
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

const DASHBOARD_MODULES: [string, string, string][] = [
  ['importlc', 'IMPORT_LC', 'importLc'],
  ['shippingguarantee', 'SHIPPING_GUARANTEE', 'shippingGuarantee'],
  ['utg', 'UNDERTAKING', 'undertaking'],
  ['exportcollection', 'EXPORT_COLLECTION', 'exportCollection'],
];

function countByStatus(): any {
  const result: any = {};
  for (const [module, , key] of DASHBOARD_MODULES) {
    const rows = table(module);
    const counts: any = { I: 0, S: 0, A: 0, R: 0, total: rows.length };
    rows.forEach((r) => {
      const s = String(r.status).toUpperCase();
      if (s in counts) counts[s]++;
    });
    result[key] = counts;
  }
  return result;
}

function dashboard(req: HttpRequest<any>): any {
  const all = DASHBOARD_MODULES.flatMap(([module, type]) =>
    table(module).map((r) => ({
      tnxId: r.tnxId,
      transactionType: type,
      status: r.status,
      currency: r.currency,
      amount: r.amount ?? r.undertakingAmount,
      createdOn: r.createdOn,
      expiryDate: r.expiryDate ?? null,
    })),
  ).sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime());

  const year = Number(req.params.get('year')) || new Date().getFullYear();
  const month = Number(req.params.get('month')) || new Date().getMonth() + 1;
  const inMonth = (date: string | null) => {
    if (!date) return false;
    const d = new Date(date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  };

  return {
    recentCreated: all.slice(0, 10),
    recentExpired: all.filter((t) => t.expiryDate && new Date(t.expiryDate) < new Date()),
    calendarTransactions: all.filter((t) => inMonth(t.createdOn) || inMonth(t.expiryDate)),
  };
}

/* ------------------------------------------------------------------ */
/* Admin masters (secondAdmin)                                         */
/* ------------------------------------------------------------------ */

// Business keys screens use besides `id`, per table
const ENTITY_KEYS: Record<string, string[]> = {
  city: ['cityId'],
  branch: ['branchId'],
  company: ['companyId'],
  currency: ['currencyId'],
  customer: ['custId'],
  clientUsers: ['appUserId', 'loginId'],
  roles: ['roleId'],
  Permissions: ['permissionId'],
  PermissionsGroup: ['permissionGroupId'],
  'dynamic-fields': ['fieldId'],
};

// Numeric keys the backend would generate along with `id`
const GENERATED_KEYS: Record<string, string> = {
  city: 'cityId',
  branch: 'branchId',
  currency: 'currencyId',
  clientUsers: 'appUserId',
  Permissions: 'permissionId',
  PermissionsGroup: 'permissionGroupId',
  'dynamic-fields': 'fieldId',
};

function findEntity(name: string, id: string): any {
  const keys = ['id', ...(ENTITY_KEYS[name] ?? [])];
  const row = table(name).find((r) => keys.some((k) => r[k] !== undefined && String(r[k]) === String(id)));
  if (!row) throw notFound(`${name} ${id}`);
  return row;
}

function createEntity(name: string, body: any): any {
  const rows = table(name);
  const id = nextId(rows);
  const row: any = {
    ...body,
    id,
    recordStatus: body?.recordStatus || 'I',
    createdBy: currentLoginId(),
    createdOn: now(),
    inputterId: currentLoginId(),
    inputterDttm: now(),
    updatedOn: now(),
  };
  if (GENERATED_KEYS[name] && row[GENERATED_KEYS[name]] == null) row[GENERATED_KEYS[name]] = id;
  if (name === 'customer' && !row.custId) row.custId = `C${1000 + id}`;
  if (name === 'roles' && !row.roleId) row.roleId = `ROLE${id}`;
  rows.unshift(row);
  return row;
}

function setEntityStatus(row: any, body: any): any {
  const payload = typeof body === 'string' ? { recordStatus: body } : body ?? {};
  const status = String(payload.recordStatus ?? '').toUpperCase();

  Object.assign(row, payload, { updatedOn: now(), updatedBy: currentLoginId() });

  if (status === 'A') {
    row.authorizerId = payload.authorizerId || currentLoginId();
    row.authorizerDttm = now();
    row.rejectReason = null;
  } else if (status === 'R') {
    row.rejectedBy = payload.rejectedBy || currentLoginId();
    row.rejectedOn = now();
  } else if (status === 'S') {
    row.inputterId = payload.inputterId || currentLoginId();
    row.inputterDttm = now();
  }
  return row;
}

function removeEntity(name: string, row: any): any {
  const rows = table(name);
  rows.splice(rows.indexOf(row), 1);
  return { success: true, message: 'Deleted successfully' };
}

function handleAdmin(seg: string[], req: HttpRequest<any>): any {
  const body = req.body;

  // Sub-resources that read from their parent table
  if (seg[0] === 'clientUsers' && seg[1] === 'customer-users') seg.splice(1, 1);
  if (seg[0] === 'city' && seg[1] === 'getApprovedCities') seg.splice(1, 1);

  const [name, action, arg] = seg;
  const rows = table(name);
  const visible = () => rows.filter((r) => !same(r.recordStatus, 'D'));

  if (req.method === 'GET') {
    if (!action || action === 'list') return visible();
    if (action === 'status') return rows.filter((r) => same(r.recordStatus, arg));
    if (action === 'id') return findEntity(name, arg);
    if (name === 'user-roles') return rows.filter((r) => String(r.userId) === action);
    if (name === 'accounts') return rows.filter((r) => same(r.custId, action));
    return findEntity(name, action);
  }

  if (req.method === 'POST') {
    if (action === 'import') return { success: true, message: 'File imported successfully (demo)', importedCount: 3 };
    if (name === 'user-roles' && Array.isArray(body)) return body.map((b) => createEntity(name, b));
    return createEntity(name, body);
  }

  if (req.method === 'PUT') {
    if (action === 'setStatus') {
      const row = findEntity(name, arg);
      const status = typeof body === 'string' ? body : body?.recordStatus;
      return same(status, 'D') ? removeEntity(name, row) : setEntityStatus(row, body);
    }
    if (action === 'update') {
      if (name === 'user-roles') {
        rows.splice(0, rows.length, ...rows.filter((r) => String(r.userId) !== arg));
        const list = Array.isArray(body) ? body : body?.roles ?? [body];
        return list.map((b: any) => createEntity(name, { ...b, userId: b?.userId ?? arg }));
      }
      return mergeInto(findEntity(name, arg), body, ['id']);
    }
    if (action === 'byCustId') {
      const row = rows.find((r) => same(r.custId, arg));
      if (!row) throw notFound(`customer ${arg}`);
      return mergeInto(row, body, ['id', 'custId']);
    }
    if (action) return mergeInto(findEntity(name, action), body, ['id']);
    return mergeInto(findEntity(name, body?.id), body, ['id']);
  }

  if (req.method === 'DELETE') {
    if (action === 'delete') return removeEntity(name, findEntity(name, arg));
    const ids = (Array.isArray(body) ? body : [body]).map((b: any) => String(b?.id ?? b));
    rows.splice(0, rows.length, ...rows.filter((r) => !ids.includes(String(r.id))));
    return { success: true, message: 'Deleted successfully' };
  }

  throw notFound(`${req.method} ${seg.join('/')}`);
}

/* ------------------------------------------------------------------ */
/* Auth, captcha, chatbot and other single endpoints                   */
/* ------------------------------------------------------------------ */

function login(body: any): any {
  const account = DEMO_ACCOUNTS.find(
    (a) => same(a.loginId, body?.loginId?.trim()) && same(a.companyId, body?.companyId?.trim()),
  );

  if (!account || account.password !== body?.password) {
    throw new DemoError(401, 'Invalid credentials. Use one of the demo accounts shown on the login page.');
  }

  const user = table('clientUsers').find((u) => same(u.loginId, account.loginId));

  return {
    statusCode: 'OK',
    body: {
      userId: user?.id ?? 1,
      loginId: account.loginId,
      userName: account.userName,
      email: `${account.loginId}@fccdemo.example`,
      companyId: account.companyId,
      companyType: account.companyType,
      userCategory: account.userCategory,
      userStatus: 'A',
      token: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
      permissionGroupName: 'Full Access',
      permissionNames: DEMO_PERMISSIONS,
    },
  };
}

function chatbotAnswer(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('lc') || q.includes('letter of credit')) {
    return 'To issue an Import LC, open Trade Services > Import LC > Create, fill in the applicant, beneficiary, amount and shipment details, then Save and Submit for approval.';
  }
  if (q.includes('guarantee')) {
    return 'Shipping guarantees let you take delivery of goods before the original bill of lading arrives. Create one from Trade Services > Shipping Guarantee.';
  }
  if (q.includes('transfer')) {
    return 'Fund transfers are created under Payment Services. A maker saves and submits the transfer, then a checker approves it.';
  }
  return 'This is a demo assistant running without a backend. Try asking about LCs, guarantees or fund transfers.';
}

/* ------------------------------------------------------------------ */
/* Router                                                              */
/* ------------------------------------------------------------------ */

function route(req: HttpRequest<any>): any {
  const url = new URL(req.urlWithParams, 'http://demo.local');
  const path = url.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '');
  const params = req.params;
  const body = req.body;
  let m: RegExpMatchArray | null;

  // ---- Auth & public endpoints ----
  if (/\/clientUsers\/login$/.test(path)) return login(body);
  if (/\/clientUsers\/forgot-password$/.test(path)) return 'A password reset link has been sent to your registered email (demo).';
  if (/\/clientUsers\/reset-password$/.test(path)) return 'Password has been reset successfully (demo).';
  if (/\/clientUsers\/validate-reset-token$/.test(path)) return { valid: true, status: 'success' };
  if (/^\/api\/v1\/clientUsers\//.test(path)) return { success: true, message: 'Password changed successfully (demo).' };
  if (/\/auth\/refresh-token$/.test(path)) return { accessToken: 'demo-access-token', refreshToken: 'demo-refresh-token' };
  if (/\/otp\/verify$/.test(path)) return 'OTP verified successfully';

  if (/\/captcha\/challenge$/.test(path)) {
    return { challengeId: `demo-${Date.now()}`, question: CAPTCHA.question, items: [...CAPTCHA.items].sort(() => Math.random() - 0.5) };
  }
  if (/\/captcha\/verify$/.test(path)) {
    const verified = body?.answer === CAPTCHA.answer;
    return {
      verified,
      verificationToken: verified ? 'demo-captcha-token' : null,
      message: verified ? 'Verified' : `Incorrect answer. Hint: choose "${CAPTCHA.answer}".`,
    };
  }

  if ((m = path.match(/\/customer-registration-requests(\/pending)?(\/count)?$/))) {
    const requests = table('registrationRequests');
    if (req.method === 'POST') {
      const row = { ...body, id: nextId(requests), status: 'PENDING', createdOn: now() };
      requests.unshift(row);
      return { success: true, message: 'Registration request submitted (demo).', ...row };
    }
    const pending = requests.filter((r) => r.status === 'PENDING');
    return m[2] ? pending.length : pending;
  }
  if (/\/customer-registration\/verify-bank-account$/.test(path)) return { verified: true, message: 'Account verified (demo).' };

  // ---- Chatbot ----
  if (/\/chatbot\/api\/chatbot\/ask$/.test(path)) {
    return { answer: chatbotAnswer(body?.question ?? ''), sources: ['FCC demo knowledge base'], conversationId: body?.conversationId || `demo-${Date.now()}` };
  }
  if (/\/chatbot\/api\/chatbot\/ingest\//.test(path)) return { indexedChunks: 42 };
  if (/\/chatbot\/chat$/.test(path)) return chatbotAnswer(body?.message ?? '');

  // ---- Dashboard ----
  if (/\/user-dashboard\/count-by-status$/.test(path)) return countByStatus();
  if (/\/user-dashboard$/.test(path)) return dashboard(req);

  // ---- Accounts & roles used by fund transfers (no slash after v1 in ApiService) ----
  if ((m = path.match(/\/settlementsystem\/api\/v1\/?accounts\/(.*)$/))) {
    const [action, arg] = m[1].split('/');
    const accounts = table('bankAccounts');
    if (action === 'check-access') return true;
    if (['accessible', 'transfer-from', 'transfer-to'].includes(action)) return accounts;
    if (action === 'company') return accounts.filter((a) => same(a.companyId, arg));
    if (action === 'save') return 'Account created successfully (demo).';
    if (action === 'update') return 'Account updated successfully (demo).';
    const account = accounts.find((a) => a.accountNumber === action);
    if (!account) throw notFound(`Account ${action}`);
    return account;
  }
  if ((m = path.match(/\/settlementsystem\/api\/v1\/?roles\/(.*)$/))) {
    const [action, arg, code] = m[1].split('/');
    const roles = table('roles').map((r) => ({ ...r, roleCode: r.roleId, roleName: r.roleDesc, isActive: true }));
    if (action === 'active') return roles;
    if (action === 'code') return roles.find((r) => same(r.roleCode, arg)) ?? null;
    if (action === 'permissions') return code !== 'VIEWER';
  }

  // ---- Trade events (amendments) ----
  if ((m = path.match(/\/settlementsystem\/api\/([\w-]+)\/events\/(.+)$/)) && EVENT_MODULES[m[1]]) {
    return handleEvents(EVENT_MODULES[m[1]], m[2].split('/'), req);
  }

  // ---- Trade transactions ----
  if ((m = path.match(/\/(?:settlementsystem|middleware-service\/mw)\/api\/v1\/([\w-]+)(?:\/(.*))?$/))) {
    const [, module, rest = ''] = m;
    const seg = rest ? rest.split('/') : [];
    if (TNX_PREFIX[module]) return handleTradeModule(module, seg, req);

    // Admin screens read rejected history through the settlement base URL
    if (seg[1] === 'rejected-history') return clone(findEntity(module, seg[0]));
  }

  // ---- Dynamic fields & dropdowns ----
  if ((m = path.match(/\/dynamic-fields\/screen\/([^/]+)\/status\/([^/]+)$/))) {
    const [, screen, status] = m;
    return table('dynamic-fields').filter((f) => same(f.screen, screen) && same(f.recordStatus, status));
  }
  if (/\/dynamic-dropdown-options$/.test(path)) {
    const dropdown = table('dynamic-dropdown').find((d) => same(d.name, params.get('dropdownType')));
    return dropdown?.options ?? [];
  }
  if (/\/dropdown-values\/search$/.test(path)) {
    const dropdown = table('dynamic-dropdown').find((d) => same(d.name, params.get('dropDown')));
    return dropdown?.options ?? [];
  }

  // ---- Admin masters ----
  if ((m = path.match(/\/secondAdmin\/api\/v1\/(.+)$/))) {
    return handleAdmin(m[1].split('/').map(decodeURIComponent), req);
  }

  console.warn('[demo backend] No mock for', req.method, path);
  return req.method === 'GET' ? [] : { success: true, message: 'Saved (demo)' };
}

export const demoBackendInterceptor: HttpInterceptorFn = (req): Observable<HttpEvent<unknown>> => {
  let body: any;

  try {
    body = route(req);
    if (req.method !== 'GET') saveDb();
  } catch (error) {
    const status = error instanceof DemoError ? error.status : 500;
    const message = error instanceof DemoError ? error.message : 'Demo backend error';
    if (!(error instanceof DemoError)) console.error('[demo backend]', req.method, req.url, error);

    return timer(LATENCY_MS).pipe(
      mergeMap(() =>
        throwError(
          () => new HttpErrorResponse({ status, statusText: message, url: req.url, error: { message } }),
        ),
      ),
    );
  }

  if (req.responseType === 'text' && typeof body !== 'string') body = JSON.stringify(body);

  return of(new HttpResponse({ status: 200, url: req.url, body: clone(body) })).pipe(delay(LATENCY_MS));
};

/** Drop all demo changes so the next request starts from the seed data. */
export function resetDemoData(): void {
  db = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing stored
  }
}
