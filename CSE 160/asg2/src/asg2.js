// Eric Ngor
// Assignment 2

// Shader programs
let VSHADER_SOURCE=
    `attribute vec4 a_Position;
    precision mediump float;
    uniform float u_Size;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;

    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        gl_PointSize = u_Size;   
    }`
let FSHADER_SOURCE=
    `precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`

let canvas,gl;
let a_Position; 
let u_FragColor, u_Size, u_ModelMatrix, u_GlobalRotateMatrix;
let g_globalAngleX=-21;
let g_globalAngleY=-40;
let g_globalAngleZ=1;
let g_rx=g_ry=0;
let g_rz=0;
let g=1;
let animate = false;
let g_armRPos=[0,0,0];
let g_armLPos=[0,0,0];
let g_armsRAngle=g_armsLAngle=0;


function setupWebGL() {
    canvas=document.getElementById('asg2');
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true});
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
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get storage location of u_Size');
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

}

function setupEvents() {
    document.getElementById('angleDisplay').value = `${g_globalAngleX}, ${g_globalAngleY.toFixed(2)}, ${g_globalAngleZ.toFixed(2)}`;
    // let tools = ['toolX', 'toolY', 'toolZ', 'toolscaleX', 'toolscaleY', 'toolscaleZ', 
    //              'toolrotX', 'toolrotY', 'toolrotZ'];

    // for (let i = 0; i < tools.length; ++i) {
    //     document.getElementById(tools[i]).addEventListener('input', () => renderScene());
    // }

    // tools.forEach(el => {
    //     document.getElementById(el).addEventListener('input', () => renderScene());
    // });

    // elx=document.getElementById('rotatorx');
    // elx.addEventListener('input', () => { 
    //     g_rx = elx.value; 
    //     renderScene() 
    // });
    // ely=document.getElementById('rotatory');
    // ely.addEventListener('input', () => { 
    //     g_ry = ely.value; 
    //     renderScene() 
    // });
    // elz=document.getElementById('rotatorz');
    // elz.addEventListener('input', () => { 
    //     g_rz = elz.value; 
    //     renderScene() 
    // });

    // document.getElementById('print').onclick = () => {
    //     let x = document.getElementById('toolX').value;
    //     let y = document.getElementById('toolY').value;
    //     let z = document.getElementById('toolZ').value;
    //     let sx = document.getElementById('toolscaleX').value;
    //     let sy = document.getElementById('toolscaleY').value;
    //     let sz = document.getElementById('toolscaleZ').value;
    //     let rx = document.getElementById('toolrotX').value;
    //     let ry = document.getElementById('toolrotY').value;
    //     let rz = document.getElementById('toolrotZ').value;
    //     console.log(`Printing current shape details:\n
    //     let REPLACE = new Cube([90,150,0,1]);
    //     REPLACE.matrix = 
    //     REPLACE.matrix.translate(${x}, ${y}, ${z}, 0);
    //     REPLACE.matrix.rotate(${rx}, ${ry}, ${rz}, 0);
    //     REPLACE.matrix.scale(${sx}, ${sy}, ${sz});
    //     REPLACE.matrix.translate(-.5,0,0,0);
    //     REPLACE.render();
    //     `);
    // }

    document.getElementById('toggle').onclick = () => {
        animate = !animate;
        renderScene();
    };

    let slideL = document.getElementById('armsLSlide');
    slideL.addEventListener('input', () => {
        g_armsLAngle = slideL.value;
        renderScene();
    })
    slideR = document.getElementById('armsRSlide');
    slideR.addEventListener('input', () => {
        g_armsRAngle = slideR.value;
        renderScene();
    })

    document.getElementById('resetAngle').onclick = () => {
        g_globalAngleX=g_globalAngleY=g_globalAngleZ=0;
        renderScene();
    };
    
    canvas.onmousemove = ev => {
        let x = ev.clientX;
        let y = ev.clientY;
        let rect = ev.target.getBoundingClientRect();
        x = ((x - rect.left) - canvas.height/2) / (canvas.height/2);
        y = (canvas.width/2 - (y - rect.top)) / (canvas.width/2);
        x = ((x+1)*5).toFixed(2); y = ((y+1)*5).toFixed(2);
        // document.getElementById("coords").value = `(${x}, ${y})`;
        if (ev.buttons == 1) {
            let xMov = parseInt(ev.movementX.toFixed(2));
            let yMov = parseInt(ev.movementY.toFixed(2));
            g_globalAngleX += xMov; 
            g_globalAngleY -= yMov;
            renderScene();
            
        }
        if (ev.buttons == 4) {
            let zMov = parseInt(ev.movementX.toFixed(2));
            g_globalAngleZ += zMov;
            renderScene();
        }
        document.getElementById('angleDisplay').value = `${g_globalAngleX}, ${g_globalAngleY.toFixed(2)}, ${g_globalAngleZ.toFixed(2)}`;
    }
}

