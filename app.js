import {all,put,clear,bulk,persist} from './db.js';
import * as C from './categories.js';
import * as K from './contacts.js';

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const S={cats:[],cons:[],q:'',f:{cat:'',job:'',fav:false,recent:false},theme:'light'};
const A={};
const LBL={mobile:'جوال',work:'عمل',home:'منزل',other:'آخر'};
const cat=id=>S.cats.find(k=>k.id==id);
const inCat=(c,id)=>c.cats.some(x=>x==id||cat(x)?.parent==id);
const cnt=id=>S.cons.filter(c=>inCat(c,id)).length;
const names=c=>c.cats.map(i=>cat(i)?.name||'');
const fmt=d=>new Date(d).toLocaleDateString('ar');
const reload=async()=>{[S.cats,S.cons]=await Promise.all([C.list(),K.list()])};
const saveSet=()=>put('meta',{k:'s',theme:S.theme});
const setTheme=()=>{document.documentElement.dataset.theme=S.theme};

/* ---------- UI primitives ---------- */
const modal=h=>{const m=$('#modal');m.innerHTML=`<div class=sheet role=dialog aria-modal=true>${h}</div>`;m.hidden=false};
const close=()=>{const m=$('#modal');m.hidden=true;m.innerHTML=''};
let tt;const toast=(m,err)=>{const e=$('#toast');e.textContent=m;e.className=err?'show err':'show';clearTimeout(tt);tt=setTimeout(()=>e.className='',2800)};
const ask=(m,ok,d)=>new Promise(r=>{modal(`<p>${esc(m)}</p><div class=acts><button class="${d?'dng':'pri'}" id=ok>${ok}</button><button id=no>إلغاء</button></div>`);const f=v=>{close();r(v)};$('#ok').onclick=()=>f(true);$('#no').onclick=()=>f(false)});
const inp=(m,v='')=>new Promise(r=>{modal(`<label>${m}<input id=iv class=in value="${esc(v)}" maxlength=60></label><div class=acts><button class=pri id=ok>حفظ</button><button id=no>إلغاء</button></div>`);const f=x=>{close();r(x)};$('#ok').onclick=()=>f($('#iv').value.trim());$('#no').onclick=()=>f('');$('#iv').focus()});

/* ---------- Views (each returns [title, html]) ---------- */
const nf=()=>['—','<p class=empty>غير موجود.</p>'];
const card=c=>{const n=K.norm(c.phones[0]?.n||'');return `<article class=card><div class=row><a class=nm href="#/c/${c.id}"><b>${esc(c.name)}</b><small>${esc([c.job,c.company].filter(Boolean).join(' · '))}</small><small dir=ltr>${esc(c.phones[0]?.n)}</small></a><button class=ic data-act=fav data-id="${c.id}" aria-label="مفضلة">${c.fav?'★':'☆'}</button></div><div class=acts><a class=btn href="tel:${n}">📞 اتصال</a><a class=btn href="sms:${n}">💬 رسالة</a><a class=btn href="#/c/${c.id}">تفاصيل</a><button data-act=edit data-id="${c.id}">✏️ تعديل</button></div></article>`};
const list=(a,s=1)=>a.length?(s?[...a].sort((x,y)=>x.name.localeCompare(y.name,'ar')):a).map(card).join(''):'<p class=empty>لا توجد جهات اتصال هنا بعد.</p>';

const home=()=>['M-Tantny',`<a class=search href="#/contacts">🔍 ابحث بالاسم أو الرقم أو المهنة…</a><div class=grid>${S.cats.filter(c=>!c.parent).map(c=>`<a class=cat style="--c:${c.color}" href="#/cat/${c.id}"><span class=big>${c.icon}</span><b>${esc(c.name)}</b><small>${cnt(c.id)} جهة</small></a>`).join('')}<button class="cat add" data-act=addcat><span class=big>＋</span><b>تصنيف جديد</b></button></div><button class="pri wide" data-act=add>＋ إضافة جهة اتصال</button>`];

const catV=id=>{const c=cat(id);if(!c)return nf();const p=c.parent?cat(c.parent):c,subs=S.cats.filter(k=>k.parent==id);
 return [c.name,(subs.length?`<div class=grid>${subs.map(s=>`<a class=cat style="--c:${p.color}" href="#/cat/${s.id}"><b>${esc(s.name)}</b><small>${cnt(s.id)} جهة</small></a>`).join('')}</div>`:'')+`<h2>${subs.length?'كل جهات هذا التصنيف':'جهات الاتصال'}</h2>${list(S.cons.filter(x=>inCat(x,id)))}<button class="pri wide" data-act=add data-cat="${id}">＋ إضافة جهة هنا</button>`]};

