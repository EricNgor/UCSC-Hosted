// world.js
class World {
    constructor(size) {
        this.size = size;
        // this.map = this.preset(1);
        this.map = [[[]]];
        // for (let i = 0; i < this.size; ++i) {
        //     for (let j = 0; j < this.size; ++j) {
        //         this.map[i].push(Math.round(Math.random()));
                
        //     }
        //     this.map.push([]);
        // }
        this.walls = [];
        this.generateWorld();
    }

    generateWorld() {
        let x = -this.size/2;
        let z = -this.size/2;

        let numBlocks = 0;

        // Generate world from Perlin noise
        noise.seed(Math.random());
        for (let i = 0; i < this.size; ++i) {
            for (let j = 0; j < this.size; ++j) {
                    // height map generated with Perlin noise:
                    // https://en.wikipedia.org/wiki/Perlin_noise
                    let height = Math.abs(parseInt(noise.perlin2(i/10.0, z/10.0) * 10.0));
                    for (let k = 0; k < height; ++k) {
                        let b = new Cube(1);
                        b.matrix.translate(i+x, k, j+z);
                        this.walls.push(b);
                        ++numBlocks;
                        // this.map.push([b.x, b.y, b.z]);
                    }
            }
        }
        for (let i = 0; i < this.size; ++i) {
            for (let j = 0; j < this.size; ++j) {
                    let height = Math.abs(parseInt(noise.perlin2(i/10.0, z/10.0) * 10.0));
                    for (let k = 0; k < height; ++k) {
                        let b = new Cube(1);
                        b.matrix.translate(j+x, k, i+z);
                        this.walls.push(b);
                        ++numBlocks;
                        // this.map.push([b.x, b.y, b.z]);
                    }
            }
        }

        document.getElementById('numBlocks').value = numBlocks;

        // // Generate world from preset
        // for (let i = 0; i < this.map.length - 2; ++i) {
        //     let b = new Cube(1);
        //     b.matrix.translate(this.map[i], this.map[i+1], this.map[i+2]);
        //     this.walls.push(b);
        // }

        // this.update();
    }
    
    renderBackground() {
        let scale = 1000;
        let ground = new Cube(0);
        ground.color = [158,118,69,1];
        ground.matrix.scale(scale, 0.1, scale);
        ground.matrix.translate(-.5, 0, -.5);
        ground.render();
    
        let sky = new Cube(-2);
        sky.color = [135,176,255,1];
        sky.matrix.translate(0,0,-2,0);
        sky.matrix.scale(scale,scale,scale);
        sky.matrix.translate(-.5,-0.01,-.5);
        sky.render();
    
    }
    
    renderElements() {
        if (g_lightDir) {
            let scale = 300;
            let box = new Cube(0);
            box.color = [0, 100, 0, 1];
            if (g_normal) box.type = 3;
            box.matrix.translate(0,scale,0);
            box.matrix.scale(-scale, -scale, -scale);
            box.matrix.translate(-.5, 0, -.5);
            box.render();
        }

        let sphere = new Sphere();
        sphere.color = [50,0,50,1];
        if (g_normal) sphere.type = 3;
        else sphere.type = -1;
        sphere.matrix.translate(0,50,0);
        sphere.matrix.scale(10,10,10);
        sphere.matrix.translate(-.5, 0, -.5);
        sphere.render();

    
        let light = new Sphere();
        light.color = [255,255,170,1];
        if (g_normal) light.type = 3;
        else light.type = -1;
        light.matrix.translate(g_lightPos[0][0], g_lightPos[0][1], g_lightPos[0][2]);
        light.matrix.scale(-1,-1,-1);
        light.matrix.translate(-.5, 0, -.5);
        light.render();
    }

    placeBlock(coords) {
        let b = new Cube(1);
        b.matrix.translate(coords[0], coords[1], coords[2]);
        this.walls.push(b);
    }

    break(coords) {
        for (let block of this.walls) {
            let b = [block.matrix.elements[12], block.matrix.elements[13], block.matrix.elements[14]];
            if (coords[1] != b[1]) continue;
            if (coords[0] != b[0]) continue;
            if (coords[2] != b[2]) continue;

            // Remove from list
            let i = this.walls.indexOf(block);
            if (i > - 1) {
                this.walls.splice(i,1);
            }
        }
    }

    update() {
        this.renderBackground();
        this.renderElements();
        for (let block of this.walls) {
            if (g_normal) block.type = 3;
            else block.type = 1;
            block.render();
        }
    }

    preset(n) {
        if (n == 1) {
            return;
        }
        else {
            console.log('invalid preset')
        }
    }

}
