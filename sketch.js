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

let playFrom = 205;
let isVideoPlaying = false;

function setup() {

    var canvas = createCanvas(1280, 720);
    canvas.parent('main');

    video = createVideo(['video/Top Fifteen Female Ballet Dancers.mp4']);
    video.onended(videoEnded);
    video.hide();

    buttonPlay = select('#buttonPlay');
    buttonPlay.hide();
    buttonPlay.mousePressed(togglePlay);

    poseNet = ml5.poseNet(video, options, modelReady);
    poseNet.on('pose', function(results) {
        poses = results;
    });

}

function togglePlay() {
    if (!isVideoPlaying) {
        video.play().time(playFrom);
        buttonPlay.html('Stop');
    } else {
        video.stop().time(playFrom);
        buttonPlay.html('Play');
    }
    isVideoPlaying = !isVideoPlaying;
}


function modelReady() {
    buttonPlay.show();
    video.time(playFrom);
}


function videoEnded() {}


function draw() {

    image(video, 0, 0, width, height);
    if (poses.length > 0) {
        //drawSkeletons();
        drawJoints();
    }

}


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


    stroke(255);
    strokeWeight(2);

    for (let i = 0; i < poses.length; i++) {
        for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
            circle(poses[i].pose.keypoints[j].position.x, poses[i].pose.keypoints[j].position.y, 5);
        }
    }
}