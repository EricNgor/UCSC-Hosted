// Eric Ngor
// Assignment 2

// Shader programs
let VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    precision mediump float;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`
let FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    varying vec2 v_UV;
    uniform sampler2D u_Sampler0;
    uniform int u_FillType;
    void main() {
        if (u_FillType == 0) {
            gl_FragColor = u_FragColor;
        }
        else if (u_FillType == 1) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        }
        else if (u_FillType == 2) {
            // gl_FragColor = 0.9*texture2D(u_Sampler0, v_UV) * 0.1*(u_FragColor);
            gl_FragColor = texture2D(u_Sampler0, v_UV);
            gl_FragColor.a = 0.8;
        }
        else {
            gl_FragColor = vec4(1,.2,.2,1);
        }
    }`

let canvas,gl;
let a_Position, a_UV; 
let u_FragColor, u_Size, u_ModelMatrix, u_GlobalRotateMatrix;
let u_ProjectionMatrix, u_Sampler0, u_FillType;
let world;
let camera;
let mode, editMode;


function setupWebGL() {
    canvas = document.getElementById('asg3');
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true} );
    gl.enable(gl.DEPTH_TEST);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL')
        return;
    }
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get storage location of a_Position');
        return;
    }
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get storage location of a_UV');
        return;
    }
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get storage location of u_FragColor');
        return;
    }
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get storage location of u_ModelMatrix');
        return;
    }
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get storage location of u_GlobalRotateMatrix');
        return;
    }
    u_FillType = gl.getUniformLocation(gl.program, 'u_FillType');
    if (!u_FillType) {
        console.log('Failed to get storage location of u_FillType');
        return;
    }
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get storage location of u_ViewMatrix');
        return;
    }
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get storage location of u_ProjectionMatrix');
        return;
    }
    

}

function setupEvents() {
    canvas.onclick = () => canvas.requestPointerLock();
    
    mode = 'roaming';
    document.getElementById('roaming').addEventListener('input', () => mode = 'roaming');
    document.getElementById('walking').addEventListener('input', () => mode = 'walking');
    editMode = 'editWorld';
    document.getElementById('editWorld').addEventListener('input', () => mode = 'editWorld');
    document.getElementById('none').addEventListener('input', () => mode = 'none');

    document.addEventListener('keydown', evt => {
        if (evt.key == 'g') {
            let r = document.getElementById('roaming');
            let w = document.getElementById('walking');
            if (mode == 'roaming') {
                r.checked = false; w.checked = true; mode = 'walking';
            } else if (mode == 'walking') {
                r.checked = true; w.checked = false; mode = 'roaming';
            }
        }
        if (evt.key == 'r') {
            let e = document.getElementById('editWorld');
            let n = document.getElementById('none');
            if (editMode == 'editWorld') {
                e.checked = false; n.checked = true; editMode = 'none';
            }
            else if (editMode == 'none') {
                    e.checked = true; n.checked = false; editMode = 'editWorld';
                    
            }
        }

    });
}

function initTextures() {
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return false;
    }
    let image = new Image();
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }

    image.onload = () => sendTextureToGLSL(image);
    image.src = 'block.jpg';

    return true;
}

function sendTextureToGLSL(image) {
    let texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
}


function updateMatrices() {
    // Matrix initial
    const identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

    gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);
    
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);

    let globalRotMat = new Matrix4();
    globalRotMat.rotate(1,0,0,1);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
}

function updateHTML() {
    document.getElementById('speed').value = camera.speed.toFixed(2);
    let p = camera.eye.elements;
    document.getElementById('coords').value = 
        `(${p[0].toFixed(2)}, ${p[1].toFixed(2)}, ${p[2].toFixed(2)})`;
}

function updateFrame() {
    if      (keysPressed['w'])     camera.moveForward(mode);
    else if (keysPressed['s'])     camera.moveBackwards(mode);
    if      (keysPressed['a'])     camera.moveLeft(mode);
    else if (keysPressed['d'])     camera.moveRight(mode);
    
    if      (keysPressed['q'])     camera.pan(-2);
    else if (keysPressed['e'])     camera.pan(2);
    if      (keysPressed[' '])     camera.moveUp(mode);
    else if (keysPressed['shift']) camera.moveDown(mode);

    if (mode == 'walking') {
        camera.gravity();
    }

    

    camera.pan(mouseMovement[0] / 3);
    camera.tilt(mouseMovement[1] / 3);

    updateHTML();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    updateMatrices();
    if (editMode == 'editWorld') {
        let at = new Cube(2);
        let atCoords = camera.lookingAt();
        at.matrix.translate(
            atCoords[0], atCoords[1], atCoords[2]
        );
        at.render();
    }
    
    world.update();


    mouseMovement[0] = 0.0;
    mouseMovement[1] = 0.0;
    requestAnimationFrame(updateFrame);
}



function main() {
    // canvas and gl variables
    setupWebGL();
    // connect JS variables to GLSL
    connectVariablesToGLSL();
    // setup document interactive events
    setupEvents();

    // Clear canvas
    gl.clearColor(0,0,0,1.0);

    world = new World(32);
    camera = new Camera();

    initTextures();
    requestAnimationFrame(updateFrame);
}
