// Sphere.js
class Sphere {
    constructor() {
        this.color = [1,1,1,1];
        this.matrix = new Matrix4();
        this.type = -1;
    }

    render() {
        let rgba = this.color;
        for (let i=0; i<3; ++i) { rgba[i] /= 255.0; }
        gl.uniform1i(u_FillType, this.type);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let d = Math.PI / 10;
        let dd = Math.PI / 10;

        let sin = Math.sin;
        let cos = Math.cos;

        let verts = [];
        
        for (let t = 0; t < Math.PI; t+=d) {
            for (let r = 0; r < (2*Math.PI); r+=d) {
                gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

                verts = verts.concat([
                        sin(t)*cos(r), sin(t)*sin(r), cos(t), 0,0,                // p1
                        sin(t)*cos(r), sin(t)*sin(r), cos(t),
                        sin(t+dd)*cos(r), sin(t+dd)*sin(r), cos(t+dd), 0,0,       // p2
                        sin(t+dd)*cos(r), sin(t+dd)*sin(r), cos(t+dd),
                        sin(t+dd)*cos(r+dd), sin(t+dd)*sin(r+dd), cos(t+dd), 0,0, // p4
                        sin(t+dd)*cos(r+dd), sin(t+dd)*sin(r+dd), cos(t+dd),
                        sin(t)*cos(r), sin(t)*sin(r), cos(t), 0,0,                // p1
                        sin(t)*cos(r), sin(t)*sin(r), cos(t),
                        sin(t+dd)*cos(r+dd), sin(t+dd)*sin(r+dd), cos(t+dd), 0,0, // p4
                        sin(t+dd)*cos(r+dd), sin(t+dd)*sin(r+dd), cos(t+dd),
                        sin(t)*cos(r+dd), sin(t)*sin(r+dd), cos(t), 0,0,          // p3
                        sin(t)*cos(r+dd), sin(t)*sin(r+dd), cos(t)]);
            }
        }
        drawTriangle3DUVNormal(new Float32Array(verts));

    }
}