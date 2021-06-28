// Cube.js
class Cube {
    constructor(color=[255,0,0,1]) {
        for (let i = 0; i < 3; ++i) { color[i] /= 255.0; }
        this.color = color;
        // this.position
        this.matrix = new Matrix4();
    }

    render() {
        let p = this.position;
        let s = this.size;
        let rgba = this.color;
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // front
        drawTriangle3D([0,0,0, 1,1,0, 1,0,0]);
        drawTriangle3D([0,0,0, 0,1,0, 1,1,0]);
        // back
        drawTriangle3D([1,1,1, 0,0,1, 0,1,1]);
        drawTriangle3D([1,1,1, 1,0,1, 0,0,1]);
        
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        
        // top
        drawTriangle3D([1,1,1, 1,1,0, 0,1,0]);
        drawTriangle3D([1,1,1, 0,1,0, 0,1,1]);
        // bottom
        drawTriangle3D([0,0,0, 1,0,0, 1,0,1]);
        drawTriangle3D([0,0,0, 0,0,1, 1,0,1]);
        
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        
        // left
        drawTriangle3D([0,0,0, 0,0,1, 0,1,1]);
        drawTriangle3D([0,0,0, 0,1,1, 0,1,0]);
        // right
        drawTriangle3D([1,1,1, 1,0,1, 1,0,0]);
        drawTriangle3D([1,1,1, 1,0,0, 1,1,0]);
        
        }
        
    }