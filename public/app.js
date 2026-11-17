'use strict';
const $=s=>document.querySelector(s),esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CATS={all:'الرئيسية',rank:'الرانكات',upgrade:'الترقيات',key:'المفاتيح',misc:'متنوع',month:'عنصر الشهر',offer:'العروض'};
let S,me=null,cat='all',feat=null,raf=0,io=null,cap={},D=null,chat=[];
async function api(m,u,b){const r=await fetch('/api'+u,{method:m,headers:{'Content-Type':'application/json','X-RC':'1'},body:b?JSON.stringify(b):undefined,credentials:'same-origin'});let j={};try{j=await r.json()}catch(e){}if(!r.ok)throw Object.assign(new Error(j.error||'حصل خطأ'),{status:r.status,captcha:j.captcha});return j}
const th=()=>{const s=S.settings,r=document.documentElement.style;r.setProperty('--gold',s.accent||'#ffc61a');r.setProperty('--b',s.accent2||'#7c4dff')};
const svg=b=>`<svg class="ic" viewBox="0 0 32 32" fill="currentColor" fill-rule="evenodd" shape-rendering="crispEdges">${b}</svg>`;
const I={sword:svg('<path d="M24 2h6v6L16 22l-4-4zM9 17l6 6-3 3-2-2-4 4-3-3 4-4-2-2z"/>'),chest:svg('<path d="M3 12h26v16H3z"/><path d="M5 4h22v6H5z" opacity=".7"/><rect x="14" y="14" width="4" height="6" fill="#0d0d0d"/>'),crown:svg('<path d="M3 24V9l7 6 6-9 6 9 7-6v15z"/>'),bolt:svg('<path d="M18 2L5 18h8l-3 12 14-18h-8z"/>'),lock:svg('<path d="M8 14v-4a8 8 0 0116 0v4h2v14H6V14zm4 0h8v-4a4 4 0 00-8 0z"/>'),pad:svg('<path d="M6 9h20l4 14h-6l-4-4h-8l-4 4H2z"/>'),heart:svg('<path d="M16 29L3 16a7 7 0 0113-6 7 7 0 0113 6z"/>')};
const perks=p=>String(p.perks||'').split('\n').map(l=>l.split(/:(.*)/s)).filter(a=>a[0].trim()).map(a=>[a[0].trim(),(a[1]||'').trim()]);
const pic=(p,i,x='')=>`<div class="img c${i%4}" style="${p.img?`background-image:url('${esc(p.img)}')`:''}">${p.img?'':`<div class="tg">${esc(p.name)}</div>`}${x}</div>`;
const modal=h=>{$('#overlay').innerHTML=`<div class="lay"><div class="box">${h}</div></div>`},closeM=()=>{$('#overlay').innerHTML=''};
async function capLoad(){try{cap=await api('GET','/captcha');const i=$('#ci');if(i)i.src='data:image/svg+xml;base64,'+btoa(cap.svg)}catch(e){const a=$('#ae');if(a)a.textContent=e.message}}
const capv=()=>({id:cap.id,text:($('#ac')||{}).value||''});
/* ---------- auth gate ---------- */
function gate(tab='login'){const R=tab==='reg';
 $('#app').innerHTML=`<div class="auth"><div class="box au"><img class="lg2" src="${esc(S.settings.logo)}" alt=""><h2>${R?'إنشاء حساب':'تسجيل الدخول'}</h2><p class="mut">اكتب اسمك في ماين كرافت بالظبط${R?' (لازم تكون دخلت السيرفر قبل كده)':''}.</p>
 <label>اسم اللاعب</label><input id="au" maxlength="17" autocomplete="username"><label>كلمة المرور</label><input id="ap" type="password" maxlength="100" autocomplete="${R?'new-password':'current-password'}">${R?'<label>تأكيد كلمة المرور</label><input id="ap2" type="password" maxlength="100" autocomplete="new-password">':''}
 <label>الكابتشا</label><div class="row" style="justify-content:flex-start"><img id="ci" class="capi" alt=""><button class="btn" id="cr" type="button">تغيير</button></div><input id="ac" maxlength="8" autocomplete="off" autocapitalize="characters">
 <div class="err" id="ae"></div><button class="btn g" id="ago" style="width:100%" type="button">${R?'إنشاء الحساب':'دخول'}</button>
 <p style="text-align:center" class="mut">${R?'عندك حساب؟ <a href="#" data-g="login">سجّل دخول</a>':'معندكش حساب؟ <a href="#" data-g="reg">أنشئ حساب</a>'}</p></div></div>`;
 capLoad();$('#cr').onclick=capLoad;
 $('#ago').onclick=async()=>{const e=$('#ae');e.textContent='';if(R&&$('#ap').value!==$('#ap2').value){e.textContent='كلمتا المرور غير متطابقتين.';return}
  try{const r=await api('POST',R?'/register':'/login',{username:$('#au').value.trim(),password:$('#ap').value,captcha:capv()});me=r.user;S=await api('GET','/state');render()}catch(x){e.textContent=x.message;if(x.captcha||x.status===400)capLoad();$('#ac').value=''}}}
