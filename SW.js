/* TSCS SBA – offline support. Change VERSION whenever you upload a new index.html. */
const VERSION="tscs-sba-v1";
const CORE=["./","./index.html","./manifest.json","./Screenshot_20261030-124739.png",
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js",
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js",
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"];
const HOSTS=["www.gstatic.com","fonts.googleapis.com","fonts.gstatic.com"];

self.addEventListener("install",e=>{
 e.waitUntil(caches.open(VERSION).then(c=>Promise.allSettled(CORE.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});

self.addEventListener("activate",e=>{
 e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});

self.addEventListener("fetch",e=>{
 const r=e.request;if(r.method!=="GET")return;
 const u=new URL(r.url),same=u.origin===location.origin;
 if(!same&&!HOSTS.includes(u.hostname))return; /* Firebase data/login calls are never cached here */
 if(r.mode==="navigate"){
  e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(VERSION).then(h=>h.put("./index.html",c));return x}).catch(()=>caches.match("./index.html").then(x=>x||caches.match("./"))));return}
 e.respondWith(caches.open(VERSION).then(async c=>{
  const hit=await c.match(r);
  const net=fetch(r).then(x=>{if(x&&(x.ok||x.type==="opaque"))c.put(r,x.clone());return x}).catch(()=>hit);
  return hit||net}))});
