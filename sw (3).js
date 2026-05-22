// Core Wallet — G n I (Irene & Guster)
// https://coredigitaltools-collab.github.io/Core-Wallet-Irene.Guster/

const CACHE = 'cw-ig-v2';
const BASE = '/Core-Wallet-Irene.Guster';
const ASSETS = [BASE + '/', BASE + '/index.html', BASE + '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Draw GnI icon
async function drawIcon(size) {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const pad = size * 0.04, r = size * 0.22;
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#E8735A');
  grad.addColorStop(0.5, '#C45A9E');
  grad.addColorStop(1, '#534AB7');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(r,pad); ctx.lineTo(size-r,pad); ctx.quadraticCurveTo(size-pad,pad,size-pad,r);
  ctx.lineTo(size-pad,size-r); ctx.quadraticCurveTo(size-pad,size-pad,size-r,size-pad);
  ctx.lineTo(r,size-pad); ctx.quadraticCurveTo(pad,size-pad,pad,size-r);
  ctx.lineTo(pad,r); ctx.quadraticCurveTo(pad,pad,r,pad);
  ctx.closePath(); ctx.fill();
  // Shine
  const shine = ctx.createLinearGradient(0, 0, 0, size * 0.5);
  shine.addColorStop(0, 'rgba(255,255,255,0.18)');
  shine.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.moveTo(r,pad); ctx.lineTo(size-r,pad); ctx.quadraticCurveTo(size-pad,pad,size-pad,r);
  ctx.lineTo(size-pad,size-r); ctx.quadraticCurveTo(size-pad,size-pad,size-r,size-pad);
  ctx.lineTo(r,size-pad); ctx.quadraticCurveTo(pad,size-pad,pad,size-r);
  ctx.lineTo(pad,r); ctx.quadraticCurveTo(pad,pad,r,pad);
  ctx.closePath(); ctx.fill();
  // GnI text
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round(size * 0.38)}px Arial Black, Arial, sans-serif`;
  ctx.fillText('GnI', size / 2, size * 0.48);
  // Accent dot
  ctx.fillStyle = '#FFD4C8';
  ctx.beginPath(); ctx.arc(size*0.72, size*0.28, size*0.055, 0, Math.PI*2); ctx.fill();
  return canvas.convertToBlob({ type: 'image/png' });
}

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const path = url.pathname;

  // Serve dynamic manifest
  if (path === BASE + '/manifest.json') {
    e.respondWith(new Response(JSON.stringify({
      name: 'G n I',
      short_name: 'G n I',
      description: 'Core Wallet for Irene & Guster',
      start_url: BASE + '/',
      scope: BASE + '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#534AB7',
      theme_color: '#534AB7',
      icons: [
        { src: BASE + '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: BASE + '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: BASE + '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    }), { headers: { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'no-cache' } }));
    return;
  }

  // Serve dynamic icons
  if (path === BASE + '/icon-192.png' || path === BASE + '/icon-512.png') {
    e.respondWith((async () => {
      const size = path.includes('512') ? 512 : 192;
      const blob = await drawIcon(size);
      return new Response(blob, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-cache' } });
    })());
    return;
  }

  // Cache-first for everything else
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request)
        .then(res => {
          if (res && res.status === 200 && e.request.method === 'GET') {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
          return res;
        })
        .catch(() => caches.match(BASE + '/index.html'));
    })
  );
});
