var canvas;
var context;

var a = 4.0, b = 3, c = -0.5;
var speed = 100;

var currentX = 0.0;
var currentY = 0.0;

var currentR = 255;
var currentG = 255;
var currentB = 255;

var counter = 0;
var points = 0;
var hits = 0;
var gap = 0;

var imgData;

var CanvasMargin = 10;
var TimerInterval = 40;

var requestFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
	window.setTimeout(callback, 1000 / 60);
};

window.onload = function (e) {
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");

	document.getElementById("parameterA").value = a.toString();
	document.getElementById("parameterB").value = b.toString();
	document.getElementById("parameterC").value = c.toString();

	reset();

	requestFrame(draw);
};

function draw() {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;

	var centerX = canvas.clientWidth / 2;
	var centerY = canvas.clientHeight / 2;
	var canvasSize = Math.min(canvas.clientWidth, canvas.clientHeight);

	context.translate(0.5, 0.5);

	for (var i = 0; i < speed; i++) {
		var xx = currentY - Math.sign(currentX) * Math.sqrt(Math.abs(b * currentX - c));
		var yy = a - currentX;
		currentX = xx;
		currentY = yy;

		var xpos = Math.round(centerX + currentX * 20);
		var ypos = Math.round(centerY + currentY * 20);

		if (xpos >= 0 && xpos < imgData.width && ypos >= 0 && ypos < imgData.height) {
			var index = (imgData.width * ypos + xpos) * 4;

			imgData.data[index++] = currentR;   // r
			imgData.data[index++] = currentG;   // g
			imgData.data[index++] = currentB;   // b
			imgData.data[index++] = 255;        // 0 = transparent, 255 = opaque

			hits++;
			gap = 0;
		} else {
			gap++;
		}

		points++;
	}
	context.putImageData(imgData, 0, 0);

	if (++counter % 60 == 0) {
		currentR = Math.trunc(Math.random() * 256);
		currentG = Math.trunc(Math.random() * 256);
		currentB = Math.trunc(Math.random() * 256);
	}

	document.getElementById("counter").innerHTML = points.toString() + " / " + hits.toString() + " / " + gap.toString();

	requestFrame(draw);
}

function updateA(e) {
	a = parseInt(e.value);
}

function updateB(e) {
	b = parseInt(e.value);
}

function updateC(e) {
	c = parseInt(e.value);
}

function updateSpeed(e) {
	speed = parseInt(e.value);
}

function reset() {
	imgData = context.createImageData(canvas.clientWidth, canvas.clientHeight);
	var data = imgData.data;
	for (var i = 0; i < imgData.width * imgData.height * 4; i += 4) {
		data[i + 3] = 255;
	}
	counter = 0;
	points = 0;
	hits = 0;
	gap = 0;

	currentX = 0.0;
	currentY = 0.0;

	currentR = 255;
	currentG = 255;
	currentB = 255;
}