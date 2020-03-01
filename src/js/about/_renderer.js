import Highway from "@dogstudio/highway";
import { aboutSpecificFunc } from "./anims";

/*
    View Events for Highway

	- About Page
    - Events are listed in their execution order
-------------------------------------------------- */
class AboutRenderer extends Highway.Renderer {

	onEnter() {
		console.log("onEnter");
		aboutSpecificFunc();
	}

	onEnterCompleted() {
		console.log("onEnterCompleted");
	}

	onLeave() {
		console.log("onLeave");
	}

	onLeaveCompleted() {
		console.log("onLeaveCompleted");
	}
}

export default AboutRenderer;
