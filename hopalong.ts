var canvas: HTMLCanvasElement;
var context: CanvasRenderingContext2D;

// The Hopalong algorithm's parameters A, B and C
var a: number = 4.0, b: number = 3, c: number = -0.5;
// The speed of the animation, in nubmer of points to draw per frame
var speed: number = 100;

// State of the animation: the current coordinate
var currentX: number = 0.0;
var currentY: number = 0.0;

// The current color, initially white
var currentR: number = 255;
var currentG: number = 255;
var currentB: number = 255;

// Data about the animation:
var frameCounter = 0;
var points = 0;
var hits = 0;
var gap = 0;

// An ImageData object to use to transfer the pixels drawn
// so far onto to the canvas
var imgData: ImageData;

// var CanvasMargin = 10;
// var TimerInterval = 40;

var requestFrame: (callback: FrameRequestCallback) => number = window.requestAnimationFrame || window.webkitRequestAnimationFrame || (<any>window).mozRequestAnimationFrame || function (callback) {
	window.setTimeout(callback, 1000 / 60);
};

window.onload = function (e) {
	canvas = <HTMLCanvasElement>document.getElementById("canvas");
	context = canvas.getContext("2d");

	(<HTMLInputElement>document.getElementById("parameterA")).value = a.toString();
	(<HTMLInputElement>document.getElementById("parameterB")).value = b.toString();
	(<HTMLInputElement>document.getElementById("parameterC")).value = c.toString();

	reset();

	requestFrame(draw);
};

// Draw a single frame. This means adding 'speed' pixels to the image
function draw() {
	// Update the canvas' size (WHY?)
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;

	// Calculate the center of the canvas
	var centerX: number = canvas.clientWidth / 2;
	var centerY: number = canvas.clientHeight / 2;
	// var canvasSize: number = Math.min(canvas.clientWidth, canvas.clientHeight);

	// context.translate(0.5, 0.5);

	// Draw 'speed' pixels
	for (var i: number = 0; i < speed; i++) {
		// Calculate the new values xx and yy
		var xx: number = currentY - Math.sign(currentX) * Math.sqrt(Math.abs(b * currentX - c));
		var yy: number = a - currentX;
		// Set those as new coordinates
		currentX = xx;
		currentY = yy;

		// Calculate a pixel coordinate on the canvas
		var xpos: number = Math.round(centerX + currentX * 20);
		var ypos: number = Math.round(centerY + currentY * 20);

		// Does it fall within the size of the canvas?
		if (xpos >= 0 && xpos < imgData.width && ypos >= 0 && ypos < imgData.height) {
			// Yes - calculate the offset in the image data
			var index = (imgData.width * ypos + xpos) * 4;

			// Set the pixel at the new coordinates to the current color
			imgData.data[index++] = currentR;   // r
			imgData.data[index++] = currentG;   // g
			imgData.data[index++] = currentB;   // b
			imgData.data[index++] = 255;        // 0 = transparent, 255 = opaque

			// Count this as a hit (i.e. we drew inside the canvas)
			hits++;
			// Reset the hit-gap
			gap = 0;
		} else {
			// Count this as a miss (i.e. we did not draw a pixel on the canvas)
			// by uncrementing the hit-gap
			gap++;
		}

		// Count both hits and misses as a point
		points++;
	}

	// After adding all pixels, draw the image data onto the canvas
	context.putImageData(imgData, 0, 0);

	// Increment the frame counter. If it is a multiple of 60
	// choose a new color
	if (++frameCounter % 60 == 0) {
		currentR = Math.floor(Math.random() * 256);
		currentG = Math.floor(Math.random() * 256);
		currentB = Math.floor(Math.random() * 256);
	}

	// Update the UI
	document.getElementById("counter").innerHTML = points.toString() + " / " + hits.toString() + " / " + gap.toString();

	// Schedule another frame to draw
	requestFrame(draw);
}

// Update parameter A from the input element
function updateA(e) {
	a = parseInt(e.value);
}

// Update parameter B from the input element
function updateB(e) {
	b = parseInt(e.value);
}

// Update parameter C from the input element
function updateC(e) {
	c = parseInt(e.value);
}

// Update animation speed from the input element
function updateSpeed(e) {
	speed = parseInt(e.value);
}

// Reset the animation
function reset() {
	// Create new image data
	imgData = context.createImageData(canvas.clientWidth, canvas.clientHeight);
	// Set all pixels to white
	var data = imgData.data;
	for (var i = 0; i < imgData.width * imgData.height * 4; i += 4) {
		data[i + 3] = 255;
	}
	// Reset counters
	frameCounter = 0;
	points = 0;
	hits = 0;
	gap = 0;

	// Reset current position
	currentX = 0.0;
	currentY = 0.0;

	// Reset current color
	currentR = 255;
	currentG = 255;
	currentB = 255;
}