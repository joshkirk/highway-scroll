import { hasClass, getViewport } from "../_global/helpers";
import { globalStorage } from "../_global/storage";
/*
 * Worker pool initialization file
 *
 *	- Sets up our worker pool to give our
 *	  javaScript an array of worker threads
 *	  to work with
 *	- Workers are used to run long-running
 *	  or heavy scripts, don't inject every
 *	  function into this.
 */
export class LazyLoadWorker {

	constructor(worker){
		this.worker = new Worker("/assets/js/workers/image-load.js");

		this.running = false;
		this.array = [];
		this.count = 0;
		this.total = 0;
		this.type = "";

		/* --- Set our preload callback images sizes --- */
		this.size = "mobile";

		if(getViewport().width > 767 && !hasClass(document.body, "force-mobile")){
			this.size = "desktop";
		}

		this.bindEvents();
	}

	bindEvents(){

		this.worker.addEventListener("message", (event)=>{

			const data = event.data;

			/* --- Make sure we get elements that might have duplicate images --- */
			let images = document.querySelectorAll(`[data-preload-${this.size}="${data.url}"]`);

			for(let i = 0; i < images.length; i++){

				let url = data.url;
				let rmv = (i === images.length - 1);

				this.preload(images[i], data.blob, rmv);
			}
		});
	}

	loadImages(type, size, callback){
		let images = document.querySelectorAll(`.${type}`);
		let protocol = window.location.protocol + "//";

		this.array = [];
		this.count = 0;

		this.total = images.length;
		this.type = type;

		/* --- Loop through our images --- */
		for(let i = 0; i < images.length; i++){

			let url = images[i].getAttribute("data-preload-" + size);
			let tag = images[i].tagName.toLowerCase();

			/* --- Fallback for local images --- */
			if(url.indexOf("http") < 0){
				url = protocol + window.location.host + url;
			}

			if(url !== "" && this.array.indexOf(url) < 0){

				if(globalStorage.popstate || tag === "iframe" || tag === "video"){
					/* --- Hot swap our src --- */
					this.hotSwap(images[i], this.size);
					this.total--;
				} else {
					/* --- Send the url over to the worker --- */
					this.array.push(url);
					this.message(url);	
				}

			} else {

				/* --- Reduce total if there is no image --- */
				this.total--;
			}
		}

		/* --- Set our callback interval --- */
		let interval = setInterval(()=>{

			if(this.count >= this.total){
				clearInterval(interval);
				callback(type + " done!");
			}

		}, 10);
	}

	hotSwap(element, size){
		this.preloadSwap(element, size);
	}

	removeAttrs(element) {
		element.classList.remove('preload');
		element.classList.remove('preload-critical');
		element.removeAttribute('data-preload-desktop');
		element.removeAttribute('data-preload-mobile');
	}

	preload(element, blob, remove){

		/* ----- If there is no URL defined, return clean ----- */
		if(!blob || blob === ""){

			this.removeAttrs(element);

			return;
		}

		let tag = element.tagName.toLowerCase();
		let url = URL.createObjectURL(blob);

		switch(tag){

			/* ----- Video Tags ----- */
			case "video":

				let source = document.createElement("source");

				source.setAttribute("src", url);

				element.appendChild(source);
				element.load();
				element.play();

				let checkVideoLoad = setInterval(()=>{

					if(element.readyState > 3){

						/* --- Video has loaded --- */
						this.removeAttrs(element);
						clearInterval(checkVideoLoad);

						if(remove === true){
							URL.revokeObjectURL(url);
						}

						this.count++;
					}

				}, 25);

				break;

			/* ----- Img Tags ----- */
			case "img":

				/* --- Wait for Img tag to load --- */
				element.onload = ()=>{

					this.removeAttrs(element);

					if(remove === true){
						URL.revokeObjectURL(url);
					}

					this.count++;
				};

				element.onerror = ()=>{
					console.log("LOAD FAILURE: " + url);
					this.count++;
				};

				element.setAttribute("src", url);

				break;
				
			/* ----- Everything else, assumes background-image ----- */
			default:

				/* --- Use Img load to measure for background-image --- */
				element.style.backgroundImage = "url(" + url + ")";
				this.removeAttrs(element);

				if(remove === true){
					// URL.revokeObjectURL(url);
				}

				this.count++;

				break;
		}
	}

	preloadSwap(element, size){

		let tag = element.tagName.toLowerCase();
		let url = element.getAttribute("data-preload-" + size);

		switch(tag){

			/* ----- Video Tags ----- */
			case "video":

				let source = document.createElement("source");

				source.setAttribute("src", url);

				element.appendChild(source);
				element.load();
				element.play();

				break;

			/* ----- Img Tags ----- */
			case "img":
			case "iframe":

				element.setAttribute("src", url);


				break;
				
			/* ----- Everything else, assumes background-image ----- */
			default:

				element.style.backgroundImage = "url(" + url + ")";

				break;
		}

		this.removeAttrs(element);
	}

	/* --- Post our message to the worker --- */
	message(message){
		this.worker.postMessage(message);
	}
}