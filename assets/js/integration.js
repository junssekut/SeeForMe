// const captureWidth = window.innerWidth <= 768 ? 390 : 640;
// const captureHeight = window.innerWidth <= 768 ? 844 : 480;
function fw() {
    return windowWidth - (window.innerWidth <= 768 ? 50 : 300);
}

function fh() {
    return windowHeight - (window.innerWidth <= 768 ? 50 : 300);
}

const captureWidth = 640;
const captureHeight = 480;

let video;
let model;
let detections = [];
const validCommands = ['see for me', 'look for me', 'show me', 'see it for me'];
const fuse = new Fuse(validCommands, { includeScore: true, threshold: 0.4 });
let recognition;
let commandDetected = false;
let preds = {};

function setup() {
    // createCanvas(captureWidth, captureHeight);
    // createCanvas(window.innerWidth <= 768 ? 290 : 640, window.innerWidth <= 768 ? 540 : 480);
    const canvas = createCanvas(fw(), fh());
    canvas.style('z-index', '-1');
    // canvas.position(0, 0);
    
    initVideoCapture();
    loadCocoModel();
    setupSpeechRecognition();
}

function initVideoCapture() {
    const constraints = {
        audio: false,
        video: {
            facingMode: "environment"
        }
    };

    video = createCapture(constraints);
    video.hide();
}

function loadCocoModel() {
    cocoSsd.load().then((loadedModel) => {
        model = loadedModel;
        console.log('Model Loaded');

        video.elt.addEventListener('loadeddata', () => {
            console.log("Video is ready. Starting detection...");
            detect();
        });
    });
}

function detect() {
    if (video.width > 0 && video.height > 0) {
        model.detect(video.elt).then((results) => {
            detections = results;
            updatePredictions();
            setTimeout(detect, 100); // Call detect again with a delay
        }).catch(err => {
            console.error("Detection error:", err);
            setTimeout(detect, 500); // Retry after an error
        });
    } else {
        setTimeout(detect, 100); // Retry if dimensions are not valid
    }
}

function updatePredictions() {
    preds = {};
    detections.forEach(detection => {
        const className = detection.class;
        preds[className] = (preds[className] || 0) + 1;
    });
}

function draw() {
    background(0); // Clear the background
    image(video, 0, 0, width, height); // Draw the video

    // Calculate the scaling factor based on the original video size
    const scaleX = width / captureWidth;  // Horizontal scaling factor
    const scaleY = height / captureHeight; // Vertical scaling factor

    // Draw bounding boxes for detected objects
    detections.forEach(detection => {
        const { bbox, class: className, score } = detection;

        // Scale the bounding box coordinates
        const x = bbox[0] * scaleX; // Top-left x
        const y = bbox[1] * scaleY; // Top-left y
        const w = bbox[2] * scaleX; // Width
        const h = bbox[3] * scaleY; // Height

        // Draw the bounding box
        stroke(0, 255, 0);
        strokeWeight(2);
        noFill();
        rect(x, y, w, h); // Draw bounding box

        // Draw label
        fill(255);
        textSize(16);
        text(`${className} (${(score * 100).toFixed(2)}%)`, x, y > 10 ? y - 5 : 10);
    });
}

function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => handleSpeechRecognitionResult(e);
    recognition.onend = () => recognition.start(); // Restart recognition if it ends
    recognition.onerror = (e) => console.error("Speech recognition error:", e.error);

    video.elt.addEventListener('loadeddata', () => {
        recognition.start();
        console.log("Speech recognition started.");
    });
}

function handleSpeechRecognitionResult(e) {
    const transcript = e.results[0][0].transcript.trim().toLowerCase();
    const result = fuse.search(transcript);

    if (result.length > 0 && result[0].score < 0.4 && !commandDetected) {
        commandDetected = true;
        speakDetectedCommands();
    }
}

function speakDetectedCommands() {
    for (const [key, value] of Object.entries(preds)) {
        const message = `${value} ${pluralize(key, value)}`;
        responsiveVoice.speak(message, null, {
            onend: () => {
                commandDetected = false; // Reset the flag after speaking
            }
        });
    }
}

function windowResized() {
    // Optional: Handle window resizing if needed
    // Update canvas size if needed based on new dimensions
    // resizeCanvas(window.innerWidth <= 768 ? 290 : 640, window.innerWidth <= 768 ? 540 : 480);
    resizeCanvas(fw(), fh());
}

$(document).ready(() => {
    $('#enablewebcam').on('click', speakDetectedCommands());
});