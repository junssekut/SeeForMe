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

function setup() {
    // Create a canvas and attach it to the HTML container
    const canvas = createCanvas(640, 480);
    canvas.parent("main-canvas-container");

    // Create the video element
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();  // Hide the HTML video element since we'll display it on the canvas
}

function draw() {
    background(0);

    // Draw the video on the canvas
    image(video, 0, 0);

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
