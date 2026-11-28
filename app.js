/* FinTerim / GünTerim ortak uygulama kodu */
{
const A=window.APP;
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=s=>String(s).toLocaleLowerCase('tr').replace(/ı/g,'i').normalize('NFD').replace(/[̀-ͯ]/g,'');
const LV=['A1','A2','B1','B2','C1','C2'];
const LVN={A1:'Başlangıç',A2:'Temel',B1:'Orta',B2:'Orta üstü',C1:'İleri',C2:'Uzman'};
const DAY=864e5,INT=[0,DAY,3*DAY,7*DAY,16*DAY,35*DAY,90*DAY];
const TRL={on:'Açık',tap:'Dokununca',off:'Kapalı',auto:'Seviyeye göre'},TRO=['on','tap','off','auto'];
/* conjunction notes, shown under functional groups */
const CJ={'if':'Eğer / -se. Gerçek koşul: if + şimdiki zaman, will. Varsayım: if + geçmiş zaman, would.','unless':'-medikçe / -mezse (= if … not). Ardından ayrıca olumsuz yapı gelmez.','as long as':'-dığı sürece / şartıyla.',
'when':'-dığında. Gelecekten söz ederken bile ardından şimdiki zaman gelir: "when I get home".','while':'-iken (aynı anda) ya da "oysa, -mekle birlikte" (karşıtlık).','whenever':'Her ne zaman … -se.','until':'-e kadar. "not … until" = ancak … -ince.','till':'until ile aynı; daha gündelik.','as soon as':'-er -mez. Ardından şimdiki zaman: "as soon as I get…".','once':'-dıktan sonra / bir kez … -ince.','before':'-meden önce. "before + -ing" de olur.','after':'-dıktan sonra. "after + -ing" de olur.','since':'-den beri (zaman) ya da -dığı için / -dığına göre (sebep).',
'because':'Çünkü / -dığı için. "because of" + isim.','as':'-dığı gibi (as I said), -dığı için (as it was late), -dikçe.','however':'Ancak / bununla birlikte. "However + sıfat" = ne kadar … olursa olsun.','although':'-e rağmen / -dığı halde. Cümle sonunda "though" daha gündelik.','even though':'-diği halde; although\'dan güçlü. "even if" (olsa bile) ile karıştırmayın.','whereas':'Oysa (karşıtlık).','so that':'-sın diye / -ebilmek için; genelde can, could ile.','in case':'Olur diye (önceden tedbir); "in case of" + isim.'};
const FN={cond:['if','unless','as long as'],tlink:['when','while','whenever','until','till','as soon as','once','before','after','since'],why:['because','since','as'],contr:['however','although','even though','whereas','while'],purp:['so that','in case'],ref:['as']};
const fnKey=c=>{const m=/^[fk]_(cond|tlink|why|contr|purp|ref)$/.exec(c);return m?m[1]:null};

/* ---------- section maps ---------- */
const SEC={t:A.tSec,p:A.pSec};
const g2s={t:{},p:{}};['t','p'].forEach(k=>SEC[k].forEach(([s,,gs])=>gs.forEach(g=>g2s[k][g]=s)));
const secName=(k,s)=>(SEC[k].find(z=>z[0]===s)||[0,''])[1];
const lab=c=>A.labels[c]||c;

/* ---------- storage ---------- */
const store={get(k,d){try{const v=localStorage.getItem(A.store+'.'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(A.store+'.'+k,JSON.stringify(v))}catch(e){}}};
const firstSec=k=>SEC[k][0][0];
const S={tab:store.get('tab','t'),dir:store.get('dir','en'),acc:store.get('acc','en-GB'),showUS:store.get('showUS',true),rate:store.get('rate',1),q:'',limit:80,
 f:Object.assign({t:{sec:firstSec('t'),grp:'all',lv:[],fav:false},p:{sec:firstSec('p'),grp:'all',lv:[],fav:false}},store.get('f',{})),
 favs:new Set(store.get('favs',[])),hard:new Set(store.get('hard',[])),pron:store.get('pron',{}),hw:store.get('hw',{}),srs:store.get('srs',{}),
 trm:store.get('trm',{}),trDef:store.get('trDef',null),newLimit:store.get('newLimit',20),newDay:store.get('newDay',{d:'',n:0}),listenFirst:store.get('listenFirst',true),free:false,
 deck:Object.assign({src:'t',sec:'all',grp:'all',lv:[]},store.get('deck',{})),
 L:Object.assign({mode:'normal',order:'en-tr',rep:1,gap:2,rate:0.9,shuffle:false,loop:true,sf:1.5,replay:true,trAfter:false},store.get('L',{})),recOK:store.get('recOK',true),rev:new Set()};
['t','p'].forEach(k=>{if(!SEC[k].some(z=>z[0]===S.f[k].sec))S.f[k]={sec:firstSec(k),grp:'all',lv:[],fav:false}});
if(S.deck.src==='t'||S.deck.src==='p'){const ss=SEC[S.deck.src];if(S.deck.sec!=='all'&&!ss.some(z=>z[0]===S.deck.sec))S.deck.sec='all';if(S.deck.grp!=='all'&&!g2s[S.deck.src][S.deck.grp])S.deck.grp='all'}
let TERMS=[],PHR=[],ALL=[],BY={};
const save=()=>{store.set('favs',[...S.favs]);store.set('hard',[...S.hard]);store.set('pron',S.pron);store.set('hw',S.hw);store.set('srs',S.srs);store.set('newDay',S.newDay)};
let tt;const toast=m=>{const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),1700)};
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const today=()=>new Date().toISOString().slice(0,10);

const parse=(txt,k)=>{let c='';const out=[];txt.split('\n').forEach(l=>{l=l.trim();if(!l)return;if(l[0]==='#'){c=l.slice(1).trim();return}const f=l.split('|');if(f.length<3)return;
 const x={k,c,lv:f[0].trim(),en:f[1].trim(),tr:f[2].trim(),us:(f[3]||'').trim(),alt:(f[4]||'').trim(),tag:(f[5]||'').trim()};x.id=k+':'+c+':'+x.en;x.n=norm([x.en,x.tr,x.us,x.alt].join(' '));out.push(x)});return out};
const secOf=x=>g2s[x.k][x.c];
const enOf=x=>S.acc==='en-US'&&x.us?x.us:x.en;
const trSpeak=x=>x.tr.split('·')[0].replace(/\(\d+(–\d+)?\)/g,'').trim();

/* ---------- translation visibility ---------- */
const trmOf=scr=>S.trm[scr]||S.trDef||A.tr[scr]||'tap';
const vis=(x,scr)=>{if(S.rev.has(scr+'|'+x.id))return'on';let m=trmOf(scr);if(m==='auto')m=x.lv[0]==='A'?'on':x.lv[0]==='B'?'tap':'off';return m};
const trChip=scr=>`<button class="chip trc" data-trm="${scr}" aria-label="Çeviri gösterimi">${S.dir==='en'?'Türkçe':'İngilizce'}: <b>${TRL[trmOf(scr)]}</b></button>`;
const revealLbl=()=>S.dir==='en'?'Türkçesini göster':'İngilizcesini göster';

