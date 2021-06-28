// asg5.js
// Eric Ngor
// engor
// CSE 160 - Fall 20

if (type=='grass') {
    let blockG = new THREE.Geometry;
    // Geometry of a block
    blockG.vertices.push(
        new THREE.Vector3(-1, -1,  1),  // 0
        new THREE.Vector3( 1, -1,  1),  // 1
        new THREE.Vector3(-1,  1,  1),  // 2
        new THREE.Vector3( 1,  1,  1),  // 3
        new THREE.Vector3(-1, -1, -1),  // 4
        new THREE.Vector3( 1, -1, -1),  // 5
        new THREE.Vector3(-1,  1, -1),  // 6
        new THREE.Vector3( 1,  1, -1),  // 7
    );
    /*
      6----7
     /|   /|
    2----3 |
    | |  | |
    | 4--|-5
    |/   |/
    0----1
    */
    blockG.faces.push(
        // front
        new THREE.Face3(0, 3, 2),
        new THREE.Face3(0, 1, 3),
        // right
        new THREE.Face3(1, 7, 3),
        new THREE.Face3(1, 5, 7),
        // back
        new THREE.Face3(5, 6, 7),
        new THREE.Face3(5, 4, 6),
        // left
        new THREE.Face3(4, 2, 6),
        new THREE.Face3(4, 0, 2),
        // top
        new THREE.Face3(2, 7, 6),
        new THREE.Face3(2, 3, 7),
        // bottom
        new THREE.Face3(4, 1, 0),
        new THREE.Face3(4, 5, 1),
    );
    const geometry = blockG;
    geometry.faceVertexUvs[0].push(
        // front
        [ new THREE.Vector2(0.5,0.5), new THREE.Vector2(1,1), new THREE.Vector2(0.5,1) ],
        [ new THREE.Vector2(0.5,0.5), new THREE.Vector2(1,0.5), new THREE.Vector2(1,1) ],
        // right
        [ new THREE.Vector2(0.5,0.5), new THREE.Vector2(1,1), new THREE.Vector2(0.5,1) ],
        [ new THREE.Vector2(0.5,0.5), new THREE.Vector2(1,0.5), new THREE.Vector2(1,1) ],
        // back
        [ new THREE.Vector2(0.5,0.5), new THREE.Vector2(1,1), new THREE.Vector2(0.5,1) ],
        [ new THREE.Vector2(0.5,0.5), new THREE.Vector2(1,0.5), new THREE.Vector2(1,1) ],
        // left
        [ new THREE.Vector2(0.5,0.5), new THREE.Vector2(1,1), new THREE.Vector2(0.5,1) ],
        [ new THREE.Vector2(0.5,0.5), new THREE.Vector2(1,0.5), new THREE.Vector2(1,1) ],
        // top
        [ new THREE.Vector2(0,0.5), new THREE.Vector2(0.5,1), new THREE.Vector2(0,1) ],
        [ new THREE.Vector2(0,0.5), new THREE.Vector2(0.5,0.5), new THREE.Vector2(0.5,1) ],
        // bottom
        [ new THREE.Vector2(0,0), new THREE.Vector2(0.5,0.5), new THREE.Vector2(0,0.5) ],
        [ new THREE.Vector2(0,0), new THREE.Vector2(0.5,0), new THREE.Vector2(0.5,0.5) ],
    );
    geometry.computeFaceNormals();

    const texture = loader.load('./resources/images/grass.jpg');
    // texture.minFilter = THREE.LinearMipmapLinearFilter;
    const material = new THREE.MeshPhongMaterial({map: texture});
    const block = new THREE.Mesh(geometry, material);
    block.scale.set(0.5,0.5,0.5);
    block.position.x = pos[0]; block.position.y = pos[1]; block.position.z = pos[2];
    scene.add(block);
    
    return block;
}