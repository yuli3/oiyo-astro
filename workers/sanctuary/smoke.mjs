// Real local HTTP + RFC6455 checks; no Cloudflare account or paid calls.
import assert from 'node:assert/strict';
import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { PROTOCOL } from './protocol.mjs';
const base=process.env.SANCTUARY_TEST_URL || 'http://127.0.0.1:8791';
const origin='http://127.0.0.1:4329';
let checks=0;
const clients=[];
const check=(value,note)=>{assert.ok(value,note);checks++;};
async function session(room='6',scene='temple'){
  const r=await fetch(`${base}/session?scene=${scene}&room=${room}`,{method:'POST',headers:{Origin:origin}});
  assert.equal(r.status,200);return (await r.json()).ticket;
}
function connect(ticket){
  return new Promise((resolve,reject)=>{
    const req=http.request(`${base}/connect`,{headers:{Origin:origin,Connection:'Upgrade',Upgrade:'websocket','Sec-WebSocket-Version':'13','Sec-WebSocket-Key':randomBytes(16).toString('base64'),'Sec-WebSocket-Protocol':`${PROTOCOL}, ticket.${ticket}`}});
    req.on('response',r=>{r.resume();reject(new Error(`status:${r.statusCode}`));});
    req.on('error',reject);
    req.on('upgrade',(r,socket,head)=>{
      const c=new EventEmitter();c.messages=[];c.socket=socket;clients.push(c);
      let buffer=Buffer.alloc(0);
      function parse(chunk){
        buffer=Buffer.concat([buffer,chunk]);
        while(buffer.length>=2){
          let length=buffer[1]&127,offset=2;
          if(length===126){if(buffer.length<4)return;length=buffer.readUInt16BE(2);offset=4;}
          if(length===127){if(buffer.length<10)return;length=Number(buffer.readBigUInt64BE(2));offset=10;}
          assert.ok(length<65536,'bounded test frame');
          if(buffer.length<offset+length)return;
          const opcode=buffer[0]&15,payload=buffer.subarray(offset,offset+length);buffer=buffer.subarray(offset+length);
          if(opcode===1){const m=JSON.parse(payload.toString());c.messages.push(m);c.emit('message',m);}
          if(opcode===8){socket.destroy();c.emit('closed');}
        }
      }
      c.send=m=>{
        const payload=Buffer.from(JSON.stringify(m));assert.ok(payload.length<126);
        const mask=randomBytes(4),header=Buffer.from([0x81,0x80|payload.length]);
        const masked=Buffer.from(payload);for(let i=0;i<masked.length;i++)masked[i]^=mask[i%4];
        socket.write(Buffer.concat([header,mask,masked]));
      };
      c.wait=predicate=>{
        const existing=c.messages.find(predicate);if(existing)return Promise.resolve(existing);
        return new Promise((yes,no)=>{const timer=setTimeout(()=>{c.off('message',listener);no(new Error('message timeout'));},3000);function listener(m){if(predicate(m)){clearTimeout(timer);c.off('message',listener);yes(m);}}c.on('message',listener);});
      };
      socket.on('data',parse);socket.on('error',()=>{});parse(head);resolve(c);
    });req.end();
  });
}
try{
  check((await fetch(`${base}/session?scene=temple&room=0`,{method:'POST',headers:{Origin:'https://untrusted.invalid'}})).status===403,'foreign origin rejected');
  check((await fetch(`${base}/session?scene=temple&room=8`,{method:'POST',headers:{Origin:origin}})).status===400,'invalid room rejected');
  check((await fetch(`${base}/session?scene=temple&room=0`,{method:'POST',headers:{Origin:origin},body:'private text'})).status===400,'request body rejected');
  const token=await session(),a=await connect(token),b=await connect(await session()),other=await connect(await session('7'));
  const aw=await a.wait(m=>m.type==='welcome'),bw=await b.wait(m=>m.type==='welcome');
  check(aw.self!==bw.self,'server assigns separate identities');
  check((await a.wait(m=>m.type==='snapshot'&&m.members.length===2)).members.length===2,'same-room presence');
  check((await other.wait(m=>m.type==='snapshot')).members.length===1,'other room isolated');
  a.send({id:'first',type:'gesture',gesture:'bow'});
  check((await b.wait(m=>m.event?.id==='first')).event.member===aw.self,'gesture reaches peer');
  check(!other.messages.some(m=>m.event?.id==='first'),'gesture not sent to other room');
  a.send({id:'second',type:'gesture',gesture:'bow'});
  check((await a.wait(m=>m.type==='error')).code==='slow_down','rapid input throttled');
  await assert.rejects(connect(token),/status:401/);checks++;
  await assert.rejects(connect(`${token}broken`),/status:401/);checks++;
  const fill=[];for(let i=0;i<10;i++)fill.push(await connect(await session()));
  check((await b.wait(m=>m.type==='snapshot'&&m.members.length===12)).members.length===12,'capacity reached');
  await assert.rejects(connect(await session()),/status:409/);checks++;
  fill[0].socket.destroy();
  await b.wait(m=>m.type==='snapshot'&&m.members.length===11);
  const replacement=await connect(await session());
  check((await replacement.wait(m=>m.type==='snapshot')).members.length===12,'seat reclaimed after disconnect');
  console.log(JSON.stringify({status:'PASS',checks,transport:'real local HTTP/WebSocket',base}));
} finally {for(const c of clients)c.socket.destroy();}
