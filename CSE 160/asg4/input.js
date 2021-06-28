// input.js
// organizes input functions
let keysPressed = {};
let mouseMovement = [0,0];

function accel(evt) {
    evt.preventDefault();
    let s = camera.speed + evt.deltaY * -.0004;
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

function keyDown(evt) {
    evt.preventDefault();
    keysPressed[evt.key.toLowerCase()] = true;
}

function keyUp(evt) {
    keysPressed[evt.key.toLowerCase()] = false;
}

function lockChange() {
    if (document.pointerLockElement == canvas) {
        canvas.addEventListener('mousemove', mouseMove);
        canvas.onclick = mouseClick;
        canvas.onwheel = accel;
        document.addEventListener('keydown', keyDown);
        document.addEventListener('keyup', keyUp);  

    }
    else {
        canvas.removeEventListener('mousemove', mouseMove);
        canvas.removeEventListener('click', mouseClick);
        canvas.onclick = () => canvas.requestPointerLock();
        canvas.onwheel = null;
        window.onkeydown = function () {};
        mouseMovement[0] = 0; mouseMovement[1] = 0;

        document.removeEventListener('keydown', keyDown);
        document.removeEventListener('keyup', keyUp);
    }
}

document.addEventListener('pointerlockchange', lockChange);