/* ---------- speech ---------- */
const synth=window.speechSynthesis;
let voices=[];const loadV=()=>{try{voices=synth.getVoices()}catch(e){}};if(synth){loadV();try{synth.onvoiceschanged=loadV}catch(e){}}
const pickV=lang=>{const L=lang.toLowerCase(),b=L.slice(0,2);const m=v=>v.lang.replace('_','-').toLowerCase();return voices.find(v=>m(v)===L&&/enhanced|premium|natural|google/i.test(v.name))||voices.find(v=>m(v)===L)||voices.find(v=>m(v).startsWith(b))};
const keepU=[];const pad=t=>{t=String(t).trim();return /[.!?…:;]$/.test(t)?t:t+'.'};
const say=(text,lang,rate)=>new Promise(res=>{if(!synth||!text){setTimeout(res,300);return}let done=false,u=null,iv=null,hard=null;
 const fin=()=>{if(done)return;done=true;clearTimeout(to);clearInterval(iv);clearTimeout(hard);const i=keepU.indexOf(u);if(i>-1)keepU.splice(i,1);setTimeout(res,450)};
 const est=2500+String(text).length*140/(rate||1);
 const to=setTimeout(()=>{iv=setInterval(()=>{try{if(!synth.speaking&&!synth.pending)fin()}catch(e){fin()}},250);hard=setTimeout(fin,est)},est);
 try{u=new SpeechSynthesisUtterance(pad(text));u.lang=lang;u.rate=rate||1;const v=pickV(lang);if(v)u.voice=v;u.onend=fin;u.onerror=fin;keepU.push(u);synth.speak(u)}catch(e){fin()}});
const speakNow=(text,lang,rate)=>{if(!synth){toast('Bu cihazda sesli okuma yok');return}try{synth.cancel()}catch(e){}say(text,lang,rate)};
const wait=ms=>new Promise(r=>setTimeout(r,ms));

/* ---------- lists ---------- */
const sortLv=(a,b)=>LV.indexOf(a.lv)-LV.indexOf(b.lv);
const listFor=k=>{const f=S.f[k];const base=k==='t'?TERMS:PHR;const q=norm(S.q.trim());let L=q?base:base.filter(x=>secOf(x)===f.sec);
 if(!q&&f.grp!=='all')L=L.filter(x=>x.c===f.grp);if(f.lv.length)L=L.filter(x=>f.lv.includes(x.lv));if(f.fav)L=L.filter(x=>S.favs.has(x.id));
 const key=S.dir==='en'?'en':'tr';
 if(q){L=L.filter(x=>x.n.includes(q));L.sort((a,b)=>(norm(b[key]).startsWith(q)?1:0)-(norm(a[key]).startsWith(q)?1:0)||sortLv(a,b))}
 else if(k==='t')L=[...L].sort((a,b)=>sortLv(a,b)||a[key].localeCompare(b[key],key==='tr'?'tr':'en'));
 else L=[...L].sort(sortLv);
 return L};
const deckBase=()=>{const d=S.deck;let L=d.src==='t'?TERMS:d.src==='p'?PHR:d.src==='f'?ALL.filter(x=>S.favs.has(x.id)):ALL.filter(x=>S.hard.has(x.id));
 if(d.src==='t'||d.src==='p'){if(d.sec!=='all')L=L.filter(x=>secOf(x)===d.sec);if(d.grp!=='all')L=L.filter(x=>x.c===d.grp)}return L};
const deckList=()=>{const d=S.deck;let L=deckBase();if(d.lv.length)L=L.filter(x=>d.lv.includes(x.lv));return [...L].sort(sortLv)};

