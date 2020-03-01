/*
    Load Plugins / Functions
-------------------------------------------------- */
import Highway from "@dogstudio/highway";
import { onLeave, onEnter, onEnterCompleted } from "./_global/_renderer";
/* --- Highway Renderers --- */
import HomeRenderer from "./home/_renderer";
import AboutRenderer from "./about/_renderer";
/* --- Highway Transitions --- */
import BasicFade from "./_transitions/basicFade";

/*
    Setup Core
-------------------------------------------------- */
export const H = new Highway.Core({
	renderers: {
		home: HomeRenderer,
		about: AboutRenderer
	},
	transitions: {
		default: BasicFade,
		contextual: { // Add transitions here that you can use by placing data-transition on an anchor, or in an H.redirect(href, transition)
			// footerToHero: FooterToHero
		}
	}
});

/*
    Global Events
-------------------------------------------------- */
H.on("NAVIGATE_OUT", ({ from, trigger, location })=>{
	onLeave(from, trigger, location);
});

H.on("NAVIGATE_IN", ({ to, trigger, location })=>{
	onEnter(to, trigger, location);
});

H.on("NAVIGATE_END", ({ from, to, trigger, location })=>{
	onEnterCompleted(from, to, trigger, location);
});
