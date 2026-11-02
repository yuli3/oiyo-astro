import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../../i18n';
import { sanctuaryCopy } from './copy';
import '../../styles/sanctuary.css';

type Scene = 'temple' | 'fire' | 'water';
type Status = 'solo' | 'connecting' | 'connected' | 'offline' | 'unavailable';
type Member = {id:string;seat:number};
type Gesture = 'greet' | 'bow' | 'petal';
const SCENES: Scene[] = ['temple','fire','water'];
const SYMBOLS = {greet:'👋',bow:'🙏',petal:'🌸'};
const PROTOCOL = 'oiyo-sanctuary-v1';

export default function Sanctuary({locale}:{locale:Locale}) {
  const t = sanctuaryCopy[locale];
  const [scene,setScene] = useState<Scene>('temple');
  const [together,setTogether] = useState(false);
  const [room,setRoom] = useState(0);
  const [hidden,setHidden] = useState(false);
  const [status,setStatus] = useState<Status>('solo');
  const [members,setMembers] = useState<Member[]>([]);
  const [self,setSelf] = useState('');
  const [reaction,setReaction] = useState<{member:string;gesture:Gesture;id:string}|null>(null);
  const [message,setMessage] = useState('');
  const [retry,setRetry] = useState(0);
  const [sound,setSound] = useState(false);
  const socket = useRef<WebSocket|null>(null);
  const audio = useRef<AudioContext|null>(null);
  const recent = useRef(new Set<string>());
  const lastAction = useRef(0);

  useEffect(()=>{
    setMembers([]);setSelf('');setReaction(null);setMessage('');recent.current.clear();
    if (!together) {setStatus('solo');return;}
    const endpoint = import.meta.env.PUBLIC_SANCTUARY_ENDPOINT || (['localhost','127.0.0.1'].includes(location.hostname) ? 'http://127.0.0.1:8791' : '');
    if (!endpoint) {setStatus('unavailable');return;}
    let disposed=false;
    let timer:ReturnType<typeof setTimeout>|undefined;
    let failures=0;
    const abort = new AbortController();
    async function connect() {
      if(disposed)return;
      setStatus('connecting');setMembers([]);setSelf('');
      try {
        const session = new URL('/session',endpoint);
        session.searchParams.set('scene',scene);session.searchParams.set('room',String(room));
        const result = await fetch(session,{method:'POST',credentials:'omit',signal:AbortSignal.any([abort.signal, AbortSignal.timeout(8000)])});
        if(!result.ok) throw new Error('session');
        const data = await result.json();
        if(disposed)return;
        const url = new URL('/connect',endpoint);url.protocol=url.protocol==='https:'?'wss:':'ws:';
        const ws = new WebSocket(url,[PROTOCOL,`ticket.${data.ticket}`]);
        socket.current=ws;
        ws.onmessage = event=>{
          if(disposed || socket.current!==ws)return;
          try {
            const m=JSON.parse(event.data);
            if(m.v!==1)return;
            if(m.type==='welcome'){setSelf(m.self);setStatus('connected');failures=0;}
            if(m.type==='snapshot'){
              setMembers(m.members);
              if(m.event && !recent.current.has(m.event.id)){
                recent.current.add(m.event.id);
                if(recent.current.size>100)recent.current.delete(recent.current.values().next().value!);
                setReaction(m.event);
              }
            }
            if(m.type==='error')setMessage(m.code==='occupied'?t.occupied:t.cooldown);
          } catch {setMessage(t.cooldown);}
        };
        ws.onclose=()=>{
          if(disposed || socket.current!==ws)return;
          socket.current=null;setMembers([]);setSelf('');setReaction(null);setStatus('offline');
          if(failures++<3)timer=setTimeout(connect,Math.min(8000,1000*2**failures));
        };
        ws.onerror=()=>{ if(!disposed)setStatus('offline'); };
      } catch {
        if(!disposed){setStatus('offline');if(failures++<3)timer=setTimeout(connect,Math.min(8000,1000*2**failures));}
      }
    }
    void connect();
    return ()=>{disposed=true;abort.abort();if(timer)clearTimeout(timer);socket.current?.close(1000,'leaving');socket.current=null;};
  },[together,scene,room,retry,t]);

  useEffect(()=>{
    if(!reaction)return;
    const timer=setTimeout(()=>setReaction(null),2200);
    return ()=>clearTimeout(timer);
  },[reaction]);
  useEffect(()=>()=>{void audio.current?.close();},[]);

  function act(type:'gesture'|'seat',value:Gesture|number) {
    if(Date.now()-lastAction.current<750){setMessage(t.cooldown);return;}
    lastAction.current=Date.now();setMessage('');
    const id=crypto.randomUUID();
    if(together){
      if(socket.current?.readyState!==WebSocket.OPEN || status!=='connected')return;
      socket.current.send(JSON.stringify(type==='gesture'?{id,type,gesture:value}:{id,type,seat:value}));
    } else if(type==='gesture')setReaction({id,member:'solo',gesture:value as Gesture});
  }
  async function toggleSound() {
    if(sound){setSound(false);await audio.current?.suspend();return;}
    try {audio.current??=new AudioContext();await audio.current.resume();setSound(true);} catch {setSound(false);}
  }
  function tap() {
    const ctx=audio.current;
    if(!sound || !ctx || ctx.state!=='running')return;
    // 2026-11-02: a local synthesis preview; no claim that this is an authentic moktak recording.
    const now=ctx.currentTime;
    for(const [frequency,level] of [[510,0.05],[980,0.025]]){
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.type='sine';osc.frequency.value=frequency;
      gain.gain.setValueAtTime(level,now);gain.gain.exponentialRampToValueAtTime(0.0001,now+0.45);
      osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+0.46);
    }
  }
  const visible=hidden?members.filter(m=>m.id===self):members;
  return <div data-sanctuary="" data-scene={scene}>
    <div data-part="landscape" aria-hidden="true" />
    <div data-part="veil" aria-hidden="true" />
    <main data-part="shell">
      <header data-part="heading">
        <a href={`/${locale}/`} data-part="home">← {t.back}</a>
        <p data-part="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.lead}</p>
      </header>
      <nav data-part="switch" aria-label={t.eyebrow}>
        {SCENES.map((value,i)=><button key={value} type="button" aria-pressed={scene===value} onClick={()=>setScene(value)}>{t.scenes[i]}</button>)}
      </nav>
      <section data-part="space" aria-label={t.scenes[SCENES.indexOf(scene)]}>
        {scene==='fire'&&<div data-part="fire" aria-hidden="true"><span>✦</span><span>✦</span><span>✦</span></div>}
        {scene==='water'&&<div data-part="ripples" aria-hidden="true">◯<span>◯</span></div>}
        <p data-part="scene-note">{scene==='fire'?t.firedesc:scene==='water'?t.waterdesc:''}</p>
        <div data-part="seats" aria-label={t.seat}>
          {Array.from({length:12},(_,seat)=>{
            const member=visible.find(m=>m.seat===seat);
            const isSelf=together?member?.id===self:seat===5;
            const occupied=!!member || isSelf;
            const currentReaction=reaction && (together?reaction.member===member?.id:seat===5);
            return <button type="button" key={seat} data-part="seat" data-occupied={occupied} disabled={!together || status!=='connected' || !!members.find(m=>m.seat===seat)} aria-label={`${t.seat} ${seat+1}: ${isSelf?t.self:member?t.guest:t.empty}`} onClick={()=>act('seat',seat)}>
              {occupied?<><span data-part="chestnut" aria-hidden="true">●<i>• •</i><b>⌣</b></span><small>{isSelf?t.self:t.guest}</small></>:<><span aria-hidden="true">·</span><small>{t.sit}</small></>}
              {currentReaction&&<span data-part="reaction" role="img" aria-label={t[reaction.gesture]}>{SYMBOLS[reaction.gesture]}</span>}
            </button>;
          })}
        </div>
      </section>
      <section data-part="panel" aria-label={t.together}>
        <div data-part="mode">
          <button type="button" aria-pressed={!together} onClick={()=>setTogether(false)}>{t.solo}</button>
          <button type="button" aria-pressed={together} onClick={()=>setTogether(true)}>{t.together}</button>
          {together&&<label>{t.room} <select value={room} onChange={e=>setRoom(Number(e.target.value))}>{Array.from({length:8},(_,n)=><option key={n} value={n}>{n+1}</option>)}</select></label>}
        </div>
        <p data-part="status" role="status" data-status={status}>{t.statuses[status]} {status==='connected'&&<strong>{t.count}: {members.length}</strong>}</p>
        {(status==='offline'||status==='unavailable')&&<button type="button" onClick={()=>setRetry(n=>n+1)}>{t.retry}</button>}
        <div data-part="actions">
          {(['greet','bow','petal'] as const).map(gesture=><button key={gesture} type="button" disabled={together&&status!=='connected'} onClick={()=>act('gesture',gesture)}><span aria-hidden="true">{SYMBOLS[gesture]}</span> {t[gesture]}</button>)}
          {together&&<button type="button" aria-pressed={hidden} onClick={()=>setHidden(!hidden)}>{hidden?t.show:t.hide}</button>}
        </div>
        <p>{t.help}</p><p role="status">{message}</p>
        <div data-part="sound"><button type="button" aria-pressed={sound} onClick={()=>void toggleSound()}>{sound?t.soundOff:t.soundOn}</button><button type="button" disabled={!sound} onClick={tap}>{t.tap}</button><small>{t.soundNote}</small></div>
      </section>
      <footer data-part="footnote"><p>{t.notice}</p><p>{t.privacy}</p><p>{t.art}</p></footer>
    </main>
  </div>;
}