const I={spk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>',
slow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/></svg>',
mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/></svg>',
cp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/></svg>',
st:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>',pause:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
prev:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',next:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>',
moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>',
car:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18v3H3z"/><circle cx="7.5" cy="19" r="1.5"/><circle cx="16.5" cy="19" r="1.5"/><path d="M5 11h14"/></svg>',
ear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9a6 6 0 1 1 12 0c0 3-2 4-3 5.5S14 18 12.5 19.5 9 20 8 18"/><path d="M9.5 9a2.5 2.5 0 1 1 5 0c0 1.5-1.5 2-1.5 3"/></svg>'};

const dstHTML=(x,scr,cls)=>{const dst=S.dir==='en'?x.tr:x.en,v=vis(x,scr);
 if(v==='on')return `<div class="${cls||'dst'}" lang="${S.dir==='en'?'tr':'en'}">${esc(dst)}</div>`;
 if(v==='tap')return `<button class="reveal" data-a="rv" data-scr="${scr}" data-id="${esc(x.id)}">${revealLbl()}</button>`;return ''};
const card=x=>{const scr=S.tab;const src=S.dir==='en'?x.en:x.tr,f=S.favs.has(x.id),b=S.pron[x.id];const v=vis(x,scr);const showEnExtras=S.dir==='en'||v==='on';
 return `<article class="card"><div class="ctop"><span class="lv lv-${x.lv}">${x.lv}</span><span>${esc(lab(x.c))}</span>${x.tag?`<span class="ctag">${esc(x.tag)}</span>`:''}${b!=null?`<span class="best" title="En iyi telaffuz puanı">%${b}</span>`:''}</div>
<div class="src" lang="${S.dir}" data-a="rv" data-scr="${scr}" data-id="${esc(x.id)}">${esc(src)}</div>${dstHTML(x,scr)}
${showEnExtras&&S.showUS&&x.us?`<div class="us" lang="en-US"><b>US</b>${esc(x.us)}</div>`:''}${showEnExtras&&x.alt?`<div class="alt">eş: ${esc(x.alt)}</div>`:''}
<div class="acts"><button class="ib" data-a="spk" data-id="${esc(x.id)}" aria-label="İngilizce dinle">${I.spk}</button><button class="ib" data-a="slow" data-id="${esc(x.id)}" aria-label="Yavaş dinle">${I.slow}</button><button class="ib" data-a="mic" data-id="${esc(x.id)}" aria-label="Telaffuz çalış">${I.mic}</button><button class="ib" data-a="cp" data-id="${esc(x.id)}" aria-label="Kopyala">${I.cp}</button><button class="ib${f?' on':''}" data-a="fv" data-id="${esc(x.id)}" aria-label="${f?'Favoriden çıkar':'Favoriye ekle'}" aria-pressed="${f}">${I.st}</button></div></article>`};

/* ---------- filters bar ---------- */
const renderFilters=()=>{const k=S.tab,f=S.f[k];const secs=SEC[k];const groups=(secs.find(z=>z[0]===f.sec)||secs[0])[2];
 const secHTML=secs.length<=3?`<div class="seg2" role="group" aria-label="Bölüm">${secs.map(([v,l])=>`<button data-sec="${v}" aria-pressed="${f.sec===v}">${esc(l)}</button>`).join('')}</div>`:
  `<div class="chips secs" role="group" aria-label="Bölüm">${secs.map(([v,l])=>`<button class="chip" data-sec="${v}" aria-pressed="${f.sec===v}">${esc(l)}</button>`).join('')}</div>`;
 $('filters').innerHTML=`${secHTML}
<div class="chips">${['all',...groups].map(g=>`<button class="chip" data-grp="${g}" aria-pressed="${f.grp===g}">${g==='all'?'Tümü':esc(lab(g))}</button>`).join('')}</div>
<div class="chips">${LV.map(l=>`<button class="chip lvc" data-lv="${l}" aria-pressed="${f.lv.includes(l)}">${l}</button>`).join('')}<button class="chip" data-fav="1" aria-pressed="${f.fav}">${I.st}Favoriler</button></div>`;
 $('q').placeholder=A.ph[k]};
let io;
const withHeads=(L,q)=>{if(q)return L.slice(0,S.limit).map(card).join('');const cnt={};L.forEach(x=>cnt[x.lv]=(cnt[x.lv]||0)+1);let last='';return L.slice(0,S.limit).map(x=>{let h='';if(x.lv!==last){last=x.lv;h=`<h3 class="lvh"><span class="lv lv-${x.lv}">${x.lv}</span>${LVN[x.lv]} <small>${cnt[x.lv]}</small></h3>`}return h+card(x)}).join('')};
const noteHTML=g=>{const fk=fnKey(g);if(!fk)return'';const used=new Set(PHR.filter(x=>x.c===g&&x.tag).map(x=>x.tag));const list=FN[fk].filter(c=>used.has(c));if(!list.length)return'';
 return `<details class="gnote"><summary>Dilbilgisi notu (isteğe bağlı)</summary>${list.map(c=>`<p><b>${esc(c)}</b> — ${esc(CJ[c]||'')}</p>`).join('')}</details>`};
const renderList=()=>{const k=S.tab,f=S.f[k];const L=listFor(k);const q=S.q.trim();const unit=k==='t'?'kelime':'cümle';
 const head=!q&&k==='p'&&f.grp!=='all'?noteHTML(f.grp):'';
 const body=L.length?`<div class="list">${withHeads(L,q)}</div>${L.length>S.limit?'<div class="more" id="more"></div>':''}`:
  f.fav?`<div class="empty"><b>Bu filtrede favori yok</b>Kartlardaki yıldıza dokunarak favori ekleyin.</div>`:`<div class="empty"><b>Sonuç bulunamadı</b>Farklı bir yazım deneyin; Türkçe karakter gerekmez (ör. "sirket").</div>`;
 $('view').innerHTML=`${head}<div class="meta"><span>${L.length} ${unit}${q?' · tüm bölümlerde':''}</span>${trChip(k)}</div>${body}`;
 if(io)io.disconnect();const m=$('more');if(m&&'IntersectionObserver' in window){io=new IntersectionObserver(e=>{if(e[0].isIntersecting){S.limit+=80;renderList()}},{rootMargin:'600px'});io.observe(m)}};

/* ---------- deck picker ---------- */
const deckHTML=scr=>{const d=S.deck;const tp=d.src==='t'||d.src==='p';const secs=tp?SEC[d.src]:[];
 const og=tp?secs.filter(([s])=>d.sec==='all'||d.sec===s):[];
 const secCtl=!tp?'':secs.length<=2?`<div class="seg2 dsec" role="group" aria-label="Ana grup">${[['all','Tümü'],...secs].map(([k,v])=>`<button data-dsec="${k}" aria-pressed="${d.sec===k}">${esc(v)}</button>`).join('')}</div>`:
  `<label class="sel"><span>Ana grup</span><select id="dsec"><option value="all">Tümü</option>${secs.map(([k,v])=>`<option value="${k}"${d.sec===k?' selected':''}>${esc(v)}</option>`).join('')}</select></label>`;
 return `<div class="deck"><div class="seg2" role="group" aria-label="Kaynak">${[['t','Sözlük'],['p','Kalıplar'],['f','Favoriler'],['h','Zor kartlar']].map(([k,v])=>`<button data-dsrc="${k}" aria-pressed="${d.src===k}">${v}</button>`).join('')}</div>
${secCtl}${tp?`<label class="sel"><span>Alt grup</span><select id="dgrp"><option value="all">${d.sec==='all'?'Tümü':'Tümü ('+esc(secName(d.src,d.sec))+')'}</option>${og.map(([,n,gs])=>`<optgroup label="${esc(n)}">${gs.map(g=>`<option value="${g}"${d.grp===g?' selected':''}>${esc(lab(g))}</option>`).join('')}</optgroup>`).join('')}</select></label>`:''}
<div class="chips">${LV.map(l=>`<button class="chip lvc" data-dlv="${l}" aria-pressed="${d.lv.includes(l)}">${l}</button>`).join('')}</div><div class="cnt"><span id="dcnt">${deckList().length} kart</span>${trChip(scr)}</div></div>`};

/* ---------- study with spaced repetition ---------- */
let cur=null,stage=0;
const isNew=x=>!S.srs[x.id];
const newLeft=()=>{if(S.newDay.d!==today())S.newDay={d:today(),n:0};return S.newLimit?Math.max(0,S.newLimit-S.newDay.n):Infinity};
const srsCounts=()=>{const L=deckList(),now=Date.now();let due=0,nw=0,lrn=0;L.forEach(x=>{const s=S.srs[x.id];if(!s)nw++;else if(s.b===0)lrn++;else if(s.d<=now)due++});return{due,nw,lrn}};
const pick=()=>{const L=deckList(),now=Date.now();let c=null;
 const due=L.filter(x=>{const s=S.srs[x.id];return s&&s.b>0&&s.d<=now&&x!==cur}).sort((a,b)=>S.srs[a.id].d-S.srs[b.id].d);
 const lrnDue=L.filter(x=>{const s=S.srs[x.id];return s&&s.b===0&&s.d<=now&&x!==cur});
 if(lrnDue.length)c=lrnDue[0];else if(due.length)c=due[0];
 else if(newLeft()>0){const nw=L.filter(x=>isNew(x)&&x!==cur);if(nw.length)c=nw[Math.floor(Math.random()*Math.min(8,nw.length))]}
 if(!c){const lrn=L.filter(x=>{const s=S.srs[x.id];return s&&s.b===0&&x!==cur});if(lrn.length)c=lrn[0]}
 if(!c&&S.free&&L.length)c=L.filter(x=>x!==cur)[Math.floor(Math.random()*Math.max(1,L.length-1))]||L[0];
 cur=c;stage=(S.listenFirst&&S.dir==='en')?0:1;S.rev.delete('s|'+(c&&c.id))};
const grade=ok=>{if(!cur)return;const now=Date.now(),s=S.srs[cur.id];if(!s){S.newDay.n++}
 if(ok){const b=s?Math.min((s.b||0)+1,6):2;S.srs[cur.id]={b,d:now+INT[b]};S.hard.delete(cur.id)}else{S.srs[cur.id]={b:0,d:now+5*60e3};S.hard.add(cur.id)}save()};
const autoSpeak=()=>{if(cur&&stage===0)speakNow(enOf(cur),S.acc,S.rate)};
const progHTML=()=>{const d=S.deck;if(d.src!=='t'&&d.src!=='p')return'';const L=deckBase();
 return `<div class="prog"><h3>Öğrenilenler (seviyeye göre)</h3>${LV.map(l=>{const a=L.filter(x=>x.lv===l);if(!a.length)return'';const k=a.filter(x=>S.srs[x.id]&&S.srs[x.id].b>=2).length;return `<div class="pr"><b>${l}</b><span class="t"><i style="width:${Math.round(k/a.length*100)}%"></i></span><span>${k} / ${a.length}</span></div>`}).join('')}</div>`};
const renderStudy=()=>{if(!cur||!deckList().includes(cur))pick();const x=cur;const c=srsCounts();const nl=newLeft();
 const info=`<div class="srs"><span>Tekrar: <b>${c.due}</b></span><span>Öğreniliyor: <b>${c.lrn}</b></span><span>Yeni: <b>${c.nw}</b>${S.newLimit?` (bugün kalan ${nl})`:''}</span></div>`;
 let body;
 if(!x){body=`<div class="empty"><b>${deckList().length?'Bugünlük tekrarlar tamam':'Bu destede kart yok'}</b>${deckList().length?'Aralıklı tekrar sırası gelen kart kalmadı. Yarın yeni kartlar ve tekrarlar gelecek.':'Desteyi veya seviye filtresini değiştirin.'}</div>${deckList().length?'<div class="row"><button class="btn" data-s="free">Serbest çalış (rastgele)</button><button class="btn" data-s="more">+10 yeni kart</button></div>':''}`}
 else{const qText=S.dir==='en'?enOf(x):x.tr;const v=vis(x,'s');const ans=S.dir==='en'?x.tr:enOf(x);
  const top=`<span class="k">${esc(lab(x.c))} · ${x.lv}${isNew(x)?' · yeni':''}${x.tag?' · '+esc(x.tag):''}</span>`;
  const mid=stage===0?`<span class="big">${I.ear}</span><span class="q" style="font-size:20px;color:#a7abb2;margin:0">Dinleyin. Anladınız mı?</span>`:`<span class="q">${esc(qText)}</span>`;
  const bot=stage===0?'<span class="h">Yazıyı görmek için dokunun</span>':stage===1?`<span class="h">${v==='off'?'Çeviri kapalı. Görmek için dokunun':'Anlamını görmek için dokunun'}</span>`:`<span><span class="a">${v==='off'&&!S.rev.has('s|'+x.id)?'':esc(ans)}</span></span>`;
  body=`<button class="flash" id="flip" aria-label="Kartı çevir">${top}${mid}${bot}</button>
<div class="row"><button class="btn" data-s="no">Bilmiyorum</button><button class="btn pri" data-s="ok">Biliyorum</button></div>
<div class="row row3"><button class="btn" data-s="spk">${I.spk}Dinle</button><button class="btn" data-s="slow">${I.slow}Yavaş</button><button class="btn" data-s="mic">${I.mic}Söyle</button></div>`}
 $('view').innerHTML=deckHTML('s')+info+body+progHTML()};

/* ---------- pronunciation ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const R={item:null,busy:false,err:null,res:null,url:null,retried:false};
const NUM={zero:'0',one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',seven:'7',eight:'8',nine:'9',ten:'10',eleven:'11',twelve:'12',fifteen:'15',twenty:'20',thirty:'30',sixty:'60',hundred:'100',mister:'mr',okay:'ok'};
const toks=s=>String(s).toLowerCase().replace(/[’']/g,'').replace(/(\d)[,.](\d)/g,'$1$2').replace(/%/g,' percent').replace(/&/g,' and ').replace(/[^a-z0-9 ]+/g,' ').split(/\s+/).filter(Boolean).map(w=>NUM[w]||w);
const gradeP=alts=>{const tgt=enOf(R.item);const disp=tgt.split(/\s+/).filter(Boolean);const map=[];const T=[];disp.forEach((w,i)=>toks(w).forEach(t=>{T.push(t);map.push(i)}));
 let best=null;alts.forEach(al=>{const B=toks(al);const n=T.length,m=B.length;const D=Array.from({length:n+1},()=>new Array(m+1).fill(0));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)D[i][j]=T[i]===B[j]?D[i+1][j+1]+1:Math.max(D[i+1][j],D[i][j+1]);
  const hit=new Array(n).fill(false);let i=0,j=0;while(i<n&&j<m){if(T[i]===B[j]){hit[i]=true;i++;j++}else if(D[i+1][j]>=D[i][j+1])i++;else j++}
  const sc=n?Math.round(hit.filter(Boolean).length/n*100):0;if(!best||sc>best.sc)best={sc,hit,heard:al}});
 const okW=disp.map((w,i)=>map.every((mi,ti)=>mi!==i||best.hit[ti]));
 R.res={sc:best.sc,heard:best.heard,words:disp.map((w,i)=>({w,ok:okW[i]}))};
 const id=R.item.id;S.pron[id]=Math.max(S.pron[id]||0,best.sc);
 disp.forEach((w,i)=>{if(!okW[i]){const k=toks(w).join(' ');if(k.length>2)S.hw[k]=(S.hw[k]||0)+1}});
 if(best.sc<70)S.hard.add(id);else if(best.sc>=90)S.hard.delete(id);save()};
let rec=null,mr=null,stream=null;
const stopStream=()=>{try{stream&&stream.getTracks().forEach(t=>t.stop())}catch(e){}stream=null};
const listen=async()=>{if(!SR){R.err='nosr';renderPron();return}
 if(R.busy){try{rec&&rec.stop()}catch(e){}return}
 try{synth&&synth.cancel()}catch(e){}
 R.busy=true;R.err=null;R.res=null;renderPron();mr=null;
 if(S.recOK&&window.MediaRecorder&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){try{stream=await navigator.mediaDevices.getUserMedia({audio:true});const ch=[];mr=new MediaRecorder(stream);mr.ondataavailable=e=>{if(e.data&&e.data.size)ch.push(e.data)};mr.onstop=()=>{try{const b=new Blob(ch,{type:mr.mimeType||'audio/mp4'});if(R.url)URL.revokeObjectURL(R.url);R.url=b.size?URL.createObjectURL(b):null}catch(e){R.url=null}stopStream();renderPron()};mr.start()}catch(e){mr=null;stopStream();if(e&&e.name==='NotAllowedError'){R.busy=false;R.err='not-allowed';renderPron();return}}}
 let alts=[];
 try{rec=new SR();rec.lang=S.acc;rec.interimResults=true;rec.maxAlternatives=4;rec.continuous=false}catch(e){R.busy=false;R.err='nosr';renderPron();return}
 rec.onresult=e=>{let it='';for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];if(r.isFinal){alts=Array.from(r).map(a=>a.transcript)}else it+=r[0].transcript}const el=$('live');if(el)el.textContent=it||alts[0]||''};
 rec.onerror=e=>{R.err=e.error;if(e.error==='audio-capture'&&mr){S.recOK=false;store.set('recOK',false)}};
 rec.onend=()=>{R.busy=false;if(mr&&mr.state!=='inactive'){setTimeout(()=>{try{mr.stop()}catch(e){stopStream()}},250)}else stopStream();
  if(alts.length){R.err=null;gradeP(alts)}else if(!R.err)R.err='no-speech';
  if(R.err==='audio-capture'&&!S.recOK&&!R.retried){R.retried=true;R.err=null;renderPron();setTimeout(listen,300);return}
  renderPron()};
 try{rec.start()}catch(e){R.busy=false;R.err='start';stopStream();renderPron()}};
const ERR={'nosr':'Bu tarayıcıda konuşma tanıma yok. iPhone\'da Safari, Android\'de Chrome kullanın; claude.ai önizlemesinde mikrofon kapalıdır.','not-allowed':'Mikrofon izni verilmedi. Tarayıcı ayarlarından bu site için mikrofona izin verin. iPhone\'da ayrıca Ayarlar → Genel → Klavye → Dikte açık olmalı.','service-not-allowed':'Konuşma tanıma hizmeti kullanılamıyor. iPhone\'da Ayarlar → Genel → Klavye → Dikte\'yi açın; internet bağlantısı gerekebilir.','no-speech':'Ses algılanmadı. Mikrofona biraz daha yakın ve net konuşup tekrar deneyin.','network':'Konuşma tanıma için internet bağlantısı gerekiyor.','start':'Mikrofon başlatılamadı. Birkaç saniye sonra tekrar deneyin.','audio-capture':'Mikrofona erişilemedi.','aborted':'Dinleme durduruldu.'};
const pronList=()=>{const L=deckList();if(R.item&&!L.includes(R.item))return [R.item,...L];return L};
const renderPron=()=>{if(S.tab!=='r')return;const L=pronList();if(!R.item||!L.includes(R.item))R.item=L[0]||null;const x=R.item;
 const hw=Object.entries(S.hw).sort((a,b)=>b[1]-a[1]).slice(0,14);const idx=x?L.indexOf(x):-1;
 const msg=r=>r.sc>=90?'Mükemmel. Karşınızdaki rahatça anlar.':r.sc>=70?'İyi. Kırmızı kelimelere dokunup yavaş dinleyin, sonra tekrar deneyin.':r.sc>=40?'Gelişiyor. Önce yavaş dinleyin, cümleyi parça parça söyleyin.':'Tekrar deneyelim: önce yavaş dinleyin, sonra net ve sakin söyleyin.';
 $('view').innerHTML=deckHTML('r')+(x?`<div class="target"><div class="ctop"><span class="lv lv-${x.lv}">${x.lv}</span><span>${esc(lab(x.c))}</span><span class="best">${idx+1} / ${L.length}${S.pron[x.id]!=null?' · en iyi %'+S.pron[x.id]:''}</span></div>
<div class="en" lang="${S.acc}">${esc(enOf(x))}</div>${(()=>{const v=vis(x,'r');return v==='on'?`<div class="tr">${esc(x.tr)}</div>`:v==='tap'?`<button class="reveal" data-a="rv" data-scr="r" data-id="${esc(x.id)}">Türkçesini göster</button>`:''})()}
<div class="row"><button class="btn" data-p="spk">${I.spk}Dinle</button><button class="btn" data-p="slow">${I.slow}Yavaş (0,7x)</button></div>
<button class="mic${R.busy?' live':''}" id="micBtn" aria-label="${R.busy?'Dinlemeyi durdur':'Konuşmaya başla'}">${I.mic}</button>
<div class="micl" id="live">${R.busy?'Dinliyorum… cümleyi söyleyin':'Mikrofona dokunun ve cümleyi söyleyin'}</div></div>
${R.err&&ERR[R.err]?`<div class="warn">${esc(ERR[R.err])}</div>`:''}
${R.res?`<div class="res"><div style="display:flex;align-items:baseline;gap:10px"><span class="score" style="color:${R.res.sc>=70?'var(--ok)':'var(--bad)'}">%${R.res.sc}</span><span>${esc(msg(R.res))}</span></div>
<div class="words">${R.res.words.map(w=>`<button class="w ${w.ok?'ok':'miss'}" data-w="${esc(w.w)}">${esc(w.w)}</button>`).join('')}</div><div class="heard">Duyulan: “${esc(R.res.heard)}”</div>
${R.url?`<div class="row"><button class="btn" data-p="me">${I.play}Sesimi dinle</button><button class="btn" data-p="cmp">${I.spk}Ben + doğrusu</button></div>`:''}</div>`:''}
<div class="row"><button class="btn" data-p="prev">${I.prev}Önceki</button><button class="btn" data-p="next">Sonraki${I.next}</button></div>`:`<div class="empty"><b>Bu destede kart yok</b>Desteyi veya seviye filtresini değiştirin.</div>`)+
 `<div class="box"><h3>Zorlandığınız kelimeler</h3>${hw.length?`<div class="hw">${hw.map(([w,n])=>`<button class="chip" data-w="${esc(w)}">${esc(w)} · ${n}</button>`).join('')}</div><div style="margin-top:8px"><button class="btn" data-p="clrhw" style="min-height:40px">Listeyi temizle</button></div>`:'<p style="margin:0;color:var(--mute);font-size:14px">Telaffuz denemelerinizde tanınmayan kelimeler burada birikir. Dokunarak yavaş dinleyebilirsiniz.</p>'}</div>
${!SR?`<div class="warn">${esc(ERR.nosr)}</div>`:''}`};

/* ---------- listening & shadowing ---------- */
const P={on:false,i:0,list:[],tok:0,dirty:true};let wl=null;
const lock=async()=>{try{if('wakeLock' in navigator&&!wl){wl=await navigator.wakeLock.request('screen');wl.addEventListener('release',()=>{wl=null;updNow()})}}catch(e){wl=null}updNow()};
const unlock=()=>{try{wl&&wl.release()}catch(e){}wl=null};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&P.on)lock()});
const cue=on=>{const c=$('cue');if(c)c.classList.toggle('on',on);const n=$('nCue');if(n)n.style.display=on?'block':'none'};
const updNow=()=>{const x=P.list[P.i];const e=$('nowE'),t=$('nowT'),n=$('nowN'),b=$('pp'),w=$('wl');
 if(e){e.textContent=x?enOf(x):'Hazır';const v=x?vis(x,'l'):'on';
  if(!x){t.textContent='Desteyi seçip başlat düğmesine dokunun';t.className='t'}else if(v==='on'){t.textContent=x.tr;t.className='t'}else{t.textContent=v==='tap'?'Türkçesi gizli · görmek için dokunun':'';t.className='t hid'}
  n.textContent=x?`${P.i+1} / ${P.list.length} · ${lab(x.c)} · ${x.lv}`:`${deckList().length} kart`}
 if(b)b.innerHTML=P.on?I.pause+'Duraklat':I.play+'Başlat';if(w)w.textContent=P.on?(wl?'Ekran açık tutuluyor.':'Bu cihaz ekranı açık tutmayı desteklemiyor olabilir; ekran kilitlenirse çalma durur.'):'';
 $('nE').textContent=x?enOf(x):'';$('nT').textContent=x&&vis(x,'l')==='on'?x.tr:''};
