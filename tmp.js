goog.module('index'); exports = {}; var module = {id: 'index.js'};/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(function () {
        console.log('service worker is is all cool.');
    }).catch(function (e) {
        console.error('service worker is not so cool.', e);
        throw e;
    });
    if (navigator.serviceWorker.controller) {
        // Correctly prompt the user to reload during SW phase change.
        navigator.serviceWorker.controller.onstatechange = (e) => {
            if (((e.target)).state === 'redundant') {
                ((((document.querySelector('#reload-prompt'))))).classList.remove('hidden');
            }
        };
    }
}
// thx https://github.com/Modernizr/Modernizr/blob/master/feature-detects/pointerevents.js
const /** @type {?} */ USE_POINTER_EVENTS = 'onpointerdown' in document.createElement('div');
let /** @type {?} */ velocity = 0;
const /** @type {?} */ ac = new (typeof webkitAudioContext !== 'undefined' ? webkitAudioContext : AudioContext)();
const /** @type {?} */ masterVolume = ac.createGain();
masterVolume.connect(ac.destination);
const /** @type {?} */ appState = {
    pickerOpen: false,
    spinner: window.localStorage.getItem('fidget_spinner') || './assets/spinners/base.png',
    muted: window.localStorage.getItem('fidget_muted') === 'true' ? true : false,
    spins: window.localStorage.getItem('fidget_spins') ? parseInt(/** @type {?} */ ((window.localStorage.getItem('fidget_spins'))), 10) : 0,
    maxVelocity: window.localStorage.getItem('fidget_max_velocity') ? parseInt(/** @type {?} */ ((window.localStorage.getItem('fidget_max_velocity'))), 10) : 0
};
const /** @type {?} */ spinners = [
    {
        path: './assets/spinners/base.png',
        name: 'The Classic',
        unlockedAt: 0
    },
    {
        path: './assets/spinners/triple.png',
        name: 'The Triple',
        unlockedAt: 500
    },
    {
        path: './assets/spinners/pokeball.png',
        name: 'The \'Chu',
        unlockedAt: 2000
    },
    {
        path: './assets/spinners/cube.png',
        name: 'The Cubist',
        unlockedAt: 5000
    },
    {
        path: './assets/spinners/fractal.png',
        name: 'The Fractal',
        unlockedAt: 10000
    },
];
const /** @type {?} */ domElements = {
    turns: /** @type {?} */ ((document.getElementById('turns'))),
    velocity: /** @type {?} */ ((document.getElementById('velocity'))),
    maxVelocity: /** @type {?} */ ((document.getElementById('maxVelocity'))),
    spinner: /** @type {?} */ ((document.getElementById('spinner'))),
    traceSlow: /** @type {?} */ ((document.getElementById('trace-slow'))),
    traceFast: /** @type {?} */ ((document.getElementById('trace-fast'))),
    toggleAudio: /** @type {?} */ ((document.getElementById('toggle-audio'))),
    spinners: /** @type {?} */ (Array.from(/** @type {?} */ ((document.getElementsByClassName('spinner'))))),
    pickerToggle: /** @type {?} */ ((document.getElementById('picker'))),
    pickerPane: /** @type {?} */ ((document.getElementById('spinner-picker')))
};
let /** @type {?} */ fidgetAlpha = 0;
let /** @type {?} */ fidgetSpeed = 0;
/**
 * @param {?} fn
 * @return {?}
 */
function deferWork(fn) {
    if ((typeof requestIdleCallback) !== 'undefined') {
        requestIdleCallback(fn, { timeout: 60 });
    }
    else if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(fn);
    }
    else {
        setTimeout(fn, 16.66);
    }
}
/**
 * @return {?}
 */
