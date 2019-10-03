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

    createCanvas(1280, 720);

    video = createVideo(['video/Top Fifteen Female Ballet Dancers.mp4']);
    video.onended(videoEnded);
    video.hide();

    button = createButton("Play");
    button.mousePressed(togglePlay);
    button.style('color', color('#ffffff'));
    button.style('background-color', color('#3262b5'));
    button.style('border-radius', '.25rem');
    button.style('font-size', '1rem');
    button.hide();


button.style('display', 'inline-block');
button.style('font-weight', '400');
button.style('text-align', 'center');
button.style('white-space', 'nowrap');
button.style('vertical-align', 'middle');
button.style('border', '1px solid transparent');
button.style('padding', '.375rem .75rem');
button.style('line-height', '1.5');



    poseNet = ml5.poseNet(video, options, modelReady);
    poseNet.on('pose', function(results) {
        poses = results;
    });

}

function togglePlay() {
    if (!isVideoPlaying) {
        video.play().time(playFrom);
        button.html('Stop');
    } else {
        video.stop().time(playFrom);
        button.html('Play');
    }
    isVideoPlaying = !isVideoPlaying;
}


function modelReady() {
    button.show();
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