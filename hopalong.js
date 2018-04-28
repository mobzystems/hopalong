var HopalongApp = /** @class */ (function () {
    function HopalongApp() {
        // The Hopalong algorithm's parameters A, B and C
        this.a = 4.0;
        this.b = 3.0;
        this.c = -0.5;
        // The speed of the animation, in number of points to draw per frame
        this.speed = 1000;
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
        this.canvas = document.getElementById("canvas");
        // Get the canvas' 2D context
        this.context = this.canvas.getContext("2d");
        this.status = document.getElementById("status");
        // Update the UI with our values
        document.getElementById("parameterA").value = this.a.toString();
        document.getElementById("parameterB").value = this.b.toString();
        document.getElementById("parameterC").value = this.c.toString();
        document.getElementById("speed").value = this.speed.toString();
        this.reset();
        this.requestNextFrame();
    }
    HopalongApp.prototype.requestNextFrame = function () {
        // Call requestFrame() in the context of Window,
        // instructing it to call draw() in the context of this
        // This prevents an Illegal Invocation error
        this.requestFrame.call(window, this.draw.bind(this));
    };
    // Not sure if we can use Math.sign() instead of this function,
    // because Math.sign() can return -0 and NaN.
    HopalongApp.prototype.sign = function (x) {
        return (x > 0) ? 1 : ((x < 0) ? -1 : 0);
    };
    // Draw a single frame. This means adding 'speed' pixels to the image
    HopalongApp.prototype.draw = function (time) {
        // Update the canvas' size (WHY?)
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        // Calculate the center of the canvas
        var centerX = this.imgData.width / 2;
        var centerY = this.imgData.height / 2;
        // Draw 'speed' pixels
        for (var i = 0; i < this.speed; i++) {
            // Calculate the new values xx and yy
            var xx = this.currentY - this.sign(this.currentX) * Math.sqrt(Math.abs(this.b * this.currentX - this.c));
            var yy = this.a - this.currentX;
            // Set those as new coordinates
            this.currentX = xx;
            this.currentY = yy;
            // Calculate a pixel coordinate on the canvas
            var xpos = Math.round(centerX + this.currentX * 20);
            var ypos = Math.round(centerY + this.currentY * 20);
            // Does it fall within the size of the canvas?
            if (xpos >= 0 && xpos < this.imgData.width && ypos >= 0 && ypos < this.imgData.height) {
                // Yes - calculate the offset in the image data
                var index = (this.imgData.width * ypos + xpos) * 4;
                // Set the pixel at the new coordinates to the current color
                this.imgData.data[index++] = this.currentR; // r
                this.imgData.data[index++] = this.currentG; // g
                this.imgData.data[index++] = this.currentB; // b
                this.imgData.data[index++] = 255; // 0 = transparent, 255 = opaque
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
    };
    // Update parameter A from the input element
    HopalongApp.prototype.updateA = function (e) {
        this.a = parseInt(e.value);
    };
    // Update parameter B from the input element
    HopalongApp.prototype.updateB = function (e) {
        this.b = parseInt(e.value);
    };
    // Update parameter C from the input element
    HopalongApp.prototype.updateC = function (e) {
        this.c = parseInt(e.value);
    };
    // Update animation speed from the input element
    HopalongApp.prototype.updateSpeed = function (e) {
        this.speed = parseInt(e.value);
    };
    // Reset the animation
    HopalongApp.prototype.reset = function () {
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
    };
    return HopalongApp;
}());
var app;
window.onload = function (e) {
    app = new HopalongApp();
};
