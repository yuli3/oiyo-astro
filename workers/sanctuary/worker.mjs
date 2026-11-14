import { DurableObject } from 'cloudflare:workers';
import { CAPACITY, PROTOCOL, validRoom, chooseSeat, parseAction, applyAction, publicMembers } from './protocol.mjs';

// 2026-11-09 conservative release (세운 '보수적으로 공개'): served on oiyo.net/sanctuary-api/* only,
// sessions end after 30 minutes or 10 idle minutes, consumed ticket IDs are swept by an alarm,
// and SHARED_ENABLED="false" turns the shared room off while solo mode keeps working.
const API_PREFIX = '/sanctuary-api';
const SESSION_MAX_MS = 30 * 60 * 1000;
const IDLE_MAX_MS = 10 * 60 * 1000;
const SWEEP_MS = 60 * 1000;

const encode = bytes => btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
function decode(value) {
  return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
}
async function signingKey(secret) {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign', 'verify']);
}
async function ticket(secret, payload) {
  const data = encode(new TextEncoder().encode(JSON.stringify(payload)));
  return `${data}.${encode(new Uint8Array(await crypto.subtle.sign('HMAC', await signingKey(secret), new TextEncoder().encode(data))))}`;
}
async function verify(secret, value) {
  try {
    if (!value || value.length > 1024) return null;
    const [data, sig, extra] = value.split('.');
    if (extra || !data || !sig || !(await crypto.subtle.verify('HMAC', await signingKey(secret), decode(sig), new TextEncoder().encode(data)))) return null;
    const p = JSON.parse(new TextDecoder().decode(decode(data)));
    return p.exp > Date.now() && p.exp <= Date.now() + 65000 && typeof p.id === 'string' && /^[a-f0-9-]{36}$/.test(p.id) && validRoom(p.scene, p.room) ? p : null;
  } catch { return null; }
}
function response(status, data, origin) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...(origin ? {'Access-Control-Allow-Origin': origin, 'Vary': 'Origin'} : {}) } });
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.startsWith(API_PREFIX) ? url.pathname.slice(API_PREFIX.length) || '/' : url.pathname;
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || '').split(',');
    if (!origin || !allowed.includes(origin)) return response(403, {error:'origin'});
    if (request.method === 'OPTIONS') return new Response(null, {status:204, headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'}});
    // 2026-11-02: a public, loopback-only dev key is never accepted on a deployed host.
    const local = ['127.0.0.1', 'localhost'].includes(url.hostname) && env.DEV_MODE === 'true';
    const secret = env.ROOM_SECRET || (local ? 'public-local-development-only' : null);
    if (!secret) return response(503, {error:'not_configured'}, origin);
    if (env.SHARED_ENABLED === 'false') return response(503, {error:'paused'}, origin);
    if (path === '/session' && request.method === 'POST') {
      const scene = url.searchParams.get('scene');
      const room = url.searchParams.get('room');
      if (!validRoom(scene, room)) return response(400, {error:'room'}, origin);
      // No user text, birth data, cookies or IP is persisted in the room protocol.
      if (request.body) {
        const reader = request.body.getReader();
        const chunk = await reader.read();
        await reader.cancel();
        if (chunk.value?.byteLength) return response(400, {error:'body_not_allowed'}, origin);
      }
      if (env.JOIN_LIMITER) {
        const result = await env.JOIN_LIMITER.limit({key: request.headers.get('CF-Connecting-IP') || 'unknown'});
        if (!result.success) return response(429, {error:'slow_down'}, origin);
      } else if (!local) return response(503, {error:'join_limiter_not_configured'}, origin);
      const payload = {id:crypto.randomUUID(), scene, room, exp:Date.now()+60000};
      return response(200, {ticket:await ticket(secret, payload)}, origin);
    }
    if (path === '/connect' && request.method === 'GET') {
      if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') return response(426, {error:'websocket'}, origin);
      const protocols = (request.headers.get('Sec-WebSocket-Protocol') || '').split(',').map(x=>x.trim());
      const p = protocols.includes(PROTOCOL) ? await verify(secret, protocols.find(x=>x.startsWith('ticket.'))?.slice(7)) : null;
      if (!p) return response(401, {error:'ticket'}, origin);
      const headers = new Headers(request.headers);
      headers.set('X-Sanctuary-Id', p.id);
      headers.set('X-Sanctuary-Expiry', String(p.exp));
      const id = env.ROOMS.idFromName(`${p.scene}:${p.room}`);
      return env.ROOMS.get(id).fetch(new Request(request, {headers}));
    }
    return response(404, {error:'not_found'}, origin);
  }
};

