import {all,put,del,uid} from './db.js';
export const norm=s=>String(s).replace(/[^\d+]/g,'');
export const digits=s=>String(s).replace(/\D/g,'').slice(-9);
const fold=s=>String(s||'').toLowerCase().replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
export const list=()=>all('contacts');
export async function save(c){const n=Date.now();c.id||=uid();c.created||=n;c.updated=n;c.fav=!!c.fav;await put('contacts',c);return c}
export const remove=id=>del('contacts',id);
export function search(a,q,names){
 const s=fold(q.trim()),d=q.replace(/\D/g,'');
 if(!s)return a;
 return a.filter(c=>fold([c.name,c.job,c.company,c.email,...names(c)].join(' ')).includes(s)||(d.length>2&&c.phones.some(p=>String(p.n).replace(/\D/g,'').includes(d))));
}
export function validate(d){
 if(!d||d.app!=='m-tantny-contacts'||!Array.isArray(d.contacts)||!Array.isArray(d.cats))return 'الصيغة غير معروفة';
 if(d.cats.some(k=>!k||typeof k.id!='string'||typeof k.name!='string'))return 'التصنيفات تالفة';
 if(d.contacts.some(c=>!c||typeof c.id!='string'||typeof c.name!='string'||!Array.isArray(c.phones)||!Array.isArray(c.cats)||c.phones.some(p=>!p||typeof p.n!='string')))return 'جهات الاتصال تالفة';
 return '';
}
// Contact Picker API: Chrome on Android (HTTPS) only. The user chooses the contacts each time.
export const canPick=()=>'contacts' in navigator&&'ContactsManager' in window;
export async function pick(have){
 const r=await navigator.contacts.select(['name','tel','email'],{multiple:true});
 return r.map(x=>({name:(x.name?.[0]||'').trim(),phones:[...new Set((x.tel||[]).map(n=>n.trim()))].map(n=>({n,l:'mobile'})),email:(x.email?.[0]||'').trim()}))
  .filter(x=>x.name&&x.phones.length).map(x=>({...x,dup:x.phones.some(p=>have.has(digits(p.n)))}));
}