/* ---------- store ---------- */
function render(){
 const st=S.settings,P=S.products,ranks=P.filter(p=>p.cat==='rank'),view=cat==='all'?'rank':cat,list=P.filter(p=>view==='offer'?p.old>p.price:p.cat===view);
 if(!ranks.find(r=>r.id===feat))feat=(ranks[ranks.length-1]||{}).id;
 const fp=ranks.find(r=>r.id===feat),labs=[],cur=esc(st.cur),ipp=esc(st.ip)+':'+esc(st.port);
 ranks.forEach(r=>perks(r).forEach(x=>{if(!labs.includes(x[0]))labs.push(x[0])}));
 const ci=`<img class="ci" src="/img/cart.png" alt="">`;
 const card=p=>{const i=P.indexOf(p),d=p.old>p.price?Math.round((1-p.price/p.old)*100):0;return `<div class="card rv k${i%4}">${pic(p,i,d?`<span class="tag">خصم ${d}%</span>`:'')}<div class="b"><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><div class="row"><div class="pr">${d?`<s>${p.old}</s>`:''}${p.price} ${cur}</div><button class="btn g" data-act="buy" data-id="${esc(p.id)}">${ci}شراء</button></div></div></div>`};
 const box=a=>a.map(x=>`<div class="rv"><div class="bi">${x[0]}</div><h3>${esc(x[1])}</h3><p style="opacity:.8;margin:0">${esc(x[2])}</p></div>`).join('');
 const steps=[[I.sword,'سجّل اسمك','سجّل بنفس اسمك في اللعبة عشان يوصلك المنتج على حسابك.'],[I.chest,'اختار منتجك','رانكات ومفاتيح وترقيات وعروض خاصة.'],[I.crown,'ادفع واستلم','حوّل بفودافون كاش وابعت الإيصال على '+st.contact+' وهيوصلك المنتج.']];
 const why=[[I.bolt,'تسليم سريع','بعد تأكيد التحويل بيوصلك طلبك في دقائق.'],[I.lock,'دفع آمن','فودافون كاش فقط، من غير بيانات بطاقات.'],[I.pad,'جافا وبيدروك','اللعب من الموبايل أو الكمبيوتر.'],[I.heart,'ادعم السيرفر','كل شراء بيدفع الاستضافة والحماية.']];
 const gem=[['8%','62%','#4dd0e1','0s'],['18%','30%','#43c35b','-2s'],['84%','56%','#ffc61a','-1s'],['72%','22%','#ff4fa8','-3s'],['46%','78%','#ffc61a','-4s'],['92%','74%','#43c35b','-2.5s'],['30%','74%','#ff4fa8','-1.5s']].map(f=>`<i class="fl" style="left:${f[0]};top:${f[1]};background:${f[2]};animation-delay:${f[3]}"></i>`).join('');
 const brand=[...String(st.name)].map((c,i)=>`<span style="animation-delay:${i*.12}s">${c===' '?'&nbsp;':esc(c)}</span>`).join('');
 const tile=k=>`<button class="tile rv ${k===view?'on':''}" data-act="cat" data-k="${k}"><div class="ti">${st.tiles&&st.tiles[k]?`<img src="${esc(st.tiles[k])}" alt="">`:(k==='misc'?I.sword:I.chest)}</div>${CATS[k]}</button>`;
 const stat=(l,v)=>`<div class="sc"><small>${l}</small>${+v?`<b data-n="${+v}">0</b>`:'<b>--</b>'}</div>`;
 const on=S.status?S.status.online:0;
 $('#app').innerHTML=`<div class="nav"><span class="logo wv" dir="ltr">${brand}</span>${Object.keys(CATS).map(k=>`<button data-act="cat" data-k="${k}" class="${k===cat?'on':''}">${CATS[k]}</button>`).join('')}${me.role==='admin'?'<button data-act="admin">لوحة الأدمن</button>':''}<button class="lgn" data-act="acct">${esc(me.name)}</button></div>
 <div class="tk"><div>${Array(10).fill(`<span class="dot"></span>${esc(st.banner)}`).join('')}</div></div>
 <section class="hero"><div class="sky${st.hero?' im':''}" ${st.hero?`style="background-image:url('${esc(st.hero)}')"`:''}></div><div class="sun"></div><i class="cl c1"></i><i class="cl c2"></i><i class="cl c3"></i>
 <svg class="mt m1" viewBox="0 0 1000 200" preserveAspectRatio="none"><path d="M0 200V120l80-60 90 50 100-80 110 90 90-40 120 70 100-60 110 60 100-40 100 60v130z"/></svg><svg class="mt m2" viewBox="0 0 1000 200" preserveAspectRatio="none"><path d="M0 200V140l120-50 110 60 120-70 130 70 110-50 130 60 150-60 130 60v90z"/></svg>
 <canvas id="pt"></canvas><div class="gr"></div>${gem}
 <div class="lgw"><img class="lg" src="${esc(st.logo)}" alt="${esc(st.name)}"></div><p class="tl">${esc(st.tagline)}</p>
 <div class="ipb"><span>${ipp}</span><button class="btn g pulse" data-act="copy" data-v="${ipp}">انسخ الـ IP</button></div><button class="btn g" data-act="go">تسوق الآن</button>
 <div class="stats">${stat('لاعبين أونلاين',on)}${stat('أعضاء الديسكورد',st.disc)}</div></section>
 <div class="w"><div class="info" style="margin-top:20px"><div class="y rv"><small>طريقة الدفع</small><h3>فودافون كاش فقط</h3><div style="font-weight:800;direction:ltr;text-align:right">${esc(st.vf)}</div></div>
 <div class="rv"><small class="mut">حسابك</small><h3>${esc(me.name)}</h3><div class="mut">المشتريات بتوصل للحساب ده.</div></div>
 <div class="rv"><small class="mut">تواصل واستلام</small><h3 dir="ltr" style="text-align:right">${esc(st.contact)}</h3><div class="mut">ابعت إيصال التحويل على الحساب ده.</div></div></div>
 <h2 class="s" id="shop">الأقسام</h2><div class="tiles">${['rank','upgrade','key','misc','month'].map(tile).join('')}</div>
 <h2 class="s">${CATS[view]}</h2><div class="grid">${list.map(card).join('')||'<p class="mut" style="text-align:center">لا توجد منتجات هنا.</p>'}</div>
 ${view==='rank'&&ranks.length?`<h2 class="s">قارن الرانكات</h2><div class="tw rv"><table><tr><th></th>${ranks.map(r=>`<th data-act="feat" data-id="${esc(r.id)}">${esc(r.name)}<br>${r.price} ${cur}</th>`).join('')}</tr>${labs.map(l=>`<tr><td>${esc(l)}</td>${ranks.map((r,i)=>`<td class="${i===ranks.length-1?'best':''}">${esc((perks(r).find(x=>x[0]===l)||[0,'-'])[1])}</td>`).join('')}</tr>`).join('')}</table></div>
 <div class="fe rv">${pic(fp,P.indexOf(fp))}<div><h2 style="margin:0;font-size:30px">${esc(fp.name)}</h2><div class="pr" style="font-size:28px;margin:8px 0">${fp.price} ${cur}</div><p class="mut" style="white-space:pre-line">${esc(fp.desc)}</p><div class="row" style="justify-content:flex-start"><button class="ib" data-act="buy" data-id="${esc(fp.id)}"><img src="/img/buy.png" alt="BUY NOW"></button><button class="btn g" data-act="buy" data-id="${esc(fp.id)}">${ci}</button></div></div></div>`:''}
 <h2 class="s">طريقة الشراء</h2><div class="info">${box(steps)}</div><h2 class="s">ليه تشتري منا</h2><div class="info">${box(why)}</div>
 <div class="sign rv">${esc(st.msg)}</div><h2 class="s">أسئلة شائعة</h2>${String(st.faq).split('\n').map(l=>l.split('|')).filter(a=>a[1]).map(a=>`<details class="rv"><summary>${esc(a[0])}</summary><p>${esc(a.slice(1).join('|'))}</p></details>`).join('')}
 <div class="dc rv"><div>انضم لديسكورد السيرفر<div style="font-size:14px;font-weight:600">تحديثات ودعم</div></div><div dir="ltr" style="background:#1a1000;color:var(--gold);padding:10px 16px;border-radius:12px">${esc(st.discord)}</div></div>
 <footer>${esc(st.name)}<span class="vf">Vodafone Cash</span></footer></div><button class="btn g fab2" data-act="ai">المساعد</button>`;
 th();parts();cnt();rv();tilt()}
