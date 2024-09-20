let video;
let model;
let predictions = [];

// Load the coco-ssd model when the page loads
function preload() {
    cocoSsd.load().then((loadedModel) => {
        model = loadedModel;
        console.log("Model loaded!");
    });
}

// 480 x 640
// 640 x 840

function setup() {
    // Create video capture with flexible facing mode
    const constraints = {
        video: {
            facingMode: {
                exact: "environment" // Try to access the back camera
            }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            video = createCapture(stream);
            video.size(windowWidth, windowHeight);
            video.hide();
            createCanvas(windowWidth, windowHeight);
        })
        .catch((error) => {
            console.error("Error accessing the back camera, trying front camera: ", error);
            // Fallback to front camera
            const fallbackConstraints = {
                video: {
                    facingMode: "user" // Access the front camera
                }
            };
            return navigator.mediaDevices.getUserMedia(fallbackConstraints);
        })
        .then((stream) => {
            if (stream) {
                video = createCapture(stream);
                video.size(windowWidth, windowHeight);
                video.hide();
                createCanvas(windowWidth, windowHeight).parent('main-canvas-container');
            }
        })
        .catch((error) => {
            console.error("Error accessing the camera: ", error);
        });
}
function draw() {
    background(0);

    // Draw the video onto the canvas, maintaining aspect ratio
    let aspect = video.width / video.height;
    let newWidth = width;
    let newHeight = width / aspect;

    // If the new height exceeds the canvas height, adjust width and height accordingly
    if (newHeight > height) {
        newHeight = height;
        newWidth = height * aspect;
    }

    // Center the video on the canvas
    let x = (width - newWidth) / 2;
    let y = (height - newHeight) / 2;

    // Draw the video
    image(video, x, y, newWidth, newHeight);

    // Draw the bounding boxes
    if (predictions.length > 0) {
        drawBoundingBoxes(predictions);
    }

    // Check if the model is loaded and the video has valid dimensions
    if (model && video.width > 0 && video.height > 0) {
        model.detect(video.elt).then((results) => {
            predictions = results;
        }).catch((error) => {
            console.error("Error during detection: ", error);
        });
    }
}

function drawBoundingBoxes(predictions) {
    predictions.forEach((prediction) => {
        // Extract prediction data
        const [x, y, width, height] = prediction.bbox;
        const className = prediction.class;
        const confScore = prediction.score.toFixed(2);

        // Draw the bounding box
        noFill();
        stroke(0, 255, 0); // Green color for bounding box
        strokeWeight(2);
        rect(x, y, width, height);

        // Draw the label and confidence score
        fill(0, 255, 0);
        textSize(12);
        text(`${className} ${confScore}`, x, y > 10 ? y - 5 : y + 15);
    });
}

function windowResized() {
    // Resize the canvas and video when the window size changes
    resizeCanvas(windowWidth, windowHeight);
    video.size(windowWidth, windowHeight);
}