const resH=()=>{const f=S.f,w=Date.now()-6048e5;let a=K.search(S.cons,S.q,names);
 if(f.fav)a=a.filter(c=>c.fav);if(f.cat)a=a.filter(c=>inCat(c,f.cat));if(f.job)a=a.filter(c=>c.job==f.job);if(f.recent)a=a.filter(c=>c.created>w);
 return `<p class=mut>${a.length} نتيجة</p>`+list(a)};
const consV=()=>{const jobs=[...new Set(S.cons.map(c=>c.job).filter(Boolean))].sort(),o=(v,l,s)=>`<option value="${esc(v)}"${s?' selected':''}>${esc(l)}</option>`;
 return ['جهات الاتصال',`<input id=q type=search class=in placeholder="بحث: الاسم، الرقم، المهنة، الشركة، التصنيف" value="${esc(S.q)}"><div class=filters><select data-f=cat aria-label="تصنيف">${o('','كل التصنيفات')}${S.cats.map(k=>o(k.id,(k.parent?'— ':'')+k.name,S.f.cat==k.id)).join('')}</select><select data-f=job aria-label="مهنة">${o('','كل المهن')}${jobs.map(j=>o(j,j,S.f.job==j)).join('')}</select><label class=chip><input type=checkbox data-f=fav${S.f.fav?' checked':''}><span>⭐ المفضلة</span></label><label class=chip><input type=checkbox data-f=recent${S.f.recent?' checked':''}><span>🆕 أضيفت حديثًا</span></label></div><div class=acts><button class=pri data-act=add>＋ جهة جديدة</button><button data-act=impPhone>📲 استيراد من الهاتف</button></div><div id=res>${resH()}</div>`]};

const favsV=()=>['المفضلة',`<h2>⭐ المفضلة</h2>${S.cons.some(c=>c.fav)?list(S.cons.filter(c=>c.fav)):'<p class=empty>لا توجد مفضلة بعد. اضغط ☆ على أي جهة لإضافتها.</p>'}<h2>🆕 أضيفت حديثًا</h2>${list([...S.cons].sort((a,b)=>b.created-a.created).slice(0,10),0)}`];

const catsV=()=>{const row=(c,sub)=>`<div class="mrow${sub?' sub':''}"><a href="#/cat/${c.id}">${c.icon||''} ${esc(c.name)}</a><span><button data-act=mv data-id="${c.id}" data-d=-1 aria-label="أعلى">▲</button><button data-act=mv data-id="${c.id}" data-d=1 aria-label="أسفل">▼</button><button data-act=ren data-id="${c.id}" aria-label="إعادة تسمية">✏️</button>${sub?'':`<button data-act=addsub data-id="${c.id}" aria-label="تصنيف فرعي">＋</button>`}<button data-act=delcat data-id="${c.id}" aria-label="حذف">🗑️</button></span></div>`;
 return ['التصنيفات',`<button class="pri wide" data-act=addcat>＋ تصنيف جديد</button>`+S.cats.filter(c=>!c.parent).map(c=>row(c)+S.cats.filter(x=>x.parent==c.id).map(s=>row(s,1)).join('')).join('')]};

const detV=id=>{const c=S.cons.find(x=>x.id==id);if(!c)return nf();
 const R=(l,v)=>v?`<p><small class=mut>${l}</small><br>${esc(v)}</p>`:'',ks=c.cats.map(cat).filter(Boolean);
 return [c.name,`<section class=card><div class=row><h2 style="flex:1;margin:0">${esc(c.name)}</h2><button class=ic data-act=fav data-id="${c.id}" aria-label="مفضلة">${c.fav?'★':'☆'}</button></div>`
 +c.phones.map(p=>{const n=K.norm(p.n);return `<div class=ph2><span><span dir=ltr>${esc(p.n)}</span><br><small class=mut>${LBL[p.l]||''}</small></span><span class=acts><a class=btn href="tel:${n}" aria-label="اتصال">📞</a><a class=btn href="sms:${n}" aria-label="رسالة">💬</a><button data-act=copy data-v="${esc(p.n)}" aria-label="نسخ الرقم">📋</button></span></div>`}).join('')
 +(c.email?`<p><a href="mailto:${esc(c.email)}" dir=ltr>${esc(c.email)}</a></p>`:'')+R('الشركة',c.company)+R('المهنة',c.job)+R('العنوان',c.address)+R('ملاحظات',c.notes)
 +(ks.length?`<p>${ks.map(k=>`<a class=chip href="#/cat/${k.id}">${esc(k.name)}</a>`).join('')}</p>`:'')
 +`<small class=mut>أضيفت: ${fmt(c.created)} · آخر تعديل: ${fmt(c.updated)}</small></section><div class=acts><button class=pri data-act=edit data-id="${c.id}">✏️ تعديل</button>${navigator.share?`<button data-act=share data-id="${c.id}">📤 مشاركة</button>`:''}<button class=dng data-act=del data-id="${c.id}">🗑️ حذف</button></div>`]};

