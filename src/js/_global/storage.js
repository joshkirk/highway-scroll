/*
	Global Storage Object
-------------------------------------------------- */
export const globalStorage = {
	"assetPath": (document.getElementById("site-data") && window.location.host.indexOf("localhost") < 0) ? document.getElementById("site-data").getAttribute("data-asset-path") : "/assets/code/",
	"firstLoad": true,
	"isMobile": false,
	"isSafari": false,
	"isChrome": false,
	"isFirefox": (navigator.userAgent.indexOf("Firefox") > -1),
	"windowHeight": "",
	"windowWidth": "",
	"transitionFinished": false,
	"queryParams": {},
	"referrer": "",
	"reducedMotion": window.matchMedia("(prefers-reduced-motion: reduce)").matches,
	"headerShowing": true
};

export const domStorage = {
	// "header": document.getElementById('header'),
	"mainEl": document.getElementById('main'),
	"containerEl": document.getElementById('container'),
	"globalMask": document.getElementById('global-mask'),
	"openMobileMenu": () => {},
	"closeMobileMenu": () => {},
	"resetMobileMenu": () => {}
}

export const ecommStorage = {
	"products": null,
	"cart": null,
	"checkout": "",
	"cartCountEls": "",
	"removingLastItem": false,
	"openMiniCart": () => {},
	"closeMiniCart": () => {},
}


// adjust storage values based on things we can determine right away
let is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
let is_safari = navigator.userAgent.indexOf("Safari") > -1;
let is_opera = navigator.userAgent.toLowerCase().indexOf("op") > -1;

if ((is_chrome)&&(is_safari)) { is_safari = false; }
if ((is_chrome)&&(is_opera)) { is_chrome = false; }

if (is_safari) { globalStorage.isSafari = true }
if (is_chrome) { globalStorage.isChrome = true }

const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
globalStorage.reducedMotion = motionMediaQuery.matches;

if (globalStorage.reducedMotion) {
	motionMediaQuery.addEventListener('change', () => {
		globalStorage.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		console.log('Prefers reduced motion: '+globalStorage.reducedMotion)
	});
}
