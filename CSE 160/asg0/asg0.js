// DrawRectangle.js
function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('asg0');
    // Get the rendering contenxt for 2DCG
    ctx = canvas.getContext('2d');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    clearCanvas();

    v1 = new Vector3([2.25,2.25]);
    drawVector(v1, 'red');

    document.getElementById('draw').onclick = handleDrawEvent;
    document.getElementById('operation').onclick = handleDrawOperationEvent;
}

function clearCanvas() {
    ctx.fillStyle = 'black'; // Set background
    ctx.fillRect(10, 10, canvas.width,canvas.height); // Fill a rectangle with the color
}

function drawVector(v, color) {
    ctx.beginPath();
    center = canvas.width/2;
    ctx.moveTo(center, center);
    ctx.lineTo(v.elements[0]*20 + center,(-v.elements[1]*20) + center);
    ctx.strokeStyle=color;
    ctx.stroke();
}

function angleBetween(vec1, vec2) {
    let d = Vector3.dot(vec1,vec2);
    let alpha = Math.acos(d / (vec1.magnitude() * vec2.magnitude()));
    alpha *= (180/Math.PI); // rad to deg
    console.log(`Angle: ${alpha}`);
}

function areaTriangle(vec1, vec2) {
    let cross = Vector3.cross(vec1, vec2);
    let area = cross.magnitude() / 2; // half of parallelogram for triangle
    console.log(`Area of the triangle: ${area}`);
}

function handleDrawEvent() {
    clearCanvas();
    v1.elements[0] = document.getElementById('x').value;
    v1.elements[1] = document.getElementById('y').value;
    drawVector(v1, 'red');

    let x2 = document.getElementById('x2').value;
    let y2 = document.getElementById('y2').value;
    v2 = new Vector3([x2,y2]);
    drawVector(v2, 'blue');
}

function handleDrawOperationEvent() {
    handleDrawEvent();

    let operation = document.getElementById('op').value;
    let scalar = document.getElementById('scalar').value;
    switch (operation) {
        case 'add':
            v3 = v1.add(v2); 
            drawVector(v3, 'green'); 
            break;
        case 'sub':
            v3 = v1.sub(v2); 
            drawVector(v3, 'green');
            break;
        case 'mul':
            v3 = v1.mul(scalar);
            v4 = v2.mul(scalar); 
            drawVector(v3, 'green');
            drawVector(v4, 'green');
            break;
        case 'div':
            v3 = v1.div(scalar); 
            v4 = v2.div(scalar);
            drawVector(v3, 'green');
            drawVector(v4, 'green');
            break;
        case 'angle':
            angleBetween(v1,v2);
            break;
        case 'area':
            areaTriangle(v1,v2);
            break;
        case 'mag':
            console.log(`Magnitude v1: ${v1.magnitude()}`);
            console.log(`Magnitude v2: ${v2.magnitude()}`);
            break;
        case 'norm':
            v3 = v1.normalize();
            v4 = v2.normalize();
            drawVector(v3, 'green');
            drawVector(v4, 'green');
            break;
    }
    
}