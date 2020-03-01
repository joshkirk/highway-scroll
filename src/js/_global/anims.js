import { gsap, Sine } from "gsap";
import {domStorage, globalStorage} from "./storage";
import { $scroll } from "../_global/_renderer"

/*
	Page specific animations
-------------------------------------------------- */
export const pageEntrance = (namespace = null)=>{

	/* ----- Establish our timeline ----- */
	let timeline = new gsap.timeline({ paused: true });

	timeline.to(domStorage.globalMask, 1, { autoAlpha: 0, ease: Sine.easeInOut, onComplete: ()=>{ globalStorage.transitionFinished = true; }});

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


export const prepDrawers = () => {
	const drawers = document.querySelectorAll(".drawer:not(.bound)")

	for (let i = 0; i < drawers.length; i++) {
		const thisDrawer = drawers[i]
		thisDrawer.classList.add("bound")
		const childrenWrapper = thisDrawer.querySelector(".drawer-items")
		const childrenWrapperItems = childrenWrapper.querySelectorAll("p")
		const childrenWrapperHeight = childrenWrapper.offsetHeight

		thisDrawer.addEventListener("click", event => {
			if (!thisDrawer.classList.contains("open")) {
				const openDrawers = document.querySelectorAll(".drawer.open")
				for (let i = 0; i < openDrawers.length; i++) {
					openDrawers[i].classList.remove("open")
					gsap.to(openDrawers[i].querySelector(".drawer-items"), 0.5, { height: 0, force3D: true, ease: Sine.easeInOut })
					gsap.to(openDrawers[i].querySelectorAll(".drawer-items p"), 0.35, { opacity: 0, force3D: true, ease: Sine.easeInOut })
				}
				thisDrawer.classList.add("open")

				gsap.to(childrenWrapper, 0.5, { height: childrenWrapperHeight, force3D: true, ease: Sine.easeInOut, onComplete: () => {
						$scroll.resize()
					} })
				gsap.fromTo(childrenWrapperItems, 0.7, { opacity: .2 }, { opacity: 1, force3D: true, ease: Sine.easeInOut })
			} else {
				thisDrawer.classList.remove("open")
				gsap.to(childrenWrapper, 0.35, { height: 0, force3D: true, ease: Sine.easeInOut, onComplete: () => {
						$scroll.resize()
					} })
				gsap.to(childrenWrapperItems, 0.35, { opacity: 0, force3D: true, ease: Sine.easeInOut })
			}
		})
		gsap.set(childrenWrapper, { height: 0 })
		let origOffsetTop = thisDrawer.getBoundingClientRect().top - 120
		if ((i === drawers.length - 1) && $scroll) {
			$scroll.resize()
		}
	}
}