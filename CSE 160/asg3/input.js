// input.js
// organizes input functions
let keysPressed = {};
let mouseMovement = [0,0];

function accel(evt) {
    evt.preventDefault();
    let s = camera.speed + evt.deltaY * -.0002;
    camera.speed = s > 0 ? s : camera.speed;
}

function mouseMove(evt) {
    mouseMovement[0] = evt.movementX;
    mouseMovement[1] = evt.movementY;
}


function mouseClick(evt) {
    if (editMode == 'editWorld') {
        if (evt.button == 0) {
            world.break(camera.lookingAt());
        }
        else if (evt.button == 2) {
            world.placeBlock(camera.lookingAt());
        }
    }
}

function lockChange() {
    if (document.pointerLockElement == canvas) {
        canvas.addEventListener('mousemove', mouseMove);
        canvas.onclick = mouseClick;
        canvas.onwheel = accel;
    }
    else {
        canvas.removeEventListener('mousemove', mouseMove);
        canvas.removeEventListener('click', mouseClick);
        canvas.onclick = () => canvas.requestPointerLock();
        canvas.onwheel = null;
        window.onkeydown = function () {};
    }
}

document.addEventListener('keydown', evt => {
    evt.preventDefault();
    keysPressed[evt.key.toLowerCase()] = true;
});
document.addEventListener('keyup', 
    evt => keysPressed[evt.key.toLowerCase()] = false);

document.addEventListener('pointerlockchange', lockChange);
