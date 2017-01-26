
//don't use this in production
var cacheName = 'weatherPWA-step-8-1';
var dataCacheName = 'weatherData-v4';

var filesToCache = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/styles/inline.css',
  '/images/clear.png',
  '/images/cloudy-scattered-showers.png',
  '/images/cloudy.png',
  '/images/fog.png',
  '/images/ic_add_white_24px.svg',
  '/images/ic_refresh_white_24px.svg',
  '/images/partly-cloudy.png',
  '/images/rain.png',
  '/images/scattered-showers.png',
  '/images/sleet.png',
  '/images/snow.png',
  '/images/thunderstorm.png',
  '/images/wind.png'
];

self.addEventListener('install', function(e) {
	console.log('[ServiceWorker] Install');
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			console.log('[ServiceWorker] Caching app shell');
			return cache.addAll(filesToCache);
		})
	);
});

self.addEventListener('activate', function(e) {
	// ensures service worker updates cache
	console.log('[ServiceWorker] Activate');
	e.waitUntil(
		caches.keys().then(function(keyList) {
			return Promise.all(keyList.map(function(key) {
				if (key !== cacheName && key !== dataCacheName) {
					console.log('[ServiceWorker] Removing old cache', key);
					return caches.delete(key);
				}
		}));
	})
	);
	// causes an activated service worker to take control immediately rather than after next navigation
	return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
	// allows us to intercept requests and handle them with the service worker
	// specifically, lets us grab responses from the cache
	// look at sw-precache to handle when to go to the network, and when to update the cache
	// **unregistering a service worker does not clear the cache
	console.log('[ServiceWorker] Fetch', e.request.url);
	var dataUrl = 'https://query.yahooapis.com/v1/public/yql';

	if (e.request.url.indexOf(dataUrl) > -1) {
		// handle requests to the weather api separately - always cache what we get back from the network
		e.respondWith(
			caches.open(dataCacheName).then(function(cache) {
				return fetch(e.request).then(function(response) {
					cache.put(e.request.url, response.clone());
					return response;
				});
			})
		);
	}
	else {
		e.respondWith(
			caches.match(e.request).then(function(response) {
				return response || fetch(e.request);
			})
		);
	}
});
