"use strict";
var HopalongApp = /** @class */ (function () {
    function HopalongApp(canvas) {
        // The Hopalong algorithm's parameters A, B and C
        this.a = 4.0;
        this.b = 3.0;
        this.c = -0.5;
        // The speed of the animation, in number of points to draw per frame
        this.speed = 1000;
        // The zoom level
        this.zoom = 20;
        // State of the animation: the current coordinate
        this.currentX = 0.0;
        this.currentY = 0.0;
        // The current color, initially white
        this.currentR = 255;
        this.currentG = 255;
        this.currentB = 255;
        // Data about the animation:
        this.frameCounter = 0; // Total number of frames drawn
        this.points = 0; // Total points calculated
        this.hits = 0; // Total number of hits (pixels within canvas)
        this.gap = 0; // Consecutive misses counter. Reset on every hit
        // Cross-browser requestFrame method
        this.requestFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            (function (cb) { return window.setTimeout(cb, 1000 / 60); });
        // Get the canvas element
        this.canvasElement = canvas;
        // Get the canvas' 2D context
        this.context = this.canvasElement.getContext("2d");
        this.pointsElement = document.getElementById("points");
        this.hitsElement = document.getElementById("hits");
        this.gapElement = document.getElementById("gap");
        // Update the UI with our values
        document.getElementById("parameterA").value = this.a.toString();
        document.getElementById("parameterB").value = this.b.toString();
        document.getElementById("parameterC").value = this.c.toString();
        document.getElementById("speed").value = this.speed.toString();
        document.getElementById("zoom").value = this.zoom.toString();
        this.reset();
        // Bind the redraw method so we don't have to redo that on every frame
        this.boundRedraw = this.drawFrame.bind(this);
        this.requestNextFrame();
    }
    HopalongApp.prototype.requestNextFrame = function () {
        // Call requestFrame() in the context of Window,
        // instructing it to call draw() in the context of this
        // This prevents an Illegal Invocation error
        this.requestFrame.call(window, this.boundRedraw);
    };
    // Not sure if we can use Math.sign() instead of this function,
    // because Math.sign() can return -0 and NaN.
    HopalongApp.prototype.sign = function (x) {
        return (x > 0) ? 1 : ((x < 0) ? -1 : 0);
    };
    // Draw a single frame. This means adding 'speed' pixels to the image
    HopalongApp.prototype.drawFrame = function (time) {
        // Update the canvas' size (WHY?)
        this.canvasElement.width = this.canvasElement.clientWidth;
        this.canvasElement.height = this.canvasElement.clientHeight;
        // Calculate the center of the canvas
        var centerX = this.imageData.width / 2;
        var centerY = this.imageData.height / 2;
        // Draw 'speed' pixels
        for (var i = 0; i < this.speed; i++) {
            // Calculate the new values newX and newY
            var newX = this.currentY - this.sign(this.currentX) * Math.sqrt(Math.abs(this.b * this.currentX - this.c));
            var newY = this.a - this.currentX;
            // Set those as new coordinates
            this.currentX = newX;
            this.currentY = newY;
            // Calculate a pixel coordinate on the canvas
            var xpos = Math.round(centerX + this.currentX * this.zoom);
            var ypos = Math.round(centerY + this.currentY * this.zoom);
            // Does it fall within the size of the canvas?
            if (xpos >= 0 && xpos < this.imageData.width && ypos >= 0 && ypos < this.imageData.height) {
                // Yes - calculate the offset in the image data
                var index = (this.imageData.width * ypos + xpos) * 4;
                // Set the pixel at the new coordinates to the current color
                this.imageData.data[index++] = this.currentR; // r
                this.imageData.data[index++] = this.currentG; // g
                this.imageData.data[index++] = this.currentB; // b
                this.imageData.data[index++] = 255; // 0 = transparent, 255 = opaque
                // Count this as a hit (i.e. we drew inside the canvas)
                this.hits++;
                // Reset the hit-gap
                this.gap = 0;
            }
            else {
                // Count this as a miss (i.e. we did not draw a pixel on the canvas)
                // by incrementing the hit-gap
                this.gap++;
            }
            // Count both hits and misses as a point
            this.points++;
        }
        // After adding all pixels, draw the image data onto the canvas
        this.context.putImageData(this.imageData, (this.canvasElement.clientWidth - this.imageData.width) / 2, (this.canvasElement.clientHeight - this.imageData.height) / 2);
        // Increment the frame counter. If it is a multiple of 60
        // choose a new color
        if (++this.frameCounter % 60 == 0) {
            this.currentR = Math.floor(Math.random() * 256);
            this.currentG = Math.floor(Math.random() * 256);
            this.currentB = Math.floor(Math.random() * 256);
        }
        // Update the UI
        this.pointsElement.innerHTML = this.points.toLocaleString();
        this.hitsElement.innerHTML = this.hits.toLocaleString();
        this.gapElement.innerHTML = this.gap.toLocaleString();
        // Schedule another frame to draw
        this.requestNextFrame();
    };
    // Update parameter A from the input element
    HopalongApp.prototype.updateA = function (e) {
        this.a = parseFloat(e.value);
    };
    // Update parameter B from the input element
    HopalongApp.prototype.updateB = function (e) {
        this.b = parseFloat(e.value);
    };
    // Update parameter C from the input element
    HopalongApp.prototype.updateC = function (e) {
        this.c = parseFloat(e.value);
    };
    // Update animation speed from the input element
    HopalongApp.prototype.updateSpeed = function (e) {
        this.speed = parseFloat(e.value);
    };
    // Update zoom from the input element. Resets the animation!
    HopalongApp.prototype.updateZoom = function (e) {
        this.zoom = parseFloat(e.value);
        this.reset();
    };
    // Reset the animation
    HopalongApp.prototype.reset = function () {
        // Create new image data
        this.imageData = this.context.createImageData(screen.width, screen.height);
        // Set all pixels to white
        var data = this.imageData.data;
        for (var i = 0; i < this.imageData.width * this.imageData.height * 4; i += 4) {
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
    };
    return HopalongApp;
}());
// The one and only Hopalong app
var app;
window.onload = function (e) {
    app = new HopalongApp(document.getElementById("canvas"));
};
