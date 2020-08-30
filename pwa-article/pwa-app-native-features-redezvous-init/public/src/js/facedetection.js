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

// Implement the face detection HERE !