function stats() {
    velocity = Math.abs(fidgetSpeed * 60 /* fps */ * 60 /* sec */ / 2 / Math.PI) | 0;
    const /** @type {?} */ newMaxVelocity = Math.max(velocity, appState.maxVelocity);
    if (appState.maxVelocity !== newMaxVelocity) {
        deferWork(() => window.localStorage.setItem('fidget_max_velocity', `${appState.maxVelocity}`));
        appState.maxVelocity = newMaxVelocity;
    }
    appState.spins += Math.abs(fidgetSpeed / 2 / Math.PI);
    deferWork(() => window.localStorage.setItem('fidget_spins', `${appState.spins}`));
    const /** @type {?} */ turnsText = appState.spins.toLocaleString(undefined, { maximumFractionDigits: 0 });
    const /** @type {?} */ maxVelText = appState.maxVelocity.toLocaleString(undefined, { maximumFractionDigits: 1 });
    domElements.turns.textContent = `${turnsText}`;
    domElements.velocity.textContent = `${velocity}`;
    domElements.maxVelocity.textContent = `${maxVelText}`;
}
const /** @type {?} */ spinnerPos = domElements.spinner.getBoundingClientRect();
const /** @type {?} */ centerX = spinnerPos.left + spinnerPos.width / 2;
const /** @type {?} */ centerY = spinnerPos.top + spinnerPos.height / 2;
const /** @type {?} */ centerRadius = spinnerPos.width / 10;
//
// Spin code
//
const /** @type {?} */ touchInfo = { alpha: 0, radius: 0, down: false };
let /** @type {?} */ touchSpeed = 0;
let /** @type {?} */ lastTouchAlpha = 0;
/**
 * @param {?} e
 * @return {?}
 */
function getXYFromTouchOrPointer(e) {
    let /** @type {?} */ x = 'touches' in e ? ((e)).touches[0].clientX : ((e)).clientX;
    let /** @type {?} */ y = 'touches' in e ? ((e)).touches[0].clientY : ((e)).clientY;
    return { x: x - centerX, y: y - centerY };
}
/**
 * @param {?} e
 * @return {?}
 */
function onTouchStart(e) {
    if (appState.pickerOpen) {
        return;
    }
    let { x, y } = getXYFromTouchOrPointer(e);
    onTouchMove(e);
    touchInfo.down = true;
    touchInfo.radius = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    lastTouchAlpha = touchInfo.alpha;
}
/**
 * @param {?} e
 * @return {?}
 */
function onTouchMove(e) {
    if (appState.pickerOpen) {
        return;
    }
    let { x, y } = getXYFromTouchOrPointer(e);
    touchInfo.alpha = Math.atan2(x, y);
    e.preventDefault();
}
/**
 * @return {?}
 */
function touchEnd() {
    if (appState.pickerOpen) {
        return;
    }
    touchInfo.down = false;
}
/**
 * @return {?}
 */
function tick() {
    requestAnimationFrame(() => {
        if (touchInfo.down) {
            if (touchInfo.radius > centerRadius) {
                touchSpeed = touchInfo.alpha - lastTouchAlpha;
                if (touchSpeed < -Math.PI)
                    touchSpeed += 2 * Math.PI;
                if (touchSpeed > Math.PI)
                    touchSpeed -= 2 * Math.PI;
                fidgetSpeed = touchSpeed;
                lastTouchAlpha = touchInfo.alpha;
            }
        }
        else if (touchSpeed) {
            fidgetSpeed = touchSpeed * touchInfo.radius / centerRadius;
            touchSpeed = 0;
        }
        fidgetAlpha -= fidgetSpeed;
        domElements.spinner.style.transform = `rotate(${fidgetAlpha}rad)`;
        domElements.traceSlow.style.opacity = Math.abs(fidgetSpeed) > 0.2 ? '1' : '0.00001';
        domElements.traceFast.style.opacity = Math.abs(fidgetSpeed) > 0.4 ? '1' : '0.00001';
        stats();
        // Slow down over time
        fidgetSpeed = fidgetSpeed * 0.99;
        fidgetSpeed = Math.sign(fidgetSpeed) * Math.max(0, (Math.abs(fidgetSpeed) - 2e-4));
        const /** @type {?} */ soundMagnitude = Math.abs(velocity * Math.PI / 60);
        if (soundMagnitude && !touchInfo.down) {
            spinSound(soundMagnitude);
            spinSound2(soundMagnitude);
        }
        tick();
    });
}
//
// Audio code
//
let /** @type {?} */ endPlayTime = -1;
let /** @type {?} */ endPlayTime2 = -1;
/**
 * @record
 */
