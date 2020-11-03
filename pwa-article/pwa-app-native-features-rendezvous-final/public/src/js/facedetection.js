const isScreenSmall = window.matchMedia("(max-width: 700px)");
let predictedAges = [];

const screenResize = (isScreenSmall) => {
  if (isScreenSmall.matches) {
    // If media query matches
    videoPlayer.style.width = "320px";
  } else {
    videoPlayer.style.width = "500px";
  }
};

screenResize(isScreenSmall); // Call listener function at run time
isScreenSmall.addListener(screenResize);

const interpolateAgePredictions = (age) => {
    predictedAges = [age].concat(predictedAges).slice(0, 30);
    const avgPredictedAge =
        predictedAges.reduce((total, a) => total + a) / predictedAges.length;
    return avgPredictedAge;
};

videoPlayer.addEventListener("playing", () => {
  const canvasForFaceDetection = faceapi.createCanvasFromMedia(videoPlayer);
  let containerForFaceDetection = document.querySelector(".container-faceDetection");
  containerForFaceDetection.append(canvasForFaceDetection);

  const displaySize = { width: 500, height: 500};
  faceapi.matchDimensions(canvasForFaceDetection, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectSingleFace(videoPlayer, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    if (detections) {
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvasForFaceDetection.getContext("2d").clearRect(0, 0, 500, 500);

      faceapi.draw.drawDetections(canvasForFaceDetection, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvasForFaceDetection, resizedDetections);
      if (resizedDetections && Object.keys(resizedDetections).length > 0) {
        const age = resizedDetections.age;
        const interpolatedAge = interpolateAgePredictions(age);
        const gender = resizedDetections.gender;
        const expressions = resizedDetections.expressions;
        const maxValue = Math.max(...Object.values(expressions));
        const emotion = Object.keys(expressions).filter(
          item => expressions[item] === maxValue
        );
        document.getElementById("age").innerText = `Age - ${interpolatedAge}`;
        document.getElementById("gender").innerText = `Gender - ${gender}`;
        document.getElementById("emotion").innerText = `Emotion - ${emotion[0]}`;
      }
    }
  }, 10000);
});
