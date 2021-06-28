// Eric Ngor
// Assignment 4

// Shader programs
let VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_vertPos;
    precision mediump float;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;

    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        // v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
        v_Normal = a_Normal;
        v_vertPos = u_ModelMatrix * a_Position;
    }
`;

let FSHADER_SOURCE = `
    #define MAX_LIGHTS 10
    precision mediump float;
    uniform vec4 u_FragColor;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    uniform sampler2D u_Sampler0;
    uniform int u_FillType;
    uniform vec3 u_lightPos[MAX_LIGHTS];
    varying vec4 v_vertPos;
    uniform vec3 u_cameraPos;
    uniform bool u_lighting;
    uniform bool u_lightDir;
    uniform vec3 u_lightDirection;

    void calcLight(vec3 light) {
        vec3 lightVec = light - vec3(v_vertPos);
        // float r = length(lightVec);

        // N dot L
        vec3 L = normalize(lightVec);
        vec3 N = normalize(v_Normal);
        float nDotL = max(dot(N,L), 0.0);

        // Reflection
        vec3 R = reflect(-L, N);

        // eye
        vec3 E = normalize(u_cameraPos - vec3(v_vertPos));

        // Specular
        float specular = pow(max(dot(E, R), 0.0), 2.0) / 3.0;

        vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
        vec3 ambient = vec3(gl_FragColor) * 0.3;
        // gl_FragColor = max(specular+diffuse+ambient+1, dot(gl_FragColor, vec4(1,1,1,1)));
        // vec4 color = vec4(specular + diffuse + ambient, 1.0);
        gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
        if (u_FillType == 2) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);
            gl_FragColor.a = 0.7;
        }

        if (u_lightDir) {
            float light = dot(N, normalize(u_lightDirection));
            gl_FragColor.rgb *= light;
        }
        // return color;
    }

    void main() {
        if (u_FillType == 0) {
            gl_FragColor = u_FragColor;
        }
        else if (u_FillType == -1) { // sphere
            gl_FragColor = u_FragColor;
        }
        else if (u_FillType == 1) { // block
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        }
        else if (u_FillType == 3) { // normals test
            gl_FragColor = vec4((v_Normal+1.0) / 2.0, 1.0);
        }
        else {
            gl_FragColor = vec4(1,.2,.2,1);
        }

        if (u_lighting) {
            for (int i = 0; i < 1; ++i) {
                calcLight(u_lightPos[i]);
            }
        }

        // Elements not affected by lighting
        if (u_FillType == -2) { // sky
            gl_FragColor = u_FragColor;
        }
        else if (u_FillType == 2) { // cursor block
            gl_FragColor = texture2D(u_Sampler0, v_UV);
            gl_FragColor.a = 0.7;
        }

    }
