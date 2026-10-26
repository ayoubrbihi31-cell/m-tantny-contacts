// All storage goes through these functions, so a future cloud-sync layer can replace them.
const S=['contacts','cats','meta'];let D;
export const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
const open=()=>D||(D=new Promise((ok,no)=>{const r=indexedDB.open('mtantny',1);r.onupgradeneeded=()=>S.forEach(s=>r.result.createObjectStore(s,{keyPath:s=='meta'?'k':'id'}));r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}));
const tx=async(s,m,f)=>{const d=await open();return new Promise((ok,no)=>{const t=d.transaction(s,m),q=f(t.objectStore(s));t.oncomplete=()=>ok(q&&q.result);t.onerror=t.onabort=()=>no(t.error)})};
export const all=s=>tx(s,'readonly',o=>o.getAll());
export const put=(s,v)=>tx(s,'readwrite',o=>o.put(v));
export const del=(s,k)=>tx(s,'readwrite',o=>o.delete(k));
export const bulk=(s,a)=>tx(s,'readwrite',o=>{a.forEach(v=>o.put(v))});
export const clear=async()=>{for(const s of S)await tx(s,'readwrite',o=>o.clear())};
export const persist=()=>navigator.storage?.persist?.().catch(()=>false);