function parts(){const c=$('#pt');if(!c)return;cancelAnimationFrame(raf);const x=c.getContext('2d'),W=c.width=c.offsetWidth,H=c.height=c.offsetHeight,p=Array.from({length:Math.min(70,W/10|0)},()=>({x:Math.random()*W,y:Math.random()*H,s:2+Math.random()*4,v:.3+Math.random()*.9,h:Math.random()*360,o:Math.random()*6}));
 const lp=t=>{if(!c.isConnected)return;x.clearRect(0,0,W,H);p.forEach(q=>{q.y-=q.v;q.x+=Math.sin(t/900+q.o)*.4;if(q.y<-8){q.y=H+8;q.x=Math.random()*W}x.globalAlpha=.5+.5*Math.sin(t/400+q.o);x.fillStyle=`hsl(${(q.h+t/30)%360},90%,65%)`;x.fillRect(q.x,q.y,q.s,q.s)});raf=requestAnimationFrame(lp)};raf=requestAnimationFrame(lp)}
function cnt(){document.querySelectorAll('[data-n]').forEach(el=>{const n=+el.dataset.n,t0=performance.now(),f=t=>{const k=Math.min(1,(t-t0)/1500);el.textContent=Math.round(n*(1-Math.pow(1-k,3))).toLocaleString('en');if(k<1&&el.isConnected)requestAnimationFrame(f)};requestAnimationFrame(f)})}
function rv(){const els=document.querySelectorAll('.rv');if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return}if(io)io.disconnect();io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08});els.forEach((e,i)=>{e.style.transitionDelay=(i%5)*80+'ms';io.observe(e)});setTimeout(()=>els.forEach(e=>e.classList.add('in')),3500)}
function tilt(){const h=document.querySelector('.hero');if(h){h.onpointermove=e=>{const r=h.getBoundingClientRect();h.style.setProperty('--px',((e.clientX-r.left)/r.width-.5).toFixed(3));h.style.setProperty('--py',((e.clientY-r.top)/r.height-.5).toFixed(3))};h.onpointerleave=()=>{h.style.setProperty('--px',0);h.style.setProperty('--py',0)}}
 document.querySelectorAll('.card,.tile').forEach(c=>{c.onpointermove=e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transition='transform .1s';c.style.transform=`perspective(700px) rotateY(${x*12}deg) rotateX(${-y*12}deg) translateY(-6px)`};c.onpointerleave=()=>{c.style.transition='';c.style.transform=''}})}
