import Highway from "@dogstudio/highway";
import { homeSpecificFunc } from "./anims";

/*
    View Events for Highway

	- Home Page
    - Events are listed in their execution order
-------------------------------------------------- */
class HomeRenderer extends Highway.Renderer {

	onEnter() {
		console.log("onEnter");
		homeSpecificFunc()
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

export default HomeRenderer;