function rangeArgs() { }
/** @type {?} */
rangeArgs.prototype.inputMin;
/** @type {?} */
rangeArgs.prototype.inputMax;
/** @type {?} */
rangeArgs.prototype.outputFloor;
/** @type {?} */
rangeArgs.prototype.outputCeil;
;
/**
 * @param {?} args
 * @return {?}
 */
function generateRange(args) {
    return function (x) {
        const /** @type {?} */ outputRange = args.outputCeil - args.outputFloor;
        const /** @type {?} */ inputPct = (x - args.inputMin) / (args.inputMax - args.inputMin);
        return args.outputFloor + (inputPct * outputRange);
    };
}
const /** @type {?} */ freqRange400_2000 = generateRange({
    inputMin: 0,
    inputMax: 80,
    outputFloor: 400,
    outputCeil: 2000
});
const /** @type {?} */ freqRange300_1500 = generateRange({
    inputMin: 0,
    inputMax: 80,
    outputFloor: 300,
    outputCeil: 1500
});
const /** @type {?} */ easeOutQuad = (t) => t * (2 - t);
/**
 * @param {?} magnitude
 * @return {?}
 */
function spinSound(magnitude) {
    // automation start time
    let /** @type {?} */ time = ac.currentTime;
    const /** @type {?} */ freqMagnitude = magnitude;
    magnitude = Math.min(1, magnitude / 10);
    let /** @type {?} */ x = (easeOutQuad(magnitude) * 1.1) - (0.6 - (0.6 * easeOutQuad(magnitude)));
    if (time + x - easeOutQuad(magnitude) < endPlayTime) {
        return;
    }
    const /** @type {?} */ osc = ac.createOscillator();
    const /** @type {?} */ gain = ac.createGain();
    // enforce range
    magnitude = Math.min(1, Math.max(0, magnitude));
    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(masterVolume);
    // max of 40 boops
    //const count = 6 + ( 1 * magnitude );
    // decay constant for frequency between each boop
    //const decay = 0.97;
    // starting frequency (min of 400, max of 900)
    let /** @type {?} */ freq = freqRange400_2000(freqMagnitude);
    // boop duration (longer for lower magnitude)
    let /** @type {?} */ dur = 0.1 * (1 - magnitude / 2);
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.linearRampToValueAtTime(freq * 1.8, time += dur);
    endPlayTime = time + dur;
    // fade out the last boop
    gain.gain.setValueAtTime(0.1, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0, endPlayTime);
    // play it
    osc.start(ac.currentTime);
    osc.stop(endPlayTime);
}
/**
 * @param {?} magnitude
 * @return {?}
 */
function spinSound2(magnitude) {
    // automation start time
    let /** @type {?} */ time = ac.currentTime;
    const /** @type {?} */ freqMagnitude = magnitude;
    magnitude = Math.min(1, magnitude / 10);
    let /** @type {?} */ x = (easeOutQuad(magnitude) * 1.1) - (0.3 - (0.3 * easeOutQuad(magnitude)));
    if (time + x - easeOutQuad(magnitude) < endPlayTime2) {
        return;
    }
    const /** @type {?} */ osc = ac.createOscillator();
    const /** @type {?} */ gain = ac.createGain();
    // enforce range
    magnitude = Math.min(1, Math.max(0, magnitude));
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(masterVolume);
    var /** @type {?} */ freq = freqRange300_1500(freqMagnitude);
    // boop duration (longer for lower magnitude)
    var /** @type {?} */ dur = 0.05 * (1 - magnitude / 2);
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.linearRampToValueAtTime(freq * 1.8, time += dur);
    endPlayTime2 = time + dur;
    // fade out the last boop
    gain.gain.setValueAtTime(0.15, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0, endPlayTime2);
    // play it
    osc.start(ac.currentTime);
    osc.stop(endPlayTime2);
}
/**
 * @return {?}
 */