/* ---------- buy ---------- */
function buy(id){const p=S.products.find(x=>x.id===id);if(!p)return;
 modal(`<h2>شراء ${esc(p.name)} - ${p.price} ${esc(S.settings.cur)}</h2><p class="mut">الحساب: <b>${esc(me.name)}</b></p><label>الكابتشا</label><div class="row" style="justify-content:flex-start"><img id="ci" class="capi" alt=""><button class="btn" id="cr" type="button">تغيير</button></div><input id="ac" maxlength="8" autocomplete="off" autocapitalize="characters"><div class="err" id="ae"></div><div class="row"><button class="btn g" id="bgo" type="button">تأكيد الطلب</button><button class="btn" data-act="close" type="button">إلغاء</button></div>`);
 capLoad();$('#cr').onclick=capLoad;
 $('#bgo').onclick=async()=>{try{const r=await api('POST','/orders',{productId:id,captcha:capv()});pay(r.order)}catch(e){$('#ae').textContent=e.message;if(e.captcha||e.status===400)capLoad();$('#ac').value=''}}}
function pay(o){const s=S.settings;modal(`<h2>خطوات الدفع</h2><p>كود الطلب: <b style="color:var(--gold)">${esc(o.id)}</b></p><ol class="steps"><li>حوّل <b>${o.price} ${esc(s.cur)}</b> على فودافون كاش للرقم:<br><b dir="ltr" id="vf" style="color:var(--gold);font-size:20px">${esc(s.vf)}</b> <button class="btn" data-act="copy" data-v="${esc(s.vf)}" type="button">نسخ</button></li><li>صوّر إيصال التحويل.</li><li>ابعت الإيصال + كود الطلب + اسمك <b>${esc(o.user)}</b> على حساب: <b style="color:var(--gold)">${esc(s.contact)}</b> أو في الديسكورد.</li><li>بعد التأكيد بيوصلك <b>${esc(o.product)}</b> على حسابك.</li></ol><button class="btn" data-act="close" type="button">تم</button>`)}
async function acct(){let o=[];try{o=(await api('GET','/orders/mine')).orders}catch(e){}const sl={pending:'قيد المراجعة',paid:'تم الدفع',delivered:'تم التسليم',rejected:'مرفوض'};
 modal(`<h2>${esc(me.name)}</h2><h3>طلباتي</h3>${o.length?`<table class="ot"><tr><th>الكود</th><th>المنتج</th><th>السعر</th><th>الحالة</th></tr>${o.reverse().map(x=>`<tr><td>${esc(x.id)}</td><td>${esc(x.product)}</td><td>${x.price}</td><td>${sl[x.status]||''}</td></tr>`).join('')}</table>`:'<p class="mut">مفيش طلبات لسه.</p>'}<div class="row" style="margin-top:14px;justify-content:flex-start"><button class="btn" id="lo" type="button">تسجيل خروج</button><button class="btn" data-act="close" type="button">إغلاق</button></div>`);
 $('#lo').onclick=async()=>{try{await api('POST','/logout',{})}catch(e){}me=null;closeM();gate()}}