const loop=async t=>{const alive=()=>P.on&&t===P.tok;const L=S.L;
 while(alive()){const x=P.list[P.i];if(!x)break;updNow();
  for(let r=0;r<L.rep&&alive();r++){
   if(L.mode==='shadow'){const t0=Date.now();await say(enOf(x),S.acc,L.rate);if(!alive())return;const dur=Math.max(900,Date.now()-t0-450);
    cue(true);await wait(dur*L.sf+700);cue(false);if(!alive())return;
    if(L.replay){await say(enOf(x),S.acc,L.rate);if(!alive())return}
    if(L.trAfter&&r===L.rep-1){await wait(400);await say(trSpeak(x),'tr-TR',L.rate);if(!alive())return}
    await wait(r<L.rep-1?700:L.gap*1000)}
   else{
    if(L.order==='tr-en'){await say(trSpeak(x),'tr-TR',L.rate);if(!alive())return;await wait(L.gap*1000);if(!alive())return;await say(enOf(x),S.acc,L.rate)}
    else{await say(enOf(x),S.acc,L.rate);if(!alive())return;if(L.order==='en-tr'){await wait(L.gap*1000);if(!alive())return;await say(trSpeak(x),'tr-TR',L.rate)}}
    if(!alive())return;await wait(r<L.rep-1?900:L.gap*1000)}}
  if(!alive())return;P.i++;if(P.i>=P.list.length){if(L.loop){P.i=0;if(L.shuffle)P.list=shuffle(P.list)}else{stop();return}}}};
