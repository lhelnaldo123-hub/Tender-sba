/* TSCS SBA - install/offline helper for OLD phones (works on Chrome 70).
   Only controls sba.html. Change V when you upload a new sba.html. */
var V="sba-legacy-v1";
var CORE=["./sba.html","./sba-manifest.json","./Screenshot_20261030-124739.png"];
var HOSTS=["www.gstatic.com","fonts.googleapis.com","fonts.gstatic.com","cdnjs.cloudflare.com"];

self.addEventListener("install",function(e){
  e.waitUntil(caches.open(V).then(function(c){
    return Promise.all(CORE.map(function(u){return c.add(u).catch(function(){})}));
  }).then(function(){return self.skipWaiting()}));
});

self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.filter(function(x){return x!==V&&x.indexOf("sba-legacy")===0}).map(function(x){return caches.delete(x)}));
  }).then(function(){return self.clients.claim()}));
});

self.addEventListener("fetch",function(e){
  var r=e.request;
  if(r.method!=="GET")return;
  var u=new URL(r.url);
  if(u.origin!==location.origin&&HOSTS.indexOf(u.hostname)<0)return; /* login and school data are never cached here */
  if(r.mode==="navigate"){
    e.respondWith(fetch(r).then(function(x){
      var c=x.clone();caches.open(V).then(function(h){h.put("./sba.html",c)});return x;
    }).catch(function(){return caches.match("./sba.html")}));
    return;
  }
  e.respondWith(caches.open(V).then(function(c){
    return c.match(r).then(function(hit){
      var net=fetch(r).then(function(x){if(x&&(x.ok||x.type==="opaque"))c.put(r,x.clone());return x}).catch(function(){return hit});
      return hit||net;
    });
  }));
});
