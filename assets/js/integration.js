let video;
let model;
let detections = [];
const validCommands = ['see for me', 'look for me', 'show me', 'see it for me'];
const fuse = new Fuse(validCommands, { includeScore: true, threshold: 1.0 });
let recognition;
let commandDetected = false; // Flag to prevent multiple detections
let preds = {}; // Object to store detected object counts

function setup() {
    createCanvas(windowWidth, windowHeight);
    var constraints = {
        audio: false,
        // video: {
        //   facingMode: {
        //     exact: "environment"
        //   }
        // }
        video: {

            facingMode: "environment"
        }
      }
    video = createCapture(constraints);
    // video = createCapture(VIDEO);
    video.size(width, height);
    video.hide(); // Hide the original video element
    loadModelCoco();
    setupSpeechRecognition(); // Initialize speech recognition
}


function loadModelCoco() {
    cocoSsd.load().then((loadedModel) => {
        model = loadedModel;
        console.log('Model Loaded');

        video.elt.addEventListener('loadeddata', () => {
            console.log("Video is ready. Starting detection...");
            detect(); // Start detection when the video is ready
        });
    });
}

function detect() {
    if (video.width > 0 && video.height > 0) {
        model.detect(video.elt).then((results) => {
            detections = results;

            // Update the preds object with counts
            preds = {};
            detections.forEach(detection => {
                const className = detection.class;
                preds[className] = (preds[className] || 0) + 1;
            });

            setTimeout(detect, 100); // Call detect again with a delay
        }).catch(err => {
            console.error("Detection error:", err);
            setTimeout(detect, 500); // Retry after an error
        });
    } else {
        setTimeout(detect, 100); // Retry if dimensions are not valid
    }
}

function draw() {
    image(video, 0, 0, width, height); // Draw the video

    // Draw bounding boxes and labels
    detections.forEach(detection => {
        const { bbox, class: className, score } = detection;
        stroke(0, 255, 0);
        strokeWeight(2);
        noFill();
        rect(bbox[0], bbox[1], bbox[2], bbox[3]); // Draw rectangle

        // Draw label
        fill(255);
        textSize(24);
        text(`${className} (${(score * 100).toFixed(2)}%)`, bbox[0], bbox[1] > 10 ? bbox[1] - 5 : 10);
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript.trim().toLowerCase();
        const result = fuse.search(transcript);

        if (result.length > 0 && result[0].score < 0.4 && !commandDetected) {
            commandDetected = true; // Set the flag to prevent multiple detections
            const synth = window.speechSynthesis;
            
            const voices = synth.getVoices();
            console.log(voices);

            for (const [key, value] of Object.entries(preds)) {
                const utter = new SpeechSynthesisUtterance(`${value} ${pluralize(key, value)}`);
                utter.voice = synth.getVoices()[0];
                utter.pitch = 1;
                utter.rate = 1;
                utter.volume = 1;
                utter.lang = 'en-US';

                // Reset commandDetected when utterance ends
                utter.onend = () => {
                    commandDetected = false; // Reset the flag after speaking
                };

                synth.speak(utter);
            }
        }
    };

    recognition.onend = () => {
        recognition.start(); // Restart recognition if it ends
    };

    recognition.onerror = (e) => {
        console.error("Speech recognition error:", e.error);
    };

    // Start recognition after video is loaded
    video.elt.addEventListener('loadeddata', () => {
        recognition.start();
        console.log("Speech recognition started.");
    });
}
