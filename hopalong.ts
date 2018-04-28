class HopalongApp {
	// The Hopalong algorithm's parameters A, B and C
	private a: number = 4.0;
	private b: number = 3.0;
	private c: number = -0.5;

	// The speed of the animation, in number of points to draw per frame
	private speed: number = 1000;
	// The zoom level
	private zoom: number = 20;

	// State of the animation: the current coordinate
	private currentX: number = 0.0;
	private currentY: number = 0.0;

	// The current color, initially white
	private currentR: number = 255;
	private currentG: number = 255;
	private currentB: number = 255;

	// Data about the animation:
	private frameCounter = 0;	// Total number of frames drawn
	private points = 0; 		// Total points calculated
	private hits = 0;			// Total number of hits (pixels within canvas)
	private gap = 0; 			// Consecutive misses counter. Reset on every hit

	// UI elements
	private canvas: HTMLCanvasElement | null;
	private context: CanvasRenderingContext2D | null;
	private status: HTMLElement | null;

	// An ImageData object to use to transfer the pixels drawn
	// so far onto to the canvas
	private imgData: ImageData | null = null;

	// Cross-browser requestFrame method
	private requestFrame: (callback: FrameRequestCallback) => number =
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		(<any>window).mozRequestAnimationFrame ||
		(<any>window).oRequestAnimationFrame ||
		((cb) => window.setTimeout(cb, 1000 / 60));

	public constructor() {
		// Get the canvas element
		this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
		// Get the canvas' 2D context
		this.context = this.canvas.getContext("2d");

		this.status = document.getElementById("status");

		// Update the UI with our values
		(<HTMLInputElement>document.getElementById("parameterA")).value = this.a.toString();
		(<HTMLInputElement>document.getElementById("parameterB")).value = this.b.toString();
		(<HTMLInputElement>document.getElementById("parameterC")).value = this.c.toString();
		(<HTMLInputElement>document.getElementById("speed")).value = this.speed.toString();
		(<HTMLInputElement>document.getElementById("zoom")).value = this.zoom.toString();

		this.reset();

		this.requestNextFrame();
	}

	requestNextFrame(): void {
		// Call requestFrame() in the context of Window,
		// instructing it to call draw() in the context of this
		// This prevents an Illegal Invocation error
		this.requestFrame.call(window, this.draw.bind(this));
	}

	// Not sure if we can use Math.sign() instead of this function,
	// because Math.sign() can return -0 and NaN.
	private sign(x: number): number {
		return (x > 0) ? 1 : ((x < 0) ? -1 : 0);
	}

	// Draw a single frame. This means adding 'speed' pixels to the image
	private draw(time: number): void {
		if (this.canvas === null || this.context === null || this.imgData === null || this.status === null)
			return;

		// Update the canvas' size (WHY?)
		this.canvas.width = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;

		// Calculate the center of the canvas
		var centerX: number = this.imgData.width / 2;
		var centerY: number = this.imgData.height / 2;

		// Draw 'speed' pixels
		for (var i: number = 0; i < this.speed; i++) {
			// Calculate the new values xx and yy
			var xx: number = this.currentY - this.sign(this.currentX) * Math.sqrt(Math.abs(this.b * this.currentX - this.c));
			var yy: number = this.a - this.currentX;
			// Set those as new coordinates
			this.currentX = xx;
			this.currentY = yy;

			// Calculate a pixel coordinate on the canvas
			var xpos: number = Math.round(centerX + this.currentX * this.zoom);
			var ypos: number = Math.round(centerY + this.currentY * this.zoom);

			// Does it fall within the size of the canvas?
			if (xpos >= 0 && xpos < this.imgData.width && ypos >= 0 && ypos < this.imgData.height) {
				// Yes - calculate the offset in the image data
				var index = (this.imgData.width * ypos + xpos) * 4;

				// Set the pixel at the new coordinates to the current color
				this.imgData.data[index++] = this.currentR;   // r
				this.imgData.data[index++] = this.currentG;   // g
				this.imgData.data[index++] = this.currentB;   // b
				this.imgData.data[index++] = 255;        // 0 = transparent, 255 = opaque

				// Count this as a hit (i.e. we drew inside the canvas)
				this.hits++;
				// Reset the hit-gap
				this.gap = 0;
			} else {
				// Count this as a miss (i.e. we did not draw a pixel on the canvas)
				// by incrementing the hit-gap
				this.gap++;
			}

			// Count both hits and misses as a point
			this.points++;
		}

		// After adding all pixels, draw the image data onto the canvas
		this.context.putImageData(this.imgData, (this.canvas.clientWidth - this.imgData.width) / 2, (this.canvas.clientHeight - this.imgData.height) / 2);

		// Increment the frame counter. If it is a multiple of 60
		// choose a new color
		if (++this.frameCounter % 60 == 0) {
			this.currentR = Math.floor(Math.random() * 256);
			this.currentG = Math.floor(Math.random() * 256);
			this.currentB = Math.floor(Math.random() * 256);
		}

		// Update the UI
		this.status.innerHTML = this.points.toString() + " / " + this.hits.toString() + " / " + this.gap.toString();

		// Schedule another frame to draw
		this.requestNextFrame();
	}

	// Update parameter A from the input element
	updateA(e: HTMLInputElement): void {
		this.a = parseInt(e.value);
	}

	// Update parameter B from the input element
	updateB(e: HTMLInputElement): void {
		this.b = parseInt(e.value);
	}

	// Update parameter C from the input element
	updateC(e: HTMLInputElement): void {
		this.c = parseInt(e.value);
	}

	// Update animation speed from the input element
	updateSpeed(e: HTMLInputElement): void {
		this.speed = parseInt(e.value);
	}

	// Update zoom from the input element. Resets the animation!
	updateZoom(e: HTMLInputElement): void {
		this.zoom = parseInt(e.value);
		this.reset();
	}

	// Reset the animation
	reset(): void {
		if (this.context === null)
			return;
		// Create new image data
		this.imgData = this.context.createImageData(screen.width, screen.height);
		// Set all pixels to white
		var data = this.imgData.data;
		for (var i = 0; i < this.imgData.width * this.imgData.height * 4; i += 4) {
			data[i + 3] = 255;
		}
		// Reset counters
		this.frameCounter = 0;
		this.points = 0;
		this.hits = 0;
		this.gap = 0;

		// Reset current position
		this.currentX = 0.0;
		this.currentY = 0.0;

		// Reset current color
		this.currentR = 255;
		this.currentG = 255;
		this.currentB = 255;
	}
}

let app: HopalongApp;

window.onload = function (e) {
	app = new HopalongApp();
};