const start=()=>{if(!P.list.length||P.dirty){P.list=S.L.shuffle?shuffle(deckList()):deckList();P.i=Math.min(P.i,Math.max(0,P.list.length-1));P.dirty=false}
 if(!P.list.length){toast('Bu destede kart yok');return}if(!synth){toast('Bu cihazda sesli okuma yok');return}P.on=true;lock();loop(++P.tok);updNow()};
const stop=()=>{if(driving&&P.on)beep(440,250,2);P.on=false;P.tok++;cue(false);try{synth&&synth.cancel()}catch(e){}unlock();updNow()};
const jump=d=>{const was=P.on;stop();if(!P.list.length)P.list=deckList();if(!P.list.length)return;P.i=(P.i+d+P.list.length)%P.list.length;updNow();if(was)start()};
const segF=(key,opts)=>`<div class="seg2" role="group">${opts.map(([v,l])=>`<button data-lset="${key}" data-v="${v}" aria-pressed="${String(S.L[key])===String(v)}">${l}</button>`).join('')}</div>`;
const renderListen=()=>{const sh=S.L.mode==='shadow';$('view').innerHTML=deckHTML('l')+`<div class="drive"><button class="btn pri big" data-l="drive">${I.car}Sürüş modu</button><button class="btn big" data-l="driveSh">${I.car}Sürüş + Gölge</button></div><p class="fld" style="margin:0 2px 12px">Sürüşe başlamadan önce bir kez dokunun: ayarlar otomatik yapılır, ekran açık kalır ve dokunmaya karşı kilitlenir. Çıkmak için ekrana 2 saniye basılı tutun.</p><div class="deck" style="padding-top:10px">
<div class="fld">Mod${segF('mode',[['normal','Dinleme'],['shadow','Gölge']])}</div>
<p class="fld" style="margin:8px 2px 0">${sh?'Cümle çalar, sonra size söylemeniz için sessiz bir aralık bırakılır. İsterseniz doğrusu bir kez daha çalar.':'Cümleler arka arkaya seslendirilir; arabada ve kulaklıkta dinlemek için.'}</p>
<div class="grid2" style="margin-top:8px">
${sh?`<div class="fld">Tekrar aralığı${segF('sf',[[1.2,'Kısa'],[1.5,'Orta'],[2,'Uzun']])}</div>`:`<div class="fld">Sıra${segF('order',[['en-tr','EN→TR'],['tr-en','TR→EN'],['en','Yalnız EN']])}</div>`}
<div class="fld">Tekrar${segF('rep',[[1,'1'],[2,'2'],[3,'3']])}</div>
<div class="fld">Bekleme${segF('gap',[[1,'1 sn'],[2,'2 sn'],[3,'3 sn'],[5,'5 sn']])}</div>
<div class="fld">Hız${segF('rate',[[0.7,'0,7x'],[0.9,'0,9x'],[1,'1x']])}</div></div>
${sh?`<label class="tg">Doğrusunu tekrar dinlet <input type="checkbox" data-lchk="replay"${S.L.replay?' checked':''}></label><label class="tg">Sonunda Türkçesini seslendir <input type="checkbox" data-lchk="trAfter"${S.L.trAfter?' checked':''}></label>`:''}
<label class="tg">Karıştır <input type="checkbox" data-lchk="shuffle"${S.L.shuffle?' checked':''}></label>
<label class="tg">Bitince başa dön <input type="checkbox" data-lchk="loop"${S.L.loop?' checked':''}></label></div>
<div class="now" id="nowBox"><div class="n" id="nowN"></div><div class="e" id="nowE"></div><div class="t" id="nowT"></div><div class="cue" id="cue">${I.mic}Sıra sizde, tekrar edin</div></div>
<div class="ctl"><button class="btn" data-l="prev" aria-label="Önceki">${I.prev}</button><button class="btn pri" data-l="pp" id="pp"></button><button class="btn" data-l="next" aria-label="Sonraki">${I.next}</button></div>
<div class="row"><button class="btn" data-l="night">${I.moon}Karanlık ekran</button><button class="btn" data-l="restart">Baştan başla</button></div>
<p class="fld" id="wl" style="margin:10px 2px 0"></p>
<div class="warn">Araçta: listeyi sürüşten önce başlatın; telefonu tutucuya takın ve şarja bağlayın. Ekran kilitlenirse veya başka uygulamaya geçerseniz telefon seslendirmeyi durdurabilir.</div>`;updNow()};

