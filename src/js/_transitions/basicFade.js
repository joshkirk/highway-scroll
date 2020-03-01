import Highway from "@dogstudio/highway";
import { gsap, Sine } from "gsap";
import { globalStorage } from "../_global/storage";
import {$scroll} from "../_global/_renderer";

let globalMask = document.getElementById("global-mask");

/*
	Default Highway Transition
-------------------------------------------------- */
class BasicFade extends Highway.Transition{

	out({from, trigger, done}){

		gsap.fromTo(globalMask, 0.5, { autoAlpha: 0 }, { autoAlpha: 1, ease: Sine.easeInOut, onComplete: () => { done() } });
	}

	in({from, to, trigger, done}){

		globalStorage.namespace = to.dataset.routerView;

		// Remove old view
		from.remove();

		if (globalStorage.isMobile) {
			// Move to top of page
			document.body.scrollTop = 0;
			window.scroll(0,0);
		}

		globalStorage.transitionFinished = true;

		done();
	}
}

export default BasicFade;
