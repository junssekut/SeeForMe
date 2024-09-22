function drawBoundingBoxes(predictions, image) {
    const imageWidth = image.cols; // Get the width of the image
    predictions.forEach((prediction) => {
        const bbox = prediction.bbox;
        const x = imageWidth - bbox[0] - bbox[2]; // Adjust x for mirrored image
        const y = bbox[1];
        const width = bbox[2];
        const height = bbox[3];
        const className = prediction.class;
        const confScore = prediction.score;
        const color = [0, 255, 0, 200];
        let pnt1 = new cv.Point(x, y);
        let pnt2 = new cv.Point(x + width, y + height);
        cv.rectangle(image, pnt1, pnt2, color, 2);
        const text = `${className} - ${Math.round(confScore * 100) / 100}`;
        const font = cv.FONT_HERSHEY_TRIPLEX;
        const fontsize = 0.70;
        const thickness = 1;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext("2d");
        const textMetrics = context.measureText(text);
        const twidth = textMetrics.width;
        cv.rectangle(image, new cv.Point(x, y - 20), new cv.Point(x + twidth + 150, y), color, -1);
        cv.putText(image, text, new cv.Point(x, y - 5), font, fontsize, new cv.Scalar(255, 255, 255, 255), thickness);
    });
}

function OpenCVReady(){
    cv["onRuntimeInitialized"] = () => {
        const video = document.querySelector("#webcam")
        
        if (IS_MOBILE) {
            // video.width = window.innerWidth;
            // video.height = window.innerHeight;

            // video.width = '640';
            // video.height = '480';

            $('#main-canvas').css('width', `${video.width}px`).css('height', `${video.height}px`);
        } else {
            video.width = '640';
            video.height = '480';
        }

        let model = undefined
        let streaming = false
        let src
        let cap
        const fps = 24

        // const grammar = `#JSGF V1.0; grammar commands; public <command> = see for me`
        const validCommands = ['see for me', 'look for me', 'show me', 'see it for me'];
        const fuse = new Fuse(validCommands, { includeScore: true, threshold: 1.0 });

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
        const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent
        const recognition = new SpeechRecognition()
        const recognitionList = new SpeechGrammarList()
        // recognitionList.addFromString(grammar, 1)
        // recognition.grammars = recognitionList
        recognition.continuous = true
        recognition.lang = "en-US"
        recognition.interimResults = true
        recognition.maxAlternatives = 1

        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript.trim().toLowerCase();
            const result = fuse.search(transcript);

            if (result.length > 0 && result[0].score < 0.4) {
                const synth = window.speechSynthesis
                for (const [key, value] of Object.entries(preds)){
                    const utter = new SpeechSynthesisUtterance(`${value} ${pluralize(key, value)}`)
                    utter.voice = synth.getVoices()[0]
                    utter.pitch = 1
                    utter.rate = 1
                    utter.volume = 1
                    utter.lang = 'en-US'
                    synth.speak(utter)
                }
            }
        }

        if(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            document.querySelector("#enablewebcam").addEventListener("click", () => {
                if (!streaming) {
                    enableCam()
                    streaming = true
                    recognition.start();
                } else {
                    streaming = false
                    video.pause()
                    recognition.stop();
                    video.srcObject = null 
                }
            
            })
        } else {
            console.log("getUserMedia is not supported")
        }
        
        // function enableCam() {
        //     if (!model) {
        //         return
        //     }
        //     navigator.mediaDevices.getUserMedia({'video' : true, 'audio' : false}).then((stream) => {
        //         video.srcObject = stream
        //         video.addEventListener('loadeddata', predictWebcam)
        //     })
        // }

        function enableCam() {
            if (!model) {
                return;
            }
        
            const constraints = {
                video: {
                    facingMode: { ideal: "environment" },
                    // width: { ideal: 640 },
                    // height: { ideal: 480 }
                },
                audio: false
            };
        
            navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                video.srcObject = stream;
                
                video.addEventListener('loadedmetadata', () => {
                    const videoWidth = video.videoWidth;
                    const videoHeight = video.videoHeight;

                    console.log("Current Webcam Resolution:", videoWidth, "x", videoHeight);

                    video.width = videoWidth;
                    video.height = video.height;

                    $('#main-canvas').css('width', `${videoWidth}px`).css('height', `${videoHeight}px`);
                    
                    predictWebcam(videoWidth, videoHeight);
                });

                video.addEventListener('error', (e) => {
                    console.error("Error with the video element: ", e);
                });
            })
            .catch((error) => {
                console.error("Error accessing the camera: ", error.name, error.message);
            });
        }
        
        

        setTimeout(() => {
            cocoSsd.load().then((loadedModel) => {
                model = loadedModel
                console.log("Model Loaded")
                enableCam();
                streaming = true;
                recognition.start();
            })
        }, 0);

        let preds = {}

        function predictWebcam(videoWidth, videoHeight) {
            if (videoWidth > 0 && videoHeight > 0) {
                
                const begin = Date.now()
                src = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4)
                
                cap = new cv.VideoCapture(video)
                cap.read(src)

                cv.flip(src, src, 1); // The last argument '1' specifies horizontal flipping

                model.detect(src).then((predictions) => {
                    preds = {}
                    predictions.forEach((prediction) => {
                        if (!(prediction['class'] in preds)) {
                            preds[prediction['class']] = 1
                        } else {
                            preds[prediction['class']] += 1
                        }
                    })
                    console.log("predictions ", preds)
                    if (predictions.length > 0) {
                        drawBoundingBoxes(predictions, src)
                        cv.imshow("main-canvas", src)
                        const delay = 1000/fps - (Date.now() - begin)
                        setTimeout(predictWebcam, delay)
                        src.delete()
                    } else {
                        cv.imshow("main-canvas", src)
                        const delay = 1000/fps - (Date.now() - begin)
                        setTimeout(predictWebcam, delay)
                        src.delete()
                    }
                    
                })
            } else {
                window.requestAnimationFrame(predictWebcam)
            }
        }
    }

}
