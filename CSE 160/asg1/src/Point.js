// Point.js
class Point {
    constructor(position=[0,0], color=[0,0,0,1], size=10) {
        this.position = position;
        this.color = color;
        this.size = size;
    }
    
    render() {
        let xy = this.position;
        let rgba = this.color;

        gl.disableVertexAttribArray(a_Position);
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 1.0);
        gl.uniform1f(u_Size, this.size);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}