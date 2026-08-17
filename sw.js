const CACHE = "kine-sport-v5";
const ASSETS = [];
const EXTERNAL_APIS = ["eutils.ncbi.nlm.nih.gov", "ebi.ac.uk", "semanticscholar.org", "altmetric.com", "reddit.com", "mymemory.translated.net", "unpaywall.org"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = e.request.url;
  if (EXTERNAL_APIS.some(d => url.includes(d))) return; // jamais interceptées : toujours du réseau frais

  // Tout ce qui vient de notre propre app (HTML, manifest, icônes...) : réseau en priorité,
  // pour ne jamais servir une version périmée. Le cache ne sert que de repli hors-ligne.
  e.respondWith(
    fetch(e.request)
      .then((res) => { if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone())); return res; })
      .catch(() => caches.match(e.request))
  );
});