function renderScene() {
    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Matrix initial
    const identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

    let globalRotMat = new Matrix4();
    globalRotMat.rotate(g_globalAngleY,1,0,0);
    globalRotMat.rotate(g_globalAngleX,0,1,0);
    globalRotMat.rotate(g_globalAngleZ,0,0,1);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    let ground = new Cube([158,118,69,1]);
    ground.matrix.translate(0, -0.44, -1.5, 0);
    ground.matrix.rotate(0, 0, 1, 0);
    ground.matrix.scale(2, 0.2, 3);
    ground.matrix.translate(-.5,0,0,0);
    ground.render();

    let body = new Cube([30,60,150,1]);
    body.matrix.translate(0, 0.05, -0.64, 0);
    body.matrix.rotate(0, 0, 1, 0);
    let bodyMat = new Matrix4(body.matrix); // body2
    let bodyMat2 = new Matrix4(body.matrix); // head
    let bodyMat3 = new Matrix4(body.matrix); // armsR
    let bodyMat4 = new Matrix4(body.matrix); // armsL
    let bodyMat5 = new Matrix4(body.matrix); // fin
    body.matrix.scale(0.4, 0.42, 0.58);
    body.matrix.translate(-.5,0,0,0);
    body.render();
    
    let armsR = new Cube([54, 2, 61,1]);
    armsR.matrix = bodyMat3;
    armsR.matrix.translate(g_armRPos[0],g_armRPos[1],g_armRPos[2]);
    armsR.matrix.translate(-.38, 0.1, 0.16, 0);
    let armsRMat = new Matrix4(armsR.matrix); // rightArm
    armsR.matrix.scale(0.36, 0.16, 0.16);
    armsR.matrix.translate(-.5,0,0,0);
    armsR.render();
    
    let armsL = new Cube([54, 2, 61,1]);
    armsL.matrix = bodyMat4;
    armsL.matrix.translate(g_armLPos[0],g_armLPos[1],g_armLPos[2]);
    armsL.matrix.translate(.38, 0.1, 0.16, 0);
    let armsLMat = new Matrix4(armsL.matrix); // rightArm
    armsL.matrix.scale(0.36, 0.16, 0.16);
    armsL.matrix.translate(-.5,0,0,0);
    armsL.render();

    let rightArm = new Cube([24,48,123,1]);
    rightArm.matrix = armsRMat;
    rightArm.matrix.translate(-.3101, .3,-.04);
    rightArm.matrix.rotate(g_armsRAngle,1,0,0);
    rightArm.matrix.scale(1,-1,1);
    rightArm.matrix.scale(0.26, 0.70, 0.24);
    rightArm.matrix.translate(-.5,0,0,0);
    rightArm.render();

    let leftArm = new Cube([24,48,123,1]);
    leftArm.matrix = armsLMat;
    leftArm.matrix.translate(.3101, .3,-.04);
    leftArm.matrix.rotate(g_armsLAngle,1,0,0);
    leftArm.matrix.scale(1,-1,1);
    leftArm.matrix.scale(0.26, 0.70, 0.24);
    leftArm.matrix.translate(-.5,0,0,0);
    leftArm.render();

    let body2 = new Cube([0,40,107,1]);
    body2.matrix = bodyMat;
    body2.matrix.translate(0,-.06, 0.58, 0);
    body2.matrix.rotate(0,0,1,0);
    let body2Mat = new Matrix4(body2.matrix); // body3
    body2.matrix.scale(.36, .39, .19);
    body2.matrix.translate(-.5,0,0,0);
    body2.render();

    let body3 = new Cube([10,35,90,1]);
    body3.matrix = body2Mat;
    body3.matrix.translate(0, -0.08, 0.19, 0);
    let body3Mat = new Matrix4(body3.matrix); // tail1
    let body3Mat2 = new Matrix4(body3.matrix); // legsMid
    body3.matrix.rotate(0, 0, 1, 0);
    body3.matrix.scale(0.32, 0.37, 0.19);
    body3.matrix.translate(-.5,0,0,0);
    body3.render();

    let tail1 = new Cube([15,30,90,1]);
    tail1.matrix = body3Mat;
    let tail1Mat = new Matrix4(tail1.matrix); // tail2
    let tail1Mat2 = new Matrix4(tail1.matrix); // legsBack
    tail1.matrix.translate(0, 0.02, 0.19, 0);
    tail1.matrix.rotate(0, 0, 1, 0);
    tail1.matrix.scale(0.32, 0.37, 0.19);
    tail1.matrix.translate(-.5,0,0,0);
    tail1.render();

    let tail2 = new Cube([10,35,90,1]);
    tail2.matrix = tail1Mat;
    tail2.matrix.translate(0, 0.14, 0.38, 0);
    tail2.matrix.rotate(0, 0, 1, 0);
    tail2.matrix.scale(0.26, 0.2, 0.4);
    tail2.matrix.translate(-.5,0,0,0);
    tail2.render();

    let legsMid = new Cube([50,3,60,1]);
    legsMid.matrix = body3Mat2;
    legsMid.matrix.translate(0, 0.09, -.02, 0);
    legsMid.matrix.rotate(0, 0, 1, 0);
    let legsMidMat = new Matrix4(legsMid.matrix); // rightMidLeg
    let legsMidMat2 = new Matrix4(legsMid.matrix); // leftMidLeg
    legsMid.matrix.scale(0.64, 0.1, 0.1);
    legsMid.matrix.translate(-.5,0,0,0);
    legsMid.render();

    let rightMidLeg = new Cube([9, 40, 102,1]);
    rightMidLeg.matrix = legsMidMat;
    rightMidLeg.matrix.translate(-0.38, -0.24, 0, 0);
    rightMidLeg.matrix.scale(0.12, 0.36, 0.12);
    rightMidLeg.matrix.translate(-.5,0,0,0);
    rightMidLeg.render();

    let leftMidLeg = new Cube([9, 40, 102,1]);
    leftMidLeg.matrix = legsMidMat2;
    leftMidLeg.matrix.translate(0.38, -0.24, 0, 0);
    leftMidLeg.matrix.rotate(0, 0, 1, 0);
    leftMidLeg.matrix.scale(0.12, 0.36, 0.12);
    leftMidLeg.matrix.translate(-.5,0,0,0);
    leftMidLeg.render();

    let legsBack = new Cube([50,3,60,1]);
    legsBack.matrix = tail1Mat2;
    legsBack.matrix.translate(0, 0.06, 0.25, 0);
    legsBack.matrix.rotate(0, 0, 1, 0);
    let legsBackMat = new Matrix4(legsBack.matrix); // rightBackLeg
    let legsBackMat2 = new Matrix4(legsBack.matrix); // leftBackLeg
    legsBack.matrix.scale(0.64, 0.1, 0.1);
    legsBack.matrix.translate(-.5,0,0,0);
    legsBack.render();

    let rightBackLeg = new Cube([9, 40, 102,1]);
    rightBackLeg.matrix = legsBackMat;
    rightBackLeg.matrix.translate(-0.38, -0.21, 0, 0);
    rightBackLeg.matrix.rotate(0, 0, 1, 0);
    rightBackLeg.matrix.scale(0.12, 0.32, 0.12);
    rightBackLeg.matrix.translate(-.5,0,0,0);
    rightBackLeg.render();

    let leftBackLeg = new Cube([9, 40, 102,1]);
    leftBackLeg.matrix = legsBackMat2;
    leftBackLeg.matrix.translate(0.38, -0.21, 0, 0);
    leftBackLeg.matrix.rotate(0, 0, 1, 0);
    leftBackLeg.matrix.scale(0.12, 0.32, 0.12);
    leftBackLeg.matrix.translate(-.5,0,0,0);
    leftBackLeg.render();

    let fin = new Cube([89,26,84,1]);
    fin.matrix = bodyMat5;
    fin.matrix.translate(0, 0.42, 0.06, 0);
    fin.matrix.rotate(0, 0, 1, 0);
    fin.matrix.scale(0.12, 0.28, 0.4);
    fin.matrix.translate(-.5,0,0,0);
    fin.render();

    let head = new Cube([55,84,148,1]);
    head.matrix = bodyMat2;
    head.matrix.translate(0, -0.04, -0.22, 0);
    head.matrix.rotate(0, 0, 1, 0);
    head.matrix.scale(0.4, 0.37, 0.22);
    head.matrix.translate(-.5,0,0,0);
    head.render();

    // Used to help place a new shape
    // let newShape = new Cube([0,255,0,1]);
    // newShape.matrix = legsBackMat;
    // let x = document.getElementById('toolX').value;
    // let y = document.getElementById('toolY').value;
    // let z = document.getElementById('toolZ').value;
    // let sx = document.getElementById('toolscaleX').value;
    // let sy = document.getElementById('toolscaleY').value;
    // let sz = document.getElementById('toolscaleZ').value;
    // let rx = document.getElementById('toolrotX').value;
    // let ry = document.getElementById('toolrotY').value;
    // let rz = document.getElementById('toolrotZ').value;
    // newShape.matrix.translate(x,y,z);
    // newShape.matrix.rotate(rx,ry,rz, 0);
    // newShape.matrix.scale(sx,sy,sz);
    // newShape.matrix.translate(-.5,0,0,0);
    // newShape.render();
}

let g_startTime = performance.now()/1000.0;
let g_seconds = 0;
let r = 0;

function tick() {
    if (animate) {
        g_seconds = (performance.now() - g_startTime)/1000.0;
        r = (g_seconds*5)%360.0;

        // animate arms
        g_armRPos[1] = (Math.cos (r) + .5)/20.0;
        g_armRPos[2] = -(Math.sin(r) + .5)/20.0;
        g_armLPos[1] = -(Math.cos(r) + .5)/20.0;
        g_armLPos[2] = (Math.sin (r) + .5)/20.0;

        renderScene();
        requestAnimationFrame(tick);
    }
    else {
        requestAnimationFrame(tick);
    }
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
    renderScene();
    requestAnimationFrame(tick);
}