function unlockAudio() {
    /**
     * @return {?}
     */
    function unlock() {
        // Create an empty buffer.
        const /** @type {?} */ source = ac.createBufferSource();
        source.buffer = ac.createBuffer(1, 1, 22050);
        ;
        source.connect(ac.destination);
        // Play the empty buffer.
        if (typeof source.start === 'undefined') {
            ((source)).noteOn(0);
        }
        else {
            source.start(0);
        }
        // Setup a timeout to check that we are unlocked on the next event loop.
        source.onended = function () {
            source.disconnect(0);
            // Remove the touch start listener.
            document.removeEventListener('touchend', unlock, true);
        };
    }
    document.addEventListener('touchend', unlock, true);
}
/**
 * @param {?} muted
 * @return {?}
 */
function setMutedSideEffects(muted) {
    domElements.toggleAudio.classList.toggle('muted', muted);
    masterVolume.gain.setValueAtTime(appState.muted ? 0 : 1, ac.currentTime);
    window.localStorage.setItem('fidget_muted', `${appState.muted}`);
}
/**
 * @return {?}
 */
function togglePicker() {
    if (appState.pickerOpen !== true) {
        appState.pickerOpen = !appState.pickerOpen;
        history.pushState(appState, '', '#picker');
        showPicker();
    }
    else {
        history.back();
    }
}
/**
 * @param {?} e
 * @return {?}
 */
function toggleAudio(e) {
    appState.muted = !appState.muted;
    setMutedSideEffects(appState.muted);
    // if something is spinning, we do not want to stop it if you touch the menu.
    e.stopPropagation();
}
/**
 * @param {?} src
 * @return {?}
 */
function changeSpinner(src) {
    appState.spinner = src;
    deferWork(() => window.localStorage.setItem('fidget_spinner', src));
    for (let /** @type {?} */ s of domElements.spinners) {
        s.src = src;
    }
}
/**
 * @param {?} e
 * @return {?}
 */
function pickSpinner(e) {
    const /** @type {?} */ target = (e.target);
    if (target.tagName === 'IMG' && !target.classList.contains('locked')) {
        changeSpinner(((e.target)).src);
        togglePicker();
    }
}
/**
 * @return {?}
 */
function showPicker() {
    domElements.pickerPane.innerHTML = '';
    let /** @type {?} */ toAppend = '';
    for (let /** @type {?} */ spinner of spinners) {
        toAppend += `<li><p class="title">${spinner.name}</p>`;
        if (spinner.unlockedAt > appState.spins) {
            toAppend += `<img width="300" height="300" class="locked" src="${spinner.path}"><p class="locked-info">Unlocks at ${spinner.unlockedAt} spins</p>`;
        }
        else {
            toAppend += `<img width="300" height="300" src="${spinner.path}">`;
        }
        toAppend += '</li>';
    }
    domElements.pickerPane.innerHTML = toAppend;
    domElements.pickerPane.classList.remove('hidden');
    domElements.pickerPane.scrollTop = 0;
}
(async () => {
    setMutedSideEffects(appState.muted);
    unlockAudio();
    tick();
    const /** @type {?} */ listenFor = (document.addEventListener);
    domElements.pickerToggle.addEventListener(USE_POINTER_EVENTS ? 'pointerdown' : 'touchstart', togglePicker);
    domElements.pickerPane.addEventListener('click', pickSpinner);
    domElements.toggleAudio.addEventListener(USE_POINTER_EVENTS ? 'pointerdown' : 'touchstart', toggleAudio);
    listenFor(USE_POINTER_EVENTS ? 'pointerdown' : 'touchstart', onTouchStart, { passive: false });
    listenFor(USE_POINTER_EVENTS ? 'pointermove' : 'touchmove', onTouchMove, { passive: false });
    listenFor(USE_POINTER_EVENTS ? 'pointerup' : 'touchend', touchEnd);
    listenFor(USE_POINTER_EVENTS ? 'pointercancel' : 'touchcancel', touchEnd);
    // Assume clean entry always.
    history.replaceState(null, '', '/');
    changeSpinner(appState.spinner);
    window.onpopstate = (e) => {
        // Assume if state is not set here picker is going to need to close.
        if (e.state === null) {
            appState.pickerOpen = false;
            domElements.pickerPane.classList.add('hidden');
            // Assume if state is set here picker is going to need to open.
        }
        else if (e.state !== null) {
            appState.pickerOpen = true;
            showPicker();
        }
    };
})();
//# sourceMappingURL=data:application/json;base64,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