// world.js
class World {
    constructor(size) {
        this.size = size;
        this.map = [[]];
        for (let i = 0; i < this.size; ++i) {
            for (let j = 0; j < this.size; ++j) {
                this.map[i].push(Math.round(Math.random()));
                
            }
            this.map.push([]);
        }
        this.walls = [];
        this.renderBackground();
        this.generateWorld();
    }

    generateWorld() {
        let x = -this.size/2;
        let z = -this.size/2;

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
                    }
            }
        }
        
        this.update();
    }
    
    renderBackground() {
        let SCALE = 1000;
        let ground = new Cube(0);
        // ground.color = [158,118,69,1];
        ground.color = [0,100,0,0.5];
        ground.matrix.scale(SCALE, 0.1, SCALE);
        ground.matrix.translate(-.5, 0, -.5);
        ground.render();
    
        let sky = new Cube(0);
        sky.color = [135,176,255,1];
        sky.matrix.translate(0,0,-2,0);
        sky.matrix.scale(SCALE,SCALE,SCALE);
        sky.matrix.translate(-.5,-0.01,-.5);
        sky.render();
    
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
            let i = this.walls.indexOf(block);
            if (i > - 1) {
                this.walls.splice(i,1);
            }
        }
    }

    update() {
        this.renderBackground();
        for (let block of this.walls) {
            block.render();
        }
    }

}