const setV=()=>['الإعدادات',`<section class=card><label>المظهر<select id=st class=in><option value=light${S.theme=='light'?' selected':''}>فاتح</option><option value=dark${S.theme=='dark'?' selected':''}>داكن</option></select></label><p class=mut>واجهة التطبيق عربية في هذه النسخة.</p></section>
<section class=card><h2>النسخ الاحتياطي</h2><button class=wide data-act=exp>⬇ تصدير الجهات والتصنيفات (JSON)</button><label class="btn wide">⬆ استيراد نسخة احتياطية<input type=file id=imp accept=".json,application/json" hidden></label><button class=wide data-act=impPhone>📲 استيراد من جهات الهاتف</button><a class="btn wide" href="#/cats">🗂️ إدارة التصنيفات</a></section>
<section class=card><h2>الخصوصية</h2><p>تُحفظ بياناتك داخل متصفح هذا الجهاز فقط (IndexedDB). لا يُرسل شيء إلى أي خادم، ولا توجد إحصاءات أو تتبّع. قد تُفقد البيانات إذا مسحت بيانات المتصفح أو الموقع، لذا صدّر نسخة احتياطية بانتظام. لا تتم المزامنة بين الأجهزة تلقائيًا. لا يقرأ التطبيق سجل المكالمات، ولا يصل إلى جهات الهاتف إلا حين تختارها أنت.</p></section>
<section class=card><button class="dng wide" data-act=wipe>🗑 مسح كل بيانات التطبيق</button></section>
<section class=card><h2>حول التطبيق</h2><p>M-Tantny Contacts — الإصدار 1.0. الاتصال والرسائل تُسلَّم إلى تطبيق الهاتف عبر tel: و sms:.</p></section>`];

/* ---------- Contact form ---------- */
const phRow=p=>`<div class=ph><input class="in pn" type=tel inputmode=tel dir=ltr placeholder="رقم الهاتف" value="${esc(p.n)}"><select class=pl aria-label="نوع الرقم">${Object.entries(LBL).map(([v,l])=>`<option value=${v}${v==p.l?' selected':''}>${l}</option>`).join('')}</select><button type=button class=ic data-act=rmph aria-label="حذف الرقم">✕</button></div>`;
function form(id,cid){
 const c=id?S.cons.find(x=>x.id==id):{name:'',phones:[],cats:cid?[cid]:[]};
 const L=(l,n,v,x='')=>`<label>${l}<input class=in name=${n} value="${esc(v)}" ${x}></label>`;
 modal(`<form id=cf><h2>${id?'تعديل جهة اتصال':'جهة اتصال جديدة'}</h2>${L('الاسم الكامل *','name',c.name,'required maxlength=80')}<div id=ph>${(c.phones.length?c.phones:[{n:'',l:'mobile'}]).map(phRow).join('')}</div><button type=button data-act=addph>＋ رقم آخر</button>${L('البريد الإلكتروني','email',c.email,'type=email dir=ltr')}${L('الشركة / مكان العمل','company',c.company)}${L('المهنة','job',c.job)}${L('العنوان','address',c.address)}<label>ملاحظات<textarea name=notes rows=3>${esc(c.notes)}</textarea></label><fieldset><legend>التصنيفات (يمكن اختيار أكثر من واحد)</legend>${S.cats.filter(k=>!k.parent).map(p=>`<div><b>${p.icon} ${esc(p.name)}</b><div>${[p,...S.cats.filter(k=>k.parent==p.id)].map(k=>`<label class=chip><input type=checkbox name=cat value="${k.id}"${c.cats.includes(k.id)?' checked':''}><span>${esc(k.name)}</span></label>`).join('')}</div></div>`).join('')}</fieldset><div class=acts><button class=pri>حفظ</button><button type=button data-act=close>إلغاء</button></div></form>`);
 $('#cf').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),g=k=>(f.get(k)||'').trim();
  const phones=[...document.querySelectorAll('#ph .ph')].map(r=>({n:r.querySelector('.pn').value.trim(),l:r.querySelector('.pl').value})).filter(p=>K.digits(p.n).length>=3);
  if(!phones.length)return toast('أدخل رقم هاتف صالحًا',1);
  await K.save({...c,name:g('name'),phones,email:g('email'),company:g('company'),job:g('job'),address:g('address'),notes:g('notes'),cats:f.getAll('cat')});
  close();await reload();route();toast('تم الحفظ')};
}

