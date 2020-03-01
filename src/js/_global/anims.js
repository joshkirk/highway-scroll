import { gsap, Sine } from "gsap";
import {domStorage, globalStorage} from "./storage";
import { $scroll } from "../_global/_renderer"

/*
	Page specific animations
-------------------------------------------------- */
export const pageEntrance = (namespace = null)=>{

	/* ----- Establish our timeline ----- */
	let timeline = new gsap.timeline({ paused: true });

	timeline.to(domStorage.globalMask, 1, { autoAlpha: 0, ease: Sine.easeInOut });

	/* ----- Setup cases for specific load-ins ----- */
	switch(namespace){

		case "home":

			timeline.add(()=>{ console.log("home anims in go here"); });
			timeline.play();

			break;

		case "about":

			timeline.add(()=>{ console.log("about anims in go here"); });
			timeline.play();

			break;

		/* ----- Our default page entrance ----- */
		default:

			timeline.add(()=>{ console.log("default anims in go here"); });
			timeline.play();

			break;
	}

	if (globalStorage.firstLoad) {
		globalStorage.firstLoad = false;
	}
};

/*
	Global element animations
-------------------------------------------------- */
export const globalEntrance = ()=>{

	if(globalStorage.firstLoad === false){
		return;
	}

	/* ----- Establish our timeline ----- */
	let timeline = new gsap.timeline({ paused: true });

	// timeline.to(".loader-icon", 0.5, { autoAlpha: 0, ease: Sine.easeInOut, onComplete: ()=>{ globalStorage.transitionFinished = true; }});
	globalStorage.transitionFinished = true;  ////// delete this if waiting for loader animations  ^^^

	timeline.play();
};