/* ---------- AI ---------- */
function addMsg(c,t){const d=document.createElement('div');d.className=c;d.textContent=t;$('#cm').appendChild(d);$('#cm').scrollTop=1e6}
async function aiSend(){const i=$('#cin'),t=i.value.trim();if(!t)return;i.value='';addMsg('u',t);chat.push({role:'user',content:t});addMsg('a','...');const w=$('#cm').lastChild;
 try{const r=await api('POST','/ai',{messages:chat});w.textContent=r.reply;chat.push({role:'assistant',content:r.reply})}catch(e){w.textContent=e.message;chat.pop()}$('#cm').scrollTop=1e6}
/* ---------- admin ---------- */
function shrink(f){return new Promise((ok,no)=>{const im=new Image(),u=URL.createObjectURL(f);im.onload=()=>{const k=Math.min(1,1400/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL('image/jpeg',.86).split(',')[1])};im.onerror=()=>no(new Error('صورة غير صالحة'));im.src=u})}
async function admin(tab='s'){if(!D){const d=await api('GET','/admin/data');D={s:JSON.parse(JSON.stringify(S.settings)),p:JSON.parse(JSON.stringify(S.products)),pt:d.playersText,o:d.orders,u:d.users}}
 D.s.tiles=D.s.tiles||{};const T=[['s','الإعدادات'],['i','الصور'],['p','المنتجات'],['o','الطلبات'],['u','اللاعبين'],['a','حسابي']];
 const F=(k,l,t='text')=>`<label>${l}</label><input data-s="${k}" type="${t}" value="${esc(D.s[k])}">`,IM=(l,k,v)=>`<label>${l}</label>${v?`<img class="pv" src="${esc(v)}" alt="">`:''}<input type="file" accept="image/*" data-up="${k}">`;
 let b='';
 if(tab==='s')b=F('name','اسم المتجر')+F('tagline','الوصف تحت الاسم')+F('banner','الشريط المتحرك')+F('vf','رقم فودافون كاش')+F('contact','حسابك (يظهر للمشتري)')+F('discord','رابط/اسم الديسكورد')+F('ip','IP السيرفر')+F('port','البورت')+F('cur','العملة')+F('disc','أعضاء الديسكورد','number')+F('accent','اللون الرئيسي','color')+F('accent2','اللون الثاني','color')+`<label>رسالة اللوحة الخشب</label><textarea rows="3" data-s="msg">${esc(D.s.msg)}</textarea><label>الأسئلة الشائعة (سؤال|جواب في كل سطر)</label><textarea rows="5" data-s="faq">${esc(D.s.faq)}</textarea><label>لاعبين مسموح تسجيلهم يدويًا (اسم في كل سطر، اختياري)</label><textarea rows="4" data-pt="1">${esc(D.pt)}</textarea>`;
 if(tab==='i')b=IM('اللوجو','logo',D.s.logo)+IM('خلفية البانر','hero',D.s.hero)+(D.s.hero?'<button class="btn" data-rm="hero" type="button">إزالة الخلفية</button>':'')+['rank','upgrade','key','misc','month'].map(k=>IM('صورة قسم '+CATS[k],'t:'+k,D.s.tiles[k])).join('');
 if(tab==='p')b=D.p.map((p,i)=>`<div class="ed"><label>الاسم</label><input data-pi="${i}" data-k="name" value="${esc(p.name)}"><label>القسم</label><select data-pi="${i}" data-k="cat">${['rank','upgrade','key','misc','month'].map(c=>`<option value="${c}" ${p.cat===c?'selected':''}>${CATS[c]}</option>`).join('')}</select><label>السعر</label><input type="number" data-pi="${i}" data-k="price" value="${p.price}"><label>السعر قبل الخصم (للعرض)</label><input type="number" data-pi="${i}" data-k="old" value="${p.old||0}"><label>الوصف</label><textarea rows="2" data-pi="${i}" data-k="desc">${esc(p.desc)}</textarea><label>مميزات للجدول (سطر: قيمة)</label><textarea rows="3" data-pi="${i}" data-k="perks">${esc(p.perks)}</textarea>${IM('صورة المنتج','p:'+i,p.img)}<button class="btn" data-del="${i}" type="button">حذف المنتج</button></div>`).join('')+'<button class="btn" id="padd" type="button">+ إضافة منتج</button>';
 if(tab==='o'){const sl={pending:'قيد المراجعة',paid:'تم الدفع',delivered:'تم التسليم',rejected:'مرفوض'};b=D.o.length?`<table class="ot"><tr><th>الكود</th><th>اللاعب</th><th>المنتج</th><th>السعر</th><th>الحالة</th></tr>${D.o.map(x=>`<tr><td>${esc(x.id)}</td><td>${esc(x.user)}</td><td>${esc(x.product)}</td><td>${x.price}</td><td><select data-os="${esc(x.id)}">${Object.keys(sl).map(k=>`<option value="${k}" ${x.status===k?'selected':''}>${sl[k]}</option>`).join('')}</select></td></tr>`).join('')}</table>`:'<p class="mut">مفيش طلبات.</p>'}
 if(tab==='u')b=`<table class="ot"><tr><th>الاسم</th><th>الدور</th><th></th></tr>${D.u.map(u=>`<tr><td>${esc(u.name)}</td><td>${u.role}</td><td>${u.name.toLowerCase()===me.name.toLowerCase()?'':`<button class="btn" data-du="${esc(u.name)}" type="button">حذف</button>`}</td></tr>`).join('')}</table>`;
 if(tab==='a')b='<label>كلمة المرور الحالية</label><input id="po" type="password"><label>كلمة المرور الجديدة (8+ أحرف)</label><input id="pn" type="password"><button class="btn g" id="pch" type="button">تغيير كلمة المرور</button>';
 modal('').firstChild;$('#overlay .box').classList.add('big');
 $('#overlay .box').innerHTML=`<h2>لوحة الأدمن</h2><div class="tabs">${T.map(t=>`<button class="btn ${t[0]===tab?'on':''}" data-tab="${t[0]}" type="button">${t[1]}</button>`).join('')}</div>${b}<div class="err" id="ae"></div><div class="row" style="margin-top:12px">${'sip'.includes(tab)?'<button class="btn g" id="asv" type="button">حفظ ونشر</button>':'<span></span>'}<button class="btn" data-act="close" type="button">إغلاق</button></div>`;
 const bx=$('#overlay .box'),msg=t=>{$('#ae').textContent=t};
 bx.oninput=e=>{const t=e.target;if(t.dataset.s)D.s[t.dataset.s]=t.type==='number'?Number(t.value)||0:t.value;else if(t.dataset.pt)D.pt=t.value;else if(t.dataset.pi!==undefined){const p=D.p[t.dataset.pi],k=t.dataset.k;p[k]=(k==='price'||k==='old')?Math.max(0,Number(t.value)||0):t.value}};
 bx.onchange=async e=>{const t=e.target;
  if(t.dataset.up&&t.files[0]){try{msg('جاري رفع الصورة...');const r=await api('POST','/admin/upload',{data:await shrink(t.files[0])}),k=t.dataset.up;if(k.startsWith('t:'))D.s.tiles[k.slice(2)]=r.url;else if(k.startsWith('p:'))D.p[+k.slice(2)].img=r.url;else D.s[k]=r.url;admin(tab)}catch(x){msg(x.message)}}
  else if(t.dataset.pi!==undefined&&t.dataset.k==='cat')D.p[t.dataset.pi].cat=t.value;
  else if(t.dataset.os){try{await api('PATCH','/admin/orders/'+t.dataset.os,{status:t.value})}catch(x){msg(x.message)}}};
 bx.onclick=async e=>{const t=e.target.closest('button');if(!t)return;
  if(t.dataset.tab)return admin(t.dataset.tab);
  if(t.dataset.del!==undefined){if(confirm('حذف المنتج؟')){D.p.splice(+t.dataset.del,1);admin(tab)}}
  else if(t.dataset.rm){D.s[t.dataset.rm]='';admin(tab)}
  else if(t.id==='padd'){D.p.push({id:'p'+Date.now(),cat:'rank',name:'منتج جديد',price:10,old:0,img:'',desc:'',perks:''});admin(tab)}
  else if(t.dataset.du){if(confirm('حذف اللاعب؟'))try{await api('DELETE','/admin/users/'+encodeURIComponent(t.dataset.du));D.u=D.u.filter(u=>u.name!==t.dataset.du);admin(tab)}catch(x){msg(x.message)}}
  else if(t.id==='pch'){try{await api('POST','/account/password',{old:$('#po').value,new:$('#pn').value});msg('تم تغيير كلمة المرور.')}catch(x){msg(x.message)}}
  else if(t.id==='asv'){try{msg('جاري الحفظ...');await api('PUT','/admin/settings',{settings:D.s,playersText:D.pt});await api('PUT','/admin/products',{products:D.p});S=await api('GET','/state');msg('تم الحفظ والنشر.');render()}catch(x){msg(x.message)}}}}
