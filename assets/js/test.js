function drawBoundingBoxes(predictions, image) {
    predictions.forEach((prediction) => {
        const bbox = prediction.bbox
        const x = bbox[0]
        const y = bbox[1]
        const width = bbox[2]
        const height = bbox[3]
        const className = prediction.class
        const confScore = prediction.score
        const color = [0, 255, 0, 200]
        let pnt1 = new cv.Point(x, y)
        let pnt2 = new cv.Point(x + width, y + height)
        cv.rectangle(image, pnt1, pnt2, color, 2)
        const text = `${className} - ${Math.round(confScore * 100) / 100}`
        const font = cv.FONT_HERSHEY_TRIPLEX
        const fontsize = 0.70
        const thickness = 1
        const canvas = document.createElement('canvas')
        const context = canvas.getContext("2d")
        const textMetrics = context.measureText(text)
        const twidth = textMetrics.width
        cv.rectangle(image, new cv.Point(x, y-20), new cv.Point(x + twidth + 150, y), color, -1)
        cv.putText(image, text, new cv.Point(x, y-5), font, fontsize, new cv.Scalar(255, 255, 255, 255), thickness)
    })
}


function OpenCVReady(){
    cv["onRuntimeInitialized"] = () => {
        const video = document.querySelector("#webcam")
        let model = undefined
        let streaming = false
        let src
        let cap
        const fps = 24

        const grammar = `#JSGF V1.0; grammar commands; public <command> = see for me`
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
        const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent
        const recognition = new SpeechRecognition()
        const recognitionList = new SpeechGrammarList()
        recognitionList.addFromString(grammar, 1)
        recognition.grammars = recognitionList
        recognition.continuous = true
        recognition.lang = "en-US"
        recognition.interimResults = false
        recognition.maxAlternatives = 0

        recognition.onresult = (e) => {
            if (e.results[0][0].transcript == "see for me") {
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

        recognition.onnomatch = (e) => {
            console.log("not recognized")
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
        
        function enableCam() {
            if (!model) {
                return
            }
            navigator.mediaDevices.getUserMedia({'video' : true, 'audio' : false}).then((stream) => {
                video.srcObject = stream
                video.addEventListener('loadeddata', predictWebcam)
            })
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

        function predictWebcam() {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
                
                const begin = Date.now()
                src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4)
                cap = new cv.VideoCapture(video)
                cap.read(src)
                
                // Flip the image horizontally (mirror effect)
                cv.flip(src, src, 1);

                model.detect(video).then((predictions) => {
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
        
        // setTimeout(() => {
        //     enableCam();
        //     streaming = true;
        //     recognition.start();
        //     console.log('test');
        // }, 1000);
    }

}