let actx=null;const beep=(f=880,ms=140,n=1)=>{try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();for(let i=0;i<n;i++){const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=f;g.gain.value=0.08;o.connect(g);g.connect(actx.destination);const t=actx.currentTime+i*(ms+90)/1000;o.start(t);o.stop(t+ms/1000)}}catch(e){}};
let driving=false;
const openNight=drv=>{driving=!!drv;const n=$('night');n.classList.add('on');n.classList.toggle('drv',driving);$('nDrv').textContent=driving?(S.L.mode==='shadow'?'SÜRÜŞ + GÖLGE':'SÜRÜŞ MODU'):'';$('nHint').textContent='Çıkmak için 2 saniye basılı tutun';updNow()};
const closeNight=()=>{const was=driving;driving=false;$('night').classList.remove('on','drv');if(was){beep(660,120,1);toast('Sürüş modundan çıkıldı · çalma devam ediyor')}};
const drive=shadow=>{Object.assign(S.L,{mode:shadow?'shadow':'normal',order:'en-tr',gap:3,rep:1,rate:0.9,shuffle:true,loop:true,replay:true});store.set('L',S.L);
 if(P.on)stop();P.list=[];P.i=0;P.dirty=true;beep(880,120,2);renderListen();start();if(P.on)openNight(true)};
