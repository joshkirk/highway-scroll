if ('scrollRestoration' in history) {
	history.scrollRestoration = 'manual';
}

/*
	Init Routing
-------------------------------------------------- */
import "./routing";

/*
	Load Plugins / Functions
-------------------------------------------------- */
import { getViewport } from "./_global/helpers";
import { onReady, onLoad, onResize } from "./_global/_renderer";
import { globalStorage } from "./_global/storage";


/*
	Constants
-------------------------------------------------- */
const isMobile = require("ismobilejs");

globalStorage.isMobile = isMobile.any;

/*
	Check for Reduced Motion changes
-------------------------------------------------- */
if(globalStorage.reducedMotion){
	window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", ()=>{
		globalStorage.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	});
}

/*
	Doc ready
-------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
	
	/* --- Keep these up to date --- */
	globalStorage.windowWidth = getViewport().width;
	globalStorage.windowHeight = getViewport().height;
	
	/* --- Fire onReady --- */
	onReady();
}, false);

/*
	Window onload
-------------------------------------------------- */
window.onload = function(){

	/* --- Keep these up to date --- */
	globalStorage.windowWidth = getViewport().width;
	globalStorage.windowHeight = getViewport().height;
	
	/* --- Fire onLoad --- */
	onLoad();
};

/*
	Window resize
-------------------------------------------------- */
let resizeTimeout = setTimeout(()=>{},0);

window.onresize = function(){
	
	/* --- Clear the timeout if actively resizing --- */
	clearTimeout(resizeTimeout);

	/* --- Delay resize event --- */
	resizeTimeout = setTimeout(()=>{

		/* --- Keep these up to date --- */
		globalStorage.windowWidth = getViewport().width;
		globalStorage.windowHeight = getViewport().height;
		
		/* --- Fire onResize --- */
		onResize();
	}, 250);
};