/* ---------- events ---------- */
document.addEventListener('click',async e=>{const g=e.target.closest('[data-g]');if(g){e.preventDefault();return gate(g.dataset.g)}
 const t=e.target.closest('[data-act]');if(!t)return;const a=t.dataset.act;
 if(a==='cat'){cat=t.dataset.k;render()}else if(a==='feat'){feat=t.dataset.id;render()}else if(a==='buy')buy(t.dataset.id);else if(a==='close'){closeM();D=null}else if(a==='acct')acct();else if(a==='admin')admin();
 else if(a==='go'){const s=$('#shop');if(s)s.scrollIntoView({behavior:'smooth'})}
 else if(a==='copy'){try{await navigator.clipboard.writeText(t.dataset.v);t.textContent='تم النسخ'}catch(x){}}
 else if(a==='ai'){$('#chat').classList.toggle('on');if(!$('#cm').children.length)addMsg('a','أهلاً! أنا مساعد المتجر، اسألني عن الرانكات والأسعار وطريقة الدفع.')}else if(a==='aix')$('#chat').classList.remove('on')});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#overlay .lay')&&!$('#overlay .ed')){closeM()}if(e.key==='Enter'){if(e.target.id==='cin')aiSend();else if($('#ago')&&e.target.closest('.au'))$('#ago').click()}});
$('#cs').onclick=aiSend;
(async()=>{try{const[a,b]=await Promise.all([api('GET','/state'),api('GET','/me')]);S=a;me=b.user}catch(e){$('#app').textContent='تعذر تحميل الموقع، حدّث الصفحة.';return}th();me?render():gate()})();
