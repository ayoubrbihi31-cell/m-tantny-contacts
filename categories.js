import {all,put,del,uid} from './db.js';
const D=[
['👷','المهن والحرف','#7a5c12',['البنّاؤون','النجّارون','الخيّاطون','الكهربائيون','السبّاكون','الدهّانون','الميكانيكيون','الفلاحون','الحدّادون','مهن أخرى']],
['👨‍👩‍👧','العائلة','#1d5c4d',['الوالدان','الإخوة والأخوات','الأعمام والعمّات والأخوال والخالات','أبناء العم والخال','أقارب آخرون']],
['💼','العمل','#1f3a5f',['الزملاء','المديرون','الموظفون','العملاء','شركاء العمل']],
['🏪','التجارة والأعمال','#6b2d5c',['أصحاب المحلات','الموردون','تجار الجملة','خدمات التوصيل','أعمال أخرى']],
['🩺','الصحة','#8a3b2e',['الأطباء','أطباء الأسنان','الصيدليات','العيادات','جهات صحية أخرى']],
['🤝','الأصدقاء','#2d4a7a',['أصدقاء مقرّبون','أصدقاء آخرون']],
['🚨','أرقام مهمة','#9b2c2c',['الطوارئ','الخدمات العامة','أرقام مهمة أخرى']],
['📇','جهات أخرى','#4a5568',[]]];
export async function seed(){
 if((await all('meta')).some(m=>m.k=='seeded'))return;
 let o=0;
 for(const [icon,name,color,subs] of D){const id=uid();await put('cats',{id,name,icon,color,parent:null,order:o++});for(const s of subs)await put('cats',{id:uid(),name:s,parent:id,order:o++})}
 await put('meta',{k:'seeded'});
}
export const list=()=>all('cats').then(a=>a.sort((x,y)=>x.order-y.order));
export const add=(name,parent=null)=>put('cats',{id:uid(),name,icon:parent?'':'📁',color:'#1f3a5f',parent,order:Date.now()});
export const rename=(c,name)=>put('cats',{...c,name});
export async function move(cats,id,d){
 const c=cats.find(x=>x.id==id),sib=cats.filter(x=>x.parent==c.parent),o=sib[sib.indexOf(c)+d];
 if(!o)return;[c.order,o.order]=[o.order,c.order];await put('cats',c);await put('cats',o);
}
// Removes a category and its subcategories. Contacts are kept: moved to `to`, or left uncategorized.
export async function remove(id,to,cats,cons){
 const ids=[id,...cats.filter(k=>k.parent==id).map(k=>k.id)];
 for(const c of cons)if(c.cats.some(k=>ids.includes(k))){c.cats=[...new Set(c.cats.filter(k=>!ids.includes(k)).concat(to||[]))];await put('contacts',c)}
 for(const k of ids)await del('cats',k);
}