export class SanctuaryRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    // Store only consumed short-lived ticket IDs; no conversation or presence history.
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS tickets (id TEXT PRIMARY KEY, expiry INTEGER NOT NULL)');
  }
  members() { return this.ctx.getWebSockets().filter(s=>s.readyState===1).map(s=>s.deserializeAttachment()); }
  send(socket, value) { try { socket.send(JSON.stringify(value)); } catch { try { socket.close(1011, 'send_failed'); } catch {} } }
  broadcast(event) {
    const value = {v:1, type:'snapshot', members:publicMembers(this.members()), event, eventId:crypto.randomUUID()};
    for (const socket of this.ctx.getWebSockets()) this.send(socket, value);
  }
  async fetch(request) {
    const id = request.headers.get('X-Sanctuary-Id');
    const expiry = Number(request.headers.get('X-Sanctuary-Expiry'));
    if (!id || !Number.isFinite(expiry) || expiry <= Date.now()) return new Response('Unauthorized', {status:401});
    this.ctx.storage.sql.exec('DELETE FROM tickets WHERE expiry < ?', Date.now());
    if ([...this.ctx.storage.sql.exec('SELECT id FROM tickets WHERE id = ?', id)].length) return new Response('Used ticket', {status:401});
    const seat = chooseSeat(this.members());
    if (seat < 0) return new Response('Room full', {status:409});
    this.ctx.storage.sql.exec('INSERT INTO tickets (id, expiry) VALUES (?, ?)', id, expiry);
    await this.scheduleSweep();
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    // Attachments survive hibernation; in-memory membership would disappear on wake.
    const now = Date.now();
    server.serializeAttachment({id, seat, lastAction:0, recent:[], joinedAt:now, lastSeen:now});
    this.send(server, {v:1,type:'welcome',self:id,capacity:CAPACITY});
    this.broadcast(null);
    return new Response(null, {status:101,webSocket:client,headers:{'Sec-WebSocket-Protocol':PROTOCOL}});
  }
  webSocketMessage(socket, raw) {
    const member = socket.deserializeAttachment();
    const result = applyAction(member, this.members(), parseAction(raw), Date.now());
    if (result.duplicate) return;
    if (result.error) {
      if (result.error === 'invalid') { socket.close(1008, 'invalid_message'); return; }
      const violations = (member.violations || 0) + 1;
      socket.serializeAttachment({...member, violations});
      this.send(socket, {v:1,type:'error',code:result.error});
      if (violations >= 3) socket.close(1008, 'rate_limit');
      return;
    }
    socket.serializeAttachment({...result.member, violations:0, lastSeen:Date.now()});
    const action = parseAction(raw);
    this.broadcast(action.type === 'gesture' ? {member:member.id,gesture:action.gesture,id:action.id} : null);
  }
  async scheduleSweep() {
    if ((await this.ctx.storage.getAlarm()) === null) await this.ctx.storage.setAlarm(Date.now() + SWEEP_MS);
  }
  // Ends long or idle sessions and deletes expired ticket IDs; reschedules only while something remains.
  async alarm() {
    const now = Date.now();
    for (const socket of this.ctx.getWebSockets()) {
      const m = socket.deserializeAttachment() || {};
      if (now - (m.joinedAt || 0) > SESSION_MAX_MS) { try { socket.close(1000, 'session_limit'); } catch {} }
      else if (now - (m.lastSeen || m.joinedAt || 0) > IDLE_MAX_MS) { try { socket.close(1000, 'idle'); } catch {} }
    }
    this.ctx.storage.sql.exec('DELETE FROM tickets WHERE expiry < ?', now);
    const left = [...this.ctx.storage.sql.exec('SELECT COUNT(*) AS n FROM tickets')][0]?.n || 0;
    if (left > 0 || this.ctx.getWebSockets().length > 0) await this.ctx.storage.setAlarm(now + SWEEP_MS);
    else this.broadcast(null);
  }
  webSocketClose(socket, code) { try { socket.close(code===1000?1000:1001, 'left'); } catch {} this.broadcast(null); }
  webSocketError(socket) { try { socket.close(1011, 'connection_error'); } catch {} this.broadcast(null); }
}
