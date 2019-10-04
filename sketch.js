let video;
let poseNet;
let poses = [];
let options = {
    imageScaleFactor: 0.3,
    outputStride: 16,
    minConfidence: 0.3,
    maxPoseDetections: 1,
    detectionType: 'single',
    multiplier: 0.75,
}

let videoFile = 'Top Fifteen Female Ballet Dancers.mp4';
let videoFrom = 100;
let videoTo = 200;
let videoDuration = -1;
let frameCounter = 0;
let minScore = 0.6;
let lastVideoTime = -1;

let isVideoPlaying = false;

let json = {
    frames: []
};

//Slider code: https://codepen.io/faur/pen/WXzQxN


function setup() {


    var canvas = createCanvas(1280, 720);
    canvas.parent('main');

    video = createVideo(['video/' + videoFile]);
    video.onended(videoEnded);
    video.hide();

    buttonPlay = select('#buttonPlay');
    buttonPlay.html('Extract features');
    buttonPlay.mousePressed(togglePlay);
    buttonPlay.attribute('disabled', true);

    buttonSave = select('#buttonSave');
    buttonSave.html('Save features');
    buttonSave.mousePressed(saveData);
    buttonSave.attribute('disabled', true);

    frameCounterElt = select('#frameCounter');
    frameCounterElt.hide();

    minScoreElt = select('#minScore');
    minScoreElt.html('Min. score ' + minScore);

    poseNet = ml5.poseNet(video, options, modelReady);
    poseNet.on('pose', function(results) {
        poses = results;
    });

}


function draw() {

    if (video.elt.duration !== 'undefined' && !isNaN(video.elt.duration) && videoDuration == -1) {
        videoDuration = video.elt.duration;
        //videoDuration= 300;
        $("#spinnerFrom").spinner({
            min: 0,
            max: videoDuration,
            step: 0.02,
            value: videoFrom,
            spin: function(event, ui) {
                videoFrom = ui.value;
                $("#sliderRange").slider("values", [videoFrom, videoTo]);
            }
        });
        $("#spinnerFrom").width(80);
        $("#spinnerTo").spinner({
            min: 0,
            max: videoDuration,
            step: 0.02,
            value: videoTo,
            spin: function(event, ui) {
                videoTo = ui.value;
                $("#sliderRange").slider("values", [videoFrom, videoTo]);
            }            
        });
        $("#spinnerTo").width(80);
        $("#sliderRange").slider({
            range: true,
            min: 0,
            max: videoDuration,
            values: [videoFrom, videoTo],
            step: 0.02,
            slide: function(event, ui) {
                videoFrom = ui.values[0];
                videoTo = ui.values[1];
                $("#spinnerFrom").spinner("value", videoFrom);
                $("#spinnerTo").spinner("value", videoTo);
            }
        });
        $("#spinnerFrom").spinner("value", videoFrom);
        $("#spinnerTo").spinner("value", videoTo);
    }

    image(video, 0, 0, width, height);

    currVideoTime = video.time();

    if (poses.length > 0) {
        drawJoints();
        if (isVideoPlaying && currVideoTime > lastVideoTime) {
            json.frames.push({ "frame": frameCounter, "time": currVideoTime, "data": poses[0].pose.keypoints })
            frameCounter++;
            lastVideoTime = currVideoTime;
        }
    }

    if (isVideoPlaying && currVideoTime >= videoTo) {

        video.stop().time(videoFrom);

        json.filename = videoFile;
        json.videoStart = videoFrom;
        json.videoEnd = videoTo;
        json.totalFames = frameCounter;

        buttonSave.removeAttribute('disabled');

        buttonPlay.html('Extract features');
        frameCounter = 0;
        isVideoPlaying = false;
        lastVideoTime = -1;

    }
    frameCounterElt.html('Frame ' + frameCounter);
}


function togglePlay() {

    buttonSave.attribute('disabled', true);

    if (!isVideoPlaying) {
        video.play().time(videoFrom);
        buttonPlay.html('Stop');
    } else {
        video.stop().time(videoFrom);
        buttonPlay.html('Extract features');
        frameCounter = 0;
    }
    isVideoPlaying = !isVideoPlaying;
}


function modelReady() {
    buttonPlay.removeAttribute('disabled');
    frameCounterElt.show();
    video.time(videoFrom);
}


function videoEnded() {}


function drawSkeletons() {

    stroke(255);
    strokeWeight(2);
    for (let i = 0; i < poses.length; i++) {
        for (let j = 0; j < poses[i].skeleton.length; j++) {
            let partA = poses[i].skeleton[j][0];
            let partB = poses[i].skeleton[j][1];
            line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
    }
}


function drawJoints() {

    noStroke();

    for (let i = 0; i < poses.length; i++) {

        let radius;

        if (poses[i].pose.score >= minScore) {
            fill(255);
            radius = 12;
        } else {
            fill(255, 120, 90);
            radius = 7;
        }

        for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
            circle(poses[i].pose.keypoints[j].position.x, poses[i].pose.keypoints[j].position.y, radius);
        }
    }
}


function saveData() {
    saveJSON(json, videoFile + '.json');
}