/* ---------- main render ---------- */
const render=()=>{document.querySelectorAll('.nav button').forEach(b=>{if(b.dataset.tab===S.tab)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 $('dEn').setAttribute('aria-pressed',S.dir==='en');$('dTr').setAttribute('aria-pressed',S.dir==='tr');
 const lst=S.tab==='t'||S.tab==='p';$('bar').style.display=lst?'':'none';$('clr').style.display=S.q?'block':'none';
 if(!TERMS.length)return;
 if(lst){renderFilters();renderList()}else if(S.tab==='s')renderStudy();else if(S.tab==='r')renderPron();else renderListen()};
const go=t=>{S.tab=t;S.limit=80;store.set('tab',t);render();window.scrollTo(0,0);if(t==='s')autoSpeak()};
const saveF=()=>store.set('f',S.f);const saveD=()=>{store.set('deck',S.deck);P.dirty=true};
const rerender=()=>{if(S.tab==='t'||S.tab==='p'){renderFilters();renderList()}else render()};

/* ---------- template ---------- */
document.body.innerHTML=`<header class="top"><div class="wrap"><div class="brand">
<div><h1>${A.nameHtml}</h1><p class="sub">${esc(A.sub)}</p></div>
<div class="seg" role="group" aria-label="Çeviri yönü"><button id="dEn" aria-pressed="true">EN→TR</button><button id="dTr" aria-pressed="false">TR→EN</button></div>
<button class="gear" id="openSet" aria-label="Ayarlar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button>
</div></div></header>
<div class="bar" id="bar"><div class="wrap"><div class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
<input id="q" type="search" placeholder="Ara…" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Ara"><button class="clr" id="clr" aria-label="Aramayı temizle">×</button></div><div id="filters"></div></div></div>
<main><div class="wrap" id="view"><div class="empty"><b>Yükleniyor…</b></div></div></main>
<nav class="nav"><div class="wrap">
<button data-tab="t" aria-current="page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 8h6"/></svg>Sözlük</button>
<button data-tab="p"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>Kalıplar</button>
<button data-tab="s"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/></svg>Çalış</button>
<button data-tab="r"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/></svg>Telaffuz</button>
<button data-tab="l"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="2" y="14" width="5" height="7" rx="2"/><rect x="17" y="14" width="5" height="7" rx="2"/></svg>Dinle</button>
</div></nav>
<div class="night" id="night" role="dialog" aria-label="Karanlık dinleme ekranı"><div class="drvl" id="nDrv"></div><div class="e" id="nE"></div><div class="t" id="nT"></div><div class="t" id="nCue" style="display:none">Sıra sizde, tekrar edin</div><small id="nHint">Çıkmak için 2 saniye basılı tutun</small></div>
<dialog id="set"><div class="dlg"><button class="x" id="closeSet" aria-label="Kapat">×</button><h2>Ayarlar</h2>
<div class="fld">İngilizce telaffuz ve konuşma tanıma<div class="seg2" role="group"><button data-acc="en-GB">İngiliz (UK)</button><button data-acc="en-US">Amerikan (US)</button></div></div>
<p>Amerikan seçiliyken, farklı yazılan kelimelerde ABD karşılığı seslendirilir ve telaffuz bu yazıma göre kontrol edilir.</p>
<label class="tg">ABD karşılıklarını kartlarda göster <input type="checkbox" id="showUS"></label>
<div class="fld" style="margin-top:10px">Kartlardaki konuşma hızı<div class="seg2" role="group"><button data-rate="0.8">0,8x</button><button data-rate="0.9">0,9x</button><button data-rate="1">1x</button></div></div>
<div class="fld" style="margin-top:12px">Çeviri gösterimi (tüm ekranlar için varsayılan)<div class="seg2" role="group">${TRO.map(m=>`<button data-trdef="${m}">${TRL[m]}</button>`).join('')}</div></div>
<p>Her ekranın kendi "Türkçe" düğmesiyle o ekrana özel ayar yapabilirsiniz. Buradan seçim yapmak tüm ekranları bu ayara döndürür.</p>
<div class="fld" style="margin-top:12px">Çalış ekranında günlük yeni kart sayısı<div class="seg2" role="group">${[[10,'10'],[20,'20'],[40,'40'],[0,'Sınırsız']].map(([v,l])=>`<button data-newl="${v}">${l}</button>`).join('')}</div></div>
<label class="tg">Çalış ekranında önce dinle (yazı sonra) <input type="checkbox" id="lf"></label>
<label class="tg">İlerlemeyi sıfırla <button class="btn" id="reset" style="min-height:40px">Sıfırla</button></label>
<a class="applink" href="${A.other.href}"><span>${esc(A.other.name)}<small>${esc(A.other.desc)}</small></span><span>→</span></a>
<h3 style="margin:16px 0 4px;font-size:16px">Seviyeler hakkında</h3><p>${esc(A.levelNote)}</p>
<h3 style="margin:16px 0 4px;font-size:16px">Telefona uygulama olarak ekleme</h3>
<p><b>iPhone (Safari):</b> Paylaş → Ana Ekrana Ekle. <b>Android (Chrome):</b> ⋮ → Uygulamayı yükle.</p>
</div></dialog><div class="toast" id="toast" role="status"></div>`;

/* ---------- events ---------- */
document.querySelector('.nav').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b)go(b.dataset.tab)});
$('dEn').addEventListener('click',()=>{S.dir='en';store.set('dir','en');cur=null;render()});
$('dTr').addEventListener('click',()=>{S.dir='tr';store.set('dir','tr');cur=null;render()});
let qt;$('q').addEventListener('input',e=>{S.q=e.target.value;S.limit=80;$('clr').style.display=S.q?'block':'none';clearTimeout(qt);qt=setTimeout(renderList,120)});
$('clr').addEventListener('click',()=>{S.q='';$('q').value='';render();$('q').focus()});
const cycleTr=scr=>{const i=TRO.indexOf(trmOf(scr));S.trm[scr]=TRO[(i+1)%TRO.length];store.set('trm',S.trm);[...S.rev].forEach(k=>{if(k.startsWith(scr+'|'))S.rev.delete(k)});toast((S.dir==='en'?'Türkçe: ':'İngilizce: ')+TRL[S.trm[scr]])};
$('filters').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const f=S.f[S.tab];
 if(b.dataset.sec){f.sec=b.dataset.sec;f.grp='all'}else if(b.dataset.grp)f.grp=b.dataset.grp;else if(b.dataset.lv){const l=b.dataset.lv;f.lv=f.lv.includes(l)?f.lv.filter(v=>v!==l):[...f.lv,l]}else if(b.dataset.fav)f.fav=!f.fav;else if(b.dataset.trm)cycleTr(b.dataset.trm);else return;
 S.limit=80;saveF();renderFilters();renderList()});
