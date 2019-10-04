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
let playFrom = 209;
let playTo = 213.8;
let frameCounter = 0;
let minScore = 0.6;

let isVideoPlaying = false;

let json = {
    frames:[]
};

function setup() {

    var canvas = createCanvas(1280, 720);
    canvas.parent('main');

    video = createVideo(['video/' + videoFile]);
    video.onended(videoEnded);
    video.hide();

    buttonPlay = select('#buttonPlay');
    buttonPlay.hide();
    buttonPlay.mousePressed(togglePlay);

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

    image(video, 0, 0, width, height);
    if (poses.length > 0) {
        //drawSkeletons();
        drawJoints();
        if (isVideoPlaying) {
            json.frames.push({ "frame": frameCounter, "time": video.time(), "data": poses[0].pose.keypoints })
            frameCounter++;
        }
    }

    if (isVideoPlaying && video.time() >= playTo) {

        video.stop().time(playFrom);

        json.filename = videoFile;
        json.videoStart = playFrom;
        json.videoEnd = playTo;
        json.totalFames = frameCounter;
        saveJSON(json, videoFile + '.json')

        buttonPlay.html('Play');
        frameCounter = 0;
        isVideoPlaying = false;
        console.log(json);
    }
    frameCounterElt.html('Frame ' + frameCounter);
}


function togglePlay() {

    if (!isVideoPlaying) {
        video.play().time(playFrom);
        buttonPlay.html('Stop');
    } else {
        video.stop().time(playFrom);
        buttonPlay.html('Play');
        frameCounter = 0;
    }
    isVideoPlaying = !isVideoPlaying;
}


function modelReady() {
    buttonPlay.show();
    frameCounterElt.show();
    video.time(playFrom);
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