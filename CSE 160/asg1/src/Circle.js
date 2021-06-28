// Circle.js
class Circle {
    constructor(position=[0,0], color=[0,0,0,1], size=10, segments=10) {
        this.position = position;
        this.color = color;
        this.size = size;
        this.segments = segments;
    }

    render() {
        let center = this.position;
        let rgba = this.color;
        
        // radius
        let r = this.size/canvas.width; 

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // amount to rotate
        let rotate = 360.0 / this.segments; 

        let vertices = [center[0], center[1]];

        for (let angle = 0; angle < 360+rotate; angle += rotate) {
            let alpha = angle*Math.PI / 180.0; 
            vertices.push( center[0] + Math.cos(alpha)*r );
            vertices.push( center[1] + Math.sin(alpha)*r );
        }

        drawTriangle(vertices);
    }

}