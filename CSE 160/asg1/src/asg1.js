// Eric Ngor
// Assignment 1

// Shader programs
let VSHADER_SOURCE=
    `attribute vec4 a_Position;
    precision mediump float;
    uniform float u_Size;
    void main() {
        gl_Position = a_Position;
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
let u_FragColor, u_Size;
let shapesList = [];

function setupWebGL() {
    canvas=document.getElementById('asg1');
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true});
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
        console.log('Failed to get storage location of color');
        return;
    }
}

function setupEvents() {
    let segments = document.getElementById('segments');
    let out = document.getElementById('o_segments');
    out.value = segments.value;
    segments.addEventListener('input', function() {
        document.getElementById('o_segments').value = segments.value;
    })
    
    canvas.onmousedown = ev => { handleClicks(ev) };
    canvas.onmousemove = ev => { if (ev.buttons == 1) { handleClicks(ev) } };
    document.getElementById('clear').onclick = clear;
}

function main() {
    // canvas and gl variables
    setupWebGL();
    // connect JS variables to GLSL
    connectVariablesToGLSL();   
    // setup document events
    setupEvents();

    // Clear canvas
    gl.clearColor(1.0,1.0,1.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function renderAllShapes() {
    // Clear canvas
    gl.clearColor(1.0,1.0,1.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    shapesList.forEach(shape => shape.render());
}

function handleClicks(ev) {
    let x = ev.clientX;
    let y = ev.clientY;
    let rect = ev.target.getBoundingClientRect();

    // <canvas> to GLSL coords
    x = ((x - rect.left) - canvas.height/2) / (canvas.height/2);
    y = (canvas.width/2 - (y - rect.top)) / (canvas.width/2);
    
    let drawing = document.getElementById('draw').checked;
    let erasing = document.getElementById('erase').checked;

    if (drawing) {
        let color=[];
        let colorCheck = document.getElementById('colorCheck');

        if (!colorCheck.checked) {
            // Get slider values and scale to 0.0-1.0
            color[0] = document.getElementById('rRange').value/100.0;
            color[1] = document.getElementById('gRange').value/100.0;
            color[2] = document.getElementById('bRange').value/100.0;
        }
        else {
            let hex = document.getElementById('color').value;
            color[0] = hex[1]+hex[2];
            color[1] = hex[3]+hex[4];
            color[2] = hex[5]+hex[6];
            color = color.map(c => c = parseInt(c,16)/255.0); // from hex to rgb
        }

        const size = document.getElementById('size').value;
        let r = color[0], g = color[1], b = color[2];

        if (document.getElementById('square').checked) {
            shapesList.push(new Point([x,y], [r,g,b,1.0], size));
        }
        else if (document.getElementById('triangle').checked) {
            let triangle = new Triangle([x,y], [r,g,b,1.0], size);
            shapesList.push(triangle);
        }
        else if (document.getElementById('circle').checked) {
            let circle = new Circle([x,y], [r,g,b,1.0], size, document.getElementById('segments').value);
            shapesList.push(circle);
        }
        renderAllShapes();
        
    }
    else if (erasing) {
        shapesList.forEach(shape => {
            if (inRange(x,y, shape)) {
                // remove shape from array
                const i = shapesList.indexOf(shape);
                if (i>-1) { shapesList.splice(i,1) }
            }
            return;
            
        });
        renderAllShapes();
    }

}

// Determines whether shape is within range of being deleted by eraser
function inRange(x,y, shape) {
    const p = [shape.position[0], shape.position[1]];
    const s = document.getElementById('size').value/ (canvas.width/2.0); // eraser size
    if (x < p[0]-s || x > p[0]+s || y < p[1]-s || y > p[1]+s) {
        return false;
    } 
    return true;
}

function clear() {
    shapesList = [];
    renderAllShapes();
}