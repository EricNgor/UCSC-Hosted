// PickHelper.js
// threejsfundamentals.org/threejs/lessons/threejs-picking.html

class PickHelper {
    constructor(THREE) {
        this.raycaster = new THREE.Raycaster();
        this.pickedObject = null;
        this.pickedObjectSavedColor = 0;
        this.pickedObjectSavedTex = null;
    }
    pick(normalizedPosition, scene, camera, terrain) {
        // restore the color if there is a picked object
        if (this.pickedObject) {
            this.pickedObject.material.emissive = this.pickedObjectSavedColor;
            this.pickedObject = undefined;
        }

        // cast a ray, get closest intercepted mesh
        this.raycaster.setFromCamera(normalizedPosition, camera);
        const intersectedObjects = this.raycaster.intersectObjects(terrain);
        if (intersectedObjects.length) {
            this.pickedObject = intersectedObjects[0].object;
            this.pickedObjectSavedColor = this.pickedObject.material.emissive;
            // apparently Phong doesn't support emissive so this'll just set to black
            this.pickedObject.material.emissive = 0xFFFFFF;

        }
    }
    
  }