`;

let canvas,gl;
let a_Position, a_UV; 
let u_FragColor, u_Size, u_ModelMatrix, u_GlobalRotateMatrix, u_ProjectionMatrix;
let u_Sampler0, u_FillType, u_lightPos = [], u_cameraPos, u_lighting, u_lightDir; 
let u_lightDirection;
let world;
let camera;
let mode = 'roaming', editMode = 'none';
let lightSpeed = 1;
g_lightPos = [[]];
g_numLights = 1;
g_normal = false;
g_lighting = true;
g_lightDir = false;
g_lightDirection = [0.2, 1, 0.2];


function setupWebGL() {
    canvas = document.getElementById('asg4');
    gl = canvas.getContext('webgl', { premultipliedAlpha: false });
    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
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
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get storage location of a_Normal');
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
    for (let i = 0; i < g_numLights; ++i) {
        u_lightPos[i] = gl.getUniformLocation(gl.program, `u_lightPos[${i}]`);
        if (!u_lightPos[i]) {
            console.log(`Failed to get storage location of u_lightPos[${i}]`);
        }
    }
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
        console.log('Failed to get storage location of u_cameraPos');
    }
    u_lighting = gl.getUniformLocation(gl.program, 'u_lighting');
    if (!u_lighting) {
        console.log('Failed to get storage location of u_lighting');
    }
    u_lightDir = gl.getUniformLocation(gl.program, 'u_lightDir');
    if (!u_lightDir) {
        console.log('Failed to get storage location of u_lightDir');
    }
    u_lightDirection = gl.getUniformLocation(gl.program, 'u_lightDirection');
    if (!u_lightDirection) {
        console.log('Failed to get storage location of u_lightDirection');
    }

}

function setupEvents() {
    canvas.onclick = () => canvas.requestPointerLock();

    let roaming = document.getElementById('roaming');
    let walking = document.getElementById('walking');
    roaming.addEventListener('input', () => {
        walking.checked = false;
        mode = 'roaming';
    });
    walking.addEventListener('input', () => {
        roaming.checked = false;
        mode = 'walking';
        this.v = 0;
    });

    let edit = document.getElementById('editWorld');
    let none = document.getElementById('none');
    edit.addEventListener('input', () => {
        mode = 'editWorld';
        none.checked = false;
    });
    none.addEventListener('input', () => {
        mode = 'none';
        edit.checked = false;
    });

    document.addEventListener('keydown', evt => {
        if (evt.key == 'c') {
            if (mode == 'roaming') {
                roaming.checked = false; walking.checked = true; mode = 'walking';
            } else if (mode == 'walking') {
                roaming.checked = true; walking.checked = false; mode = 'roaming';
            }
        }
        if (evt.key == 'r') {
            if (editMode == 'editWorld') {
                edit.checked = false; none.checked = true; editMode = 'none';
            }
            else if (editMode == 'none') {
                edit.checked = true; none.checked = false; editMode = 'editWorld';
                    
            }
        }
    });

    let nb = document.getElementById('normalButton');
    nb.addEventListener('click', () => {
        nb.value = nb.value == "Normals: OFF" ? "Normals: ON" : "Normals: OFF";
        g_normal = !g_normal;
    });

    gl.uniform1i(u_lighting, g_lighting);
    let lb = document.getElementById('lightButton');
    lb.addEventListener('click', () => {
        lb.value = lb.value == 'Lighting: ON' ? 'Lighting: OFF' : 'Lighting: ON';
        g_lighting = !g_lighting;
        gl.uniform1i(u_lighting, g_lighting);
    });

    gl.uniform1i(u_lightDir, g_lightDir);
    let dlb = document.getElementById('lightDirButton');
    dlb.addEventListener('click', () => {
        dlb.value = dlb.value == 'Directional Lighting: ON' ? 'Directional Lighting: OFF' : 'Directional Lighting: ON';
        g_lightDir = !g_lightDir;
        gl.uniform1i(u_lightDir, g_lightDir);
    });

    g_lightPos[0][1] = parseFloat(document.getElementById('lightY').value);
    document.getElementById('lightY').addEventListener('input', function() { g_lightPos[0][1] = this.value });
    document.getElementById('lightSpeed').addEventListener('input', function() { lightSpeed = this.value });
    document.getElementById('lightDirX').addEventListener('input', function() { g_lightDirection[0] = this.value });
    document.getElementById('lightDirY').addEventListener('input', function() { g_lightDirection[1] = -this.value });
    document.getElementById('lightDirZ').addEventListener('input', function() { g_lightDirection[2] = -this.value });

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
    globalRotMat.rotate(0,0,0,1);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
}

function updateHTML() {
    document.getElementById('speed').value = camera.speed.toFixed(2);
    let p = camera.eye.elements;
    document.getElementById('coords').value = 
        `(${p[0].toFixed(2)}, ${p[1].toFixed(2)}, ${p[2].toFixed(2)})`;

    // get index of direction with greatest magnitude
    let f = Array.from(camera.f.elements).map(e => parseFloat(e.toFixed(3)));
    let fp = f.map(e => Math.abs(e)); // 
    let i = fp.indexOf(Math.max.apply(null, fp));
    let direction;

    switch(i) {
        case 0:
            direction = f[0]>=0 ? 'X' : '-X'; break;
        case 1:
            direction = f[1]>=0 ? 'Y' : '-Y'; break;
        case 2:
            direction = f[2]>=0 ? 'Z' : '-Z'; break;
        default:
            direction = 'where are you looking??'
    }
    document.getElementById('facing').value = direction;
    
}

function updateGLSL() {
    // gl.uniform3f(u_lightPos[0], g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    for (let i = 0; i < g_numLights; ++i) { // for each light
        gl.uniform3f(u_lightPos[i], g_lightPos[i][0], g_lightPos[i][1], g_lightPos[i][2]);
    }
    // gl.uniform3f(u_lightPos[0], g_lightPos[0][0], g_lightPos[0][1], g_lightPos[0][2])
    gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
    gl.uniform3f(u_lightDirection, g_lightDirection[0], g_lightDirection[1], g_lightDirection[2]);
}

function updateAnimation(seconds) {
    let r = seconds * lightSpeed;
    let d = 75;
    // console.log(`cosr: ${Math.cos(r)}`);
    g_lightPos[0][0] = parseFloat(g_lightPos[0][0]);

    for (let i = 0; i < g_numLights; ++i) {
        // g_lightPos[i][0] += Math.cos(g_seconds);
        g_lightPos[i][0] = -5 + (Math.cos(r) * d);
        g_lightPos[i][2] = -5 - (Math.sin(r) * d);

    }
}

g_startTime = performance.now()/1000.0;
function updateFrame() {
    let seconds = performance.now()/1000.0 - g_startTime;
    startTime = performance.now();

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

    if (document.pointerLockElement == canvas) {
        camera.pan(mouseMovement[0] / 3);
        camera.tilt(mouseMovement[1] / 3);
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    updateHTML();
    updateMatrices();
    updateAnimation(seconds);
    updateGLSL();

    if (editMode == 'editWorld') {
        let at = new Cube(2);
        let atCoords = camera.lookingAt();
        at.matrix.translate(
            atCoords[0], atCoords[1], atCoords[2]
        );
        at.render();
    }
    world.update();

    mouseMovement[0] = 0; mouseMovement[1] = 0;

    let duration = performance.now() - startTime;
    document.getElementById('ms').value = Math.floor(duration);
    document.getElementById('fps').value = Math.floor(1000/duration);
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
