// Camera.js

class Camera {
    constructor() {
        this.speed = .4;
        this.f = new Vector3();
        this.fov = 90.0;
        this.eye = new Vector3([0,8,0]);
        this.at = new Vector3([1,8,0]);
        this.up = new Vector3([0,1,0]);
        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], 
            this.at.elements [0], this.at.elements [1], this.at.elements [2],
            this.up.elements [0], this.up.elements [1], this.up.elements [2]
            );
            this.projectionMatrix = new Matrix4();
            this.projectionMatrix.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);
            this.rotationMatrix = new Matrix4();

        this.v = 0; // falling velocity
        this.grounded = false;
    }
    update() {
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], 
            this.at.elements [0], this.at.elements [1], this.at.elements [2],
            this.up.elements [0], this.up.elements [1], this.up.elements [2]
        );
        this.projectionMatrix.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 2000);

    }
    moveForward(mode) {
        if (mode == 'roaming') {
            this.f.set(this.at);
            this.f.sub(this.eye);
            this.f.normalize();
            this.f.mul(this.speed);
            this.eye.add(this.f);
            this.at.add(this.f);
        } else if (mode == 'walking') {
            this.f.set(this.at); this.f.elements[1] = 0;
            this.f.elements[0] -= this.eye.elements[0]; this.f.elements[2] -= this.eye.elements[2];
            this.f.normalize();
            this.f.mul(this.speed);
            this.eye.elements[0] += this.f.elements[0]; this.eye.elements[2] += this.f.elements[2];
            this.at.elements[0] += this.f.elements[0]; this.at.elements[2] += this.f.elements[2];
        }
        this.update();
    }
    moveBackwards(mode) {
        if (mode == 'roaming') {
            this.f.set(this.eye);
            this.f.sub(this.at);
            this.f.normalize();
            this.f.mul(this.speed);
            this.eye.add(this.f);
            this.at.add(this.f);
        } else if (mode == 'walking') {
            this.f.set(this.eye); this.f.elements[1] = 0;
            this.f.elements[0] -= this.at.elements[0]; this.f.elements[2] -= this.at.elements[2];
            this.f.normalize();
            this.f.mul(this.speed);
            this.eye.elements[0] += this.f.elements[0]; this.eye.elements[2] += this.f.elements[2];
            this.at.elements[0] += this.f.elements[0]; this.at.elements[2] += this.f.elements[2];
        }
        this.update();
    }
    moveLeft() {
        this.f.set(this.at);
        this.f.sub(this.eye);
        let s = Vector3.cross(this.up, this.f);
        s.normalize();
        s.mul(this.speed);
        this.eye.add(s);
        this.at.add(s);
        this.update();
    }
    moveRight() {
        this.f.set(this.eye);
        this.f.sub(this.at);
        let s = Vector3.cross(this.up, this.f);
        s.normalize();
        s.mul(this.speed);
        this.eye.add(s);
        this.at.add(s);
        this.update();
    }
    walkForward() {
        this.f.set(this.at);
        this.f.sub(this.eye);
        this.f.normalize;
        this.
        this.eye.elements[0] += this.speed;
        this.at.elements[0] += this.speed;
        this.update();
    }
    moveUp(mode) {
        if (mode == 'roaming') {
            this.eye.elements[1] += this.speed;
            this.at.elements[1] += this.speed;
        }
        else if (mode == 'walking' && this.v == 0) { // jump
            this.v = .2; // jumping amount
        }
        this.update();
    }
    moveDown(mode) {
        if (mode == 'roaming') {
            this.eye.elements[1] -= this.speed;
            this.at.elements[1] -= this.speed
        }
        this.update();
    }

    pan(alpha=this.speed) {
        this.rotationMatrix.setRotate(
            -alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
        this.f.set(this.at);
        this.f.sub(this.eye);
        let f_prime = this.rotationMatrix.multiplyVector3(this.f);
        this.at.set(this.eye);
        this.at.add(f_prime);
        this.update();
    }

    tilt(alpha=this.speed) {
        this.f.set(this.at);
        this.f.sub(this.eye);
        let s = Vector3.cross(this.f, this.up);
        s.normalize();
        this.rotationMatrix.setRotate(
            -alpha, s.elements[0], s.elements[1], s.elements[2]
        );
        let f_prime = this.rotationMatrix.multiplyVector3(this.f);
        let a = Math.abs(f_prime.elements[1]);
        if (a < .99) {
            this.at.set(this.eye);
            this.at.add(f_prime);
        }
        this.update();
    }
    
    gravity() {
        let a = this.eye.elements[1] + this.v;
        if (a > 2) { // normal gravity
            this.eye.elements[1] += this.v;
            this.at.elements[1] += this.v;
            this.v -= 0.011;
        }
        else { // if gravity would bring eye under 2
            let b = this.eye.elements[1] - 2; // difference from the ground
            this.eye.elements[1] -= b;
            this.at.elements[1] -= b;
            this.v = 0;
        }
        
    }   

    lookingAt() {
        this.f.set(this.at);
        this.f.sub(this.eye);
        this.f.normalize();
        this.f.mul(4); // range constant 
        let a = this.f.elements;
        for (let i = 0; i < this.at.elements.length; ++i) {
            a[i] += this.at.elements[i];
            a[i] = Math.floor(a[i]);
        }
        return a;
    } 
}