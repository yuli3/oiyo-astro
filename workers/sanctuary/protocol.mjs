export const SCENES = ['temple', 'fire', 'water'];
export const GESTURES = ['greet', 'bow', 'petal'];
export const CAPACITY = 12;
export const PROTOCOL = 'oiyo-sanctuary-v1';
export const ROOM_COUNT = 8;

export function validRoom(scene, room) {
  return SCENES.includes(scene) && /^[0-7]$/.test(String(room));
}
export function parseAction(raw) {
  if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > 256) return null;
  let m;
  try { m = JSON.parse(raw); } catch { return null; }
  if (!m || typeof m !== 'object' || Array.isArray(m)) return null;
  if (typeof m.id !== 'string' || !/^[a-zA-Z0-9-]{1,64}$/.test(m.id)) return null;
  if (m.type === 'gesture' && GESTURES.includes(m.gesture) && Object.keys(m).length === 3) return m;
  if (m.type === 'seat' && Number.isInteger(m.seat) && m.seat >= 0 && m.seat < CAPACITY && Object.keys(m).length === 3) return m;
  return null;
}
export function chooseSeat(members, preferred) {
  const occupied = new Set(members.map(m => m.seat));
  if (Number.isInteger(preferred) && preferred >= 0 && preferred < CAPACITY && !occupied.has(preferred)) return preferred;
  for (let seat = 0; seat < CAPACITY; seat++) if (!occupied.has(seat)) return seat;
  return -1;
}
export function applyAction(member, members, action, now) {
  if (!action) return { error: 'invalid' };
  if (member.recent.includes(action.id)) return { duplicate: true };
  if (now - member.lastAction < 700) return { error: 'slow_down' };
  if (action.type === 'seat' && members.some(m => m.id !== member.id && m.seat === action.seat)) return { error: 'occupied' };
  const next = { ...member, lastAction: now, recent: [...member.recent, action.id].slice(-20) };
  if (action.type === 'seat') next.seat = action.seat;
  return { member: next };
}
export function publicMembers(members) {
  return members.map(({ id, seat }) => ({ id, seat }));
}
