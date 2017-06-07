goog.module('disabled_sw'); exports = {}; var module = {id: 'disabled_sw.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @record
 */
function ExtendableEvent() { }
/** @type {?} */
ExtendableEvent.prototype.waitUntil;
/** @type {?} */
ExtendableEvent.prototype.respondWith;
/** @type {?} */
ExtendableEvent.prototype.request;
var /** @type {?} */ VERSION = '13';
this.addEventListener('install', (e) => e.waitUntil(swInstall()));
this.addEventListener('activate', (e) => e.waitUntil(swActivate()));
this.addEventListener('fetch', (e) => e.respondWith(swFetch(e)));
/**
 * @return {?}
 */
async function swInstall() {
    const /** @type {?} */ rs = await fetch('./bundle.txt');
    const /** @type {?} */ body = await rs.text();
    const /** @type {?} */ cache = await caches.open(VERSION);
    await cache.addAll(body.trim().split('\n'));
    await this.skipWaiting();
}
/**
 * @return {?}
 */
async function swActivate() {
    const /** @type {?} */ keys = await caches.keys();
    let /** @type {?} */ deletes = [];
    for (var /** @type {?} */ key of keys) {
        if (key !== VERSION)
            deletes.push(caches.delete(key));
    }
    await Promise.all(deletes);
    await this.clients.claim();
}
/**
 * @param {?} e
 * @return {?}
 */
async function swFetch(e) {
    var /** @type {?} */ networkFetch = fetchFromNetworkAndCache(e);
    const /** @type {?} */ cache = await caches.open(VERSION);
    const /** @type {?} */ response = await cache.match(e.request);
    if (response)
        return response;
    return networkFetch;
}
/**
 * @param {?} e
 * @return {?}
 */
async function fetchFromNetworkAndCache(e) {
    if (new URL(e.request.url).origin !== location.origin) {
        return new Response(new Blob(), { "status": 404, "statusText": "Not found" });
    }
    const /** @type {?} */ res = await fetch(e.request);
    if (!res.url) {
        // foreign requests will be res.type === 'opaque' and missing a url
        return res;
    }
    const /** @type {?} */ cache = await caches.open(VERSION);
    // TODO: figure out if the content is new and therefore the page needs a reload.
    cache.put(e.request, res.clone());
    return res;
}
//# sourceMappingURL=data:application/json;base64,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