const copy=t=>{try{navigator.clipboard.writeText(t).then(()=>toast('Kopyalandı'),()=>toast('Kopyalanamadı'))}catch(e){toast('Kopyalanamadı')}};
$('view').addEventListener('change',e=>{const t=e.target;if(t.id==='dgrp'){S.deck.grp=t.value;saveD();cur=null;render()}else if(t.id==='dsec'){S.deck.sec=t.value;S.deck.grp='all';saveD();cur=null;render()}else if(t.dataset.lchk){S.L[t.dataset.lchk]=t.checked;store.set('L',S.L);P.dirty=true}});
$('view').addEventListener('click',e=>{const b=e.target.closest('button,[data-a],#nowBox');if(!b)return;const d=b.dataset||{};const x=BY[d.id];
 if(b.id==='nowBox'){const y=P.list[P.i];if(y){S.rev.add('l|'+y.id);updNow()}return}
 if(d.a==='rv'&&x){S.rev.add(d.scr+'|'+x.id);if(S.tab==='r')renderPron();else renderList();return}
 if(d.trm){cycleTr(d.trm);render();return}
 if(d.a==='spk'&&x)speakNow(enOf(x),S.acc,S.rate);
 else if(d.a==='slow'&&x)speakNow(enOf(x),S.acc,0.7);
 else if(d.a==='mic'&&x){R.item=x;R.res=null;R.err=null;go('r')}
 else if(d.a==='cp'&&x)copy(x.en+(x.us?' (US: '+x.us+')':'')+' — '+x.tr);
 else if(d.a==='fv'&&x){S.favs.has(x.id)?S.favs.delete(x.id):S.favs.add(x.id);save();toast(S.favs.has(x.id)?'Favorilere eklendi':'Favorilerden çıkarıldı');b.classList.toggle('on',S.favs.has(x.id));b.setAttribute('aria-pressed',S.favs.has(x.id));if(S.f[S.tab]&&S.f[S.tab].fav)renderList()}
 else if(d.dsrc){S.deck.src=d.dsrc;S.deck.sec='all';S.deck.grp='all';saveD();cur=null;if(S.tab==='r'){R.item=null;R.res=null}render()}
 else if(d.dsec){S.deck.sec=d.dsec;S.deck.grp='all';saveD();cur=null;if(S.tab==='r'){R.item=null;R.res=null}render()}
 else if(d.dlv){const l=d.dlv,dk=S.deck;dk.lv=dk.lv.includes(l)?dk.lv.filter(v=>v!==l):[...dk.lv,l];saveD();cur=null;if(S.tab==='r'){R.item=null;R.res=null}render()}
 else if(b.id==='flip'&&cur){if(stage===0){stage=1}else if(stage===1){stage=2}else{S.rev.add('s|'+cur.id)}renderStudy()}
 else if(d.s==='ok'&&cur){grade(true);pick();renderStudy();autoSpeak()}
 else if(d.s==='no'&&cur){grade(false);pick();renderStudy();autoSpeak()}
 else if(d.s==='free'){S.free=true;pick();renderStudy();autoSpeak()}
 else if(d.s==='more'){S.newDay.n=Math.max(0,S.newDay.n-10);save();pick();renderStudy();autoSpeak()}
 else if(d.s==='spk'&&cur)speakNow(enOf(cur),S.acc,S.rate);
 else if(d.s==='slow'&&cur)speakNow(enOf(cur),S.acc,0.7);
 else if(d.s==='mic'&&cur){R.item=cur;R.res=null;R.err=null;go('r')}
 else if(b.id==='micBtn'){R.retried=false;listen()}
 else if(d.p==='spk'&&R.item)speakNow(enOf(R.item),S.acc,S.rate);
 else if(d.p==='slow'&&R.item)speakNow(enOf(R.item),S.acc,0.7);
 else if(d.p==='prev'||d.p==='next'){const L=pronList();if(!L.length)return;const i=L.indexOf(R.item);R.item=L[(i+(d.p==='next'?1:-1)+L.length)%L.length];R.res=null;R.err=null;if(R.url){URL.revokeObjectURL(R.url);R.url=null}renderPron()}
 else if(d.p==='me'&&R.url){try{new Audio(R.url).play().catch(()=>toast('Kayıt çalınamadı'))}catch(e){}}
 else if(d.p==='cmp'&&R.url){try{const a=new Audio(R.url);a.onended=()=>speakNow(enOf(R.item),S.acc,S.rate);a.play().catch(()=>toast('Kayıt çalınamadı'))}catch(e){}}
 else if(d.p==='clrhw'){S.hw={};save();renderPron()}
 else if(d.w)speakNow(d.w,S.acc,0.7);
 else if(d.lset){let v=d.v;if(d.lset!=='order'&&d.lset!=='mode')v=Number(v);S.L[d.lset]=v;store.set('L',S.L);if(d.lset==='mode'){const was=P.on;stop();renderListen();if(was)start()}else b.parentElement.querySelectorAll('button').forEach(o=>o.setAttribute('aria-pressed',o===b))}
 else if(d.l==='pp'){P.on?stop():start()}
 else if(d.l==='prev')jump(-1);else if(d.l==='next')jump(1);
 else if(d.l==='restart'){const was=P.on;stop();P.list=[];P.i=0;P.dirty=true;if(was)start();else{P.list=S.L.shuffle?shuffle(deckList()):deckList();P.dirty=false;updNow()}}
 else if(d.l==='night'){if(!P.on)start();openNight(false)}
 else if(d.l==='drive')drive(false);else if(d.l==='driveSh')drive(true);
});
{const n=$('night');let lp=null;const cancel=()=>{if(lp){clearTimeout(lp);lp=null;$('nHint').textContent='Çıkmak için 2 saniye basılı tutun'}};
 n.addEventListener('pointerdown',e=>{e.preventDefault();cancel();$('nHint').textContent='Bırakmayın…';lp=setTimeout(()=>{lp=null;closeNight()},2000)});
 ['pointerup','pointercancel','pointerleave'].forEach(t=>n.addEventListener(t,cancel));
 n.addEventListener('contextmenu',e=>e.preventDefault());n.addEventListener('click',e=>e.preventDefault())}
const dlg=$('set');
const syncSet=()=>{dlg.querySelectorAll('[data-acc]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.acc===S.acc));dlg.querySelectorAll('[data-rate]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.rate)===S.rate));
 dlg.querySelectorAll('[data-trdef]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.trdef===S.trDef));dlg.querySelectorAll('[data-newl]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.newl)===S.newLimit));
 $('showUS').checked=S.showUS;$('lf').checked=S.listenFirst;$('reset').textContent='Sıfırla';$('reset').dataset.c=''};
$('openSet').addEventListener('click',()=>{syncSet();try{dlg.showModal()}catch(e){dlg.setAttribute('open','')}});
$('closeSet').addEventListener('click',()=>{try{dlg.close()}catch(e){dlg.removeAttribute('open')}render()});
dlg.addEventListener('close',render);
dlg.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.acc){S.acc=b.dataset.acc;store.set('acc',S.acc)}else if(b.dataset.rate){S.rate=Number(b.dataset.rate);store.set('rate',S.rate)}
 else if(b.dataset.trdef){S.trDef=b.dataset.trdef;S.trm={};S.rev.clear();store.set('trDef',S.trDef);store.set('trm',S.trm)}
 else if(b.dataset.newl!=null&&b.dataset.newl!==undefined&&b.hasAttribute('data-newl')){S.newLimit=Number(b.dataset.newl);store.set('newLimit',S.newLimit)}
 else if(b.id==='reset'){if(b.dataset.c){S.srs={};S.hard.clear();S.pron={};S.hw={};S.newDay={d:'',n:0};save();toast('İlerleme sıfırlandı');cur=null}else{b.dataset.c='1';b.textContent='Emin misiniz? Tekrar dokunun';return}}
 else return;syncSet()});
$('showUS').addEventListener('change',e=>{S.showUS=e.target.checked;store.set('showUS',S.showUS)});
$('lf').addEventListener('change',e=>{S.listenFirst=e.target.checked;store.set('listenFirst',S.listenFirst);cur=null});

/* ---------- load ---------- */
const get=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u);return r.text()});
Promise.all([get(A.data.t),get(A.data.p)]).then(([a,b])=>{TERMS=parse(a,'t');PHR=parse(b,'p');ALL=[...TERMS,...PHR];BY=Object.fromEntries(ALL.map(x=>[x.id,x]));
 /* old version: carry over "known" cards into spaced repetition */
 const old=store.get('known',null);if(old&&old.length){const now=Date.now();old.forEach(id=>{if(BY[id]&&!S.srs[id])S.srs[id]={b:2,d:now+INT[2]}});store.set('known',[]);save()}
 render()}).catch(()=>{$('view').innerHTML='<div class="empty"><b>Veriler yüklenemedi</b>İnternet bağlantınızı kontrol edip sayfayı yenileyin.</div>'});
render();
if('serviceWorker' in navigator){try{navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){}}
}