/* ---------- Actions ---------- */
A.close=close;
A.add=(_,b)=>form(null,b?.dataset?.cat);
A.edit=id=>form(id);
A.addph=()=>$('#ph').insertAdjacentHTML('beforeend',phRow({n:'',l:'mobile'}));
A.rmph=(_,b)=>b.parentElement.remove();
A.fav=async id=>{const c=S.cons.find(x=>x.id==id);c.fav=!c.fav;await K.save(c);route()};
A.copy=async(_,b)=>{try{await navigator.clipboard.writeText(b.dataset.v);toast('تم نسخ الرقم')}catch{toast('تعذّر النسخ',1)}};
A.share=async id=>{const c=S.cons.find(x=>x.id==id);try{await navigator.share({title:c.name,text:c.name+'\n'+c.phones.map(p=>p.n).join('\n')})}catch{}};
A.del=async id=>{if(await ask('حذف جهة الاتصال نهائيًا؟','حذف',1)){await K.remove(id);await reload();location.hash='#/contacts';toast('تم الحذف')}};
A.addcat=async()=>{const n=await inp('اسم التصنيف الجديد');if(n){await C.add(n);await reload();route()}};
A.addsub=async id=>{const n=await inp('اسم التصنيف الفرعي');if(n){await C.add(n,id);await reload();route()}};
A.ren=async id=>{const c=cat(id),n=await inp('الاسم الجديد',c.name);if(n){await C.rename(c,n);await reload();route()}};
A.mv=async(id,b)=>{await C.move(S.cats,id,+b.dataset.d);await reload();route()};
A.delcat=id=>{const c=cat(id),ids=[id,...S.cats.filter(k=>k.parent==id).map(k=>k.id)],n=S.cons.filter(x=>x.cats.some(k=>ids.includes(k))).length;
 modal(`<h2>حذف «${esc(c.name)}»</h2><p>سيُحذف التصنيف وتصنيفاته الفرعية. جهات الاتصال (${n}) لن تُحذف.</p><label>انقل جهاتها إلى<select id=mt class=in><option value="">بدون تصنيف</option>${S.cats.filter(k=>!ids.includes(k.id)).map(k=>`<option value="${k.id}">${k.parent?'— ':''}${esc(k.name)}</option>`).join('')}</select></label><div class=acts><button class=dng id=ok>حذف التصنيف</button><button id=no>إلغاء</button></div>`);
 $('#no').onclick=close;
 $('#ok').onclick=async()=>{await C.remove(id,$('#mt').value,S.cats,S.cons);close();await reload();route();toast('تم حذف التصنيف')}};
