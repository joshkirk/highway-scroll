/* 	
	Import and run any polyfills here
-------------------------------------------------- */
const ua = navigator.userAgent || navigator.vendor || window.opera;
const isInstagram = (ua.indexOf("Instagram") > -1) ? true : false;

if(isInstagram){
	document.body.className += " instagram-browser force-mobile";
}

/* 	
	Run your initilize script, make sure this is last
-------------------------------------------------- */
import "./_initialize";