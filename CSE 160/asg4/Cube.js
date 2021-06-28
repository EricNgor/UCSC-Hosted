// Cube.js
class Cube {
    constructor(type=-1) {
        this.color = [0,1,0,1];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.type = type; // [default:0, block:1, selected:2, normals:3]
        this.blockID = -1; // 
    }
    
    render() {
        let rgba = this.color;
        for (let i=0; i<3; ++i) { rgba[i] /= 255.0; }
        gl.uniform1i(u_FillType, this.type);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // if (this.type == 1 || this.type == 2 || this.type == 3) {
            let side =   [ [0.5,0.5, 1,1, 1,0.5], [0.5,0.5, 0.5,1, 1,1] ]; 
            let top =    [ [0,0.5, 0,1, 0.5,1], [0,0.5, 0.5,1, 0.5,0.5] ]; 
            let bottom = [ [0,0, 0.5,0.5, 0.5,0], [0,0, 0,0.5, 0.5,0.5] ];
            let n = [ [0,0,-1], [0,0,1], [0,1,0], [0,-1,0], [-1,0,0], [1,0,0] ];

            // front, back, top, bottom, left, right
            let vertices = new Float32Array([
                0,0,0, side[0][0], side[0][1], n[0][0], n[0][1], n[0][2], // front
                1,1,0, side[0][2], side[0][3], n[0][0], n[0][1], n[0][2],
                1,0,0, side[0][4], side[0][5], n[0][0], n[0][1], n[0][2],
                0,0,0, side[1][0], side[1][1], n[0][0], n[0][1], n[0][2],
                0,1,0, side[1][2], side[1][3], n[0][0], n[0][1], n[0][2],
                1,1,0, side[1][4], side[1][5], n[0][0], n[0][1], n[0][2], // front
                1,0,1, side[0][0], side[0][1], n[1][0], n[1][1], n[1][2], // back
                0,1,1, side[0][2], side[0][3], n[1][0], n[1][1], n[1][2],
                0,0,1, side[0][4], side[0][5], n[1][0], n[1][1], n[1][2],
                1,0,1, side[1][0], side[1][1], n[1][0], n[1][1], n[1][2],
                1,1,1, side[1][2], side[1][3], n[1][0], n[1][1], n[1][2],
                0,1,1, side[1][4], side[1][5], n[1][0], n[1][1], n[1][2], // back
                0,1,0, top[0][0], top[0][1], n[2][0], n[2][1], n[2][2], // top
                0,1,1, top[0][2], top[0][3], n[2][0], n[2][1], n[2][2],
                1,1,1, top[0][4], top[0][5], n[2][0], n[2][1], n[2][2],
                0,1,0, top[1][0], top[1][1], n[2][0], n[2][1], n[2][2],
                1,1,1, top[1][2], top[1][3], n[2][0], n[2][1], n[2][2],
                1,1,0, top[1][4], top[1][5], n[2][0], n[2][1], n[2][2], // top
                0,0,0, bottom[0][0], bottom[0][1], n[3][0], n[3][1], n[3][2], // bottom
                1,0,1, bottom[0][2], bottom[0][3], n[3][0], n[3][1], n[3][2],
                1,0,0, bottom[0][4], bottom[0][5], n[3][0], n[3][1], n[3][2],
                0,0,0, bottom[1][0], bottom[1][1], n[3][0], n[3][1], n[3][2],
                0,0,1, bottom[1][2], bottom[1][3], n[3][0], n[3][1], n[3][2],
                1,0,1, bottom[1][4], bottom[1][5], n[3][0], n[3][1], n[3][2], // bottom
                0,0,1, side[0][0], side[0][1], n[4][0], n[4][1], n[4][2], // left
                0,1,0, side[0][2], side[0][3], n[4][0], n[4][1], n[4][2],
                0,0,0, side[0][4], side[0][5], n[4][0], n[4][1], n[4][2],
                0,0,1, side[1][0], side[1][1], n[4][0], n[4][1], n[4][2],
                0,1,1, side[1][2], side[1][3], n[4][0], n[4][1], n[4][2],
                0,1,0, side[1][4], side[1][5], n[4][0], n[4][1], n[4][2], // left
                1,0,0, side[0][0], side[0][1], n[5][0], n[5][1], n[5][2], // right
                1,1,1, side[0][2], side[0][3], n[5][0], n[5][1], n[5][2],
                1,0,1, side[0][4], side[0][5], n[5][0], n[5][1], n[5][2],
                1,0,0, side[1][0], side[1][1], n[5][0], n[5][1], n[5][2],
                1,1,0, side[1][2], side[1][3], n[5][0], n[5][1], n[5][2],
                1,1,1, side[1][4], side[1][5], n[5][0], n[5][1], n[5][2], // right
            ]);

            // if (this.type == 2) {
            //     gl.enable(gl.BLEND);
            //     gl.uniform4f(u_FragColor, 0,0,0,.2);
            // }
            // drawTriangle3DUV(vertices);
            drawTriangle3DUVNormal(vertices);
        // }
        // else if (this.type == 0) {
            // let vertices = new Float32Array([
            //     0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0,
            //     0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0,
            //     1.0,1.0,1.0, 0.0,0.0,1.0, 0.0,1.0,1.0,
            //     1.0,1.0,1.0, 1.0,0.0,1.0, 0.0,0.0,1.0,
            //     1.0,1.0,1.0, 1.0,1.0,0.0, 0.0,1.0,0.0,
            //     1.0,1.0,1.0, 0.0,1.0,0.0, 0.0,1.0,1.0,
            //     0.0,0.0,0.0, 1.0,0.0,0.0, 1.0,0.0,1.0,
            //     0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,1.0,
            //     0.0,0.0,0.0, 0.0,0.0,1.0, 0.0,1.0,1.0,
            //     0.0,0.0,0.0, 0.0,1.0,1.0, 0.0,1.0,0.0,
            //     1.0,1.0,1.0, 1.0,0.0,1.0, 1.0,0.0,0.0,
            //     1.0,1.0,1.0, 1.0,0.0,0.0, 1.0,1.0,0.0
            // ]);

            // drawTriangle3D(vertices);
        // }

        // else {
        //     console.log('Error: Invalid cube type');
        // }
        
    }

    get x() {
        return this.matrix.elements[12];
    }
    get y() {
        return this.matrix.elements[13];
    }
    get z() {
        return this.matrix.elements[14];
    }
}