A.exp=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({app:'m-tantny-contacts',v:1,at:new Date().toISOString(),contacts:S.cons,cats:S.cats,settings:{theme:S.theme}},null,1)],{type:'application/json'}));a.download=`m-tantny-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),9e3);toast('بدأ تنزيل النسخة الاحتياطية')};
A.wipe=async()=>{if(await ask('سيتم حذف كل الجهات والتصنيفات والإعدادات من هذا الجهاز نهائيًا. لا يمكن التراجع.','حذف كل شيء',1)){await clear();S.theme='light';setTheme();await C.seed();await reload();location.hash='#/home';route();toast('تم مسح البيانات')}};
A.impPhone=async()=>{
 if(!K.canPick())return modal(`<h2>غير مدعوم في هذا المتصفح</h2><p>اختيار جهات الهاتف يعمل غالبًا في Chrome على أندرويد عبر اتصال آمن (HTTPS). لم يتم استيراد أي شيء. يمكنك إضافة الجهات يدويًا أو استيراد نسخة احتياطية من الإعدادات.</p><div class=acts><button class=pri data-act=add>＋ إضافة يدويًا</button><button data-act=close>إغلاق</button></div>`);
 let r;try{r=await K.pick(new Set(S.cons.flatMap(c=>c.phones.map(p=>K.digits(p.n)))))}catch(e){return e.name=='AbortError'||toast('تعذّر فتح جهات الاتصال',1)}
 if(!r.length)return toast('لم تُختَر أي جهة صالحة (الاسم والرقم مطلوبان)',1);
 modal(`<h2>معاينة الاستيراد</h2><p class=mut>اختر ما تريد حفظه. الجهات المكررة غير محددة مسبقًا.</p><div id=pv>${r.map((x,i)=>`<label class=chip><input type=checkbox value=${i}${x.dup?'':' checked'}><span>${esc(x.name)} <small dir=ltr>${esc(x.phones[0].n)}</small>${x.dup?' (مكررة)':''}</span></label>`).join('')}</div><div class=acts><button class=pri id=ok>حفظ المحدد</button><button data-act=close>إلغاء</button></div>`);
 $('#ok').onclick=async()=>{const ch=[...document.querySelectorAll('#pv input:checked')];for(const i of ch){const {dup,...x}=r[i.value];await K.save({...x,cats:[],fav:false})}close();await reload();route();toast(`تم حفظ ${ch.length} جهة`)}};

async function importFile(file){
 let d;try{d=JSON.parse(await file.text())}catch{return toast('الملف ليس نسخة احتياطية صالحة',1)}
 const er=K.validate(d);if(er)return toast('ملف غير صالح: '+er,1);
 if(!await ask(`سيتم استبدال كل بياناتك الحالية (${S.cons.length} جهة) بـ ${d.contacts.length} جهة من الملف. هل تريد المتابعة؟`,'استبدال',1))return;
 await clear();await bulk('contacts',d.contacts);await bulk('cats',d.cats);await put('meta',{k:'seeded'});
 S.theme=d.settings?.theme=='dark'?'dark':'light';await saveSet();setTheme();await reload();route();toast('تم استرجاع النسخة الاحتياطية');
}

/* ---------- Router & events ---------- */
const V={home,contacts:consV,cats:catsV,favs:favsV,settings:setV,cat:catV,c:detV};
const NAV=[['home','🏠','الرئيسية'],['contacts','👥','جهات الاتصال'],['cats','🗂️','التصنيفات'],['favs','⭐','المفضلة'],['settings','⚙️','الإعدادات']];
function route(){
 const [v0,id]=(location.hash.slice(2)||'home').split('/'),v=V[v0]?v0:'home',[ti,h]=V[v](id),on={cat:'home',c:'contacts'}[v]||v;
 $('#ttl').textContent=ti;$('#app').innerHTML=h;
 $('#nav').innerHTML=NAV.map(([k,i,l])=>`<a href="#/${k}"${k==on?' class=on aria-current=page':''}><span>${i}</span>${l}</a>`).join('');
 $('#back').hidden=!(v=='cat'||v=='c');scrollTo(0,0);
}
addEventListener('hashchange',route);
$('#back').onclick=()=>history.length>1?history.back():(location.hash='#/home');
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b)Promise.resolve(A[b.dataset.act]?.(b.dataset.id,b)).catch(()=>toast('حدث خطأ غير متوقع',1))});
document.addEventListener('input',e=>{if(e.target.id=='q'){S.q=e.target.value;$('#res').innerHTML=resH()}});
document.addEventListener('change',async e=>{const i=e.target;
 if(i.dataset.f){S.f[i.dataset.f]=i.type=='checkbox'?i.checked:i.value;$('#res').innerHTML=resH()}
 else if(i.id=='st'){S.theme=i.value;setTheme();saveSet()}
 else if(i.id=='imp'){const f=i.files[0];i.value='';if(f)await importFile(f)}});

(async()=>{try{
 await persist();
 const s=(await all('meta')).find(m=>m.k=='s');if(s)S.theme=s.theme;setTheme();
 await C.seed();await reload();route();
}catch(e){$('#app').innerHTML='<p class=empty>تعذّر فتح التخزين المحلي. قد يكون المتصفح في وضع التصفح الخفي أو التخزين معطّلًا.</p>'}})();
