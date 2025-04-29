import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';

// Create a scene
const scene = new THREE.Scene();

// Create a simple cube geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);

// Create a material with UV mapping for decal application
const material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.7,
  metalness: 0.0,
  side: THREE.DoubleSide
});

// Create the cube mesh
const cube = new THREE.Mesh(geometry, material);
cube.name = 'Cube';

// Add the cube to the scene
scene.add(cube);

// Create an exporter
const exporter = new GLTFExporter();

// Parse the scene and export as GLB
exporter.parse(
  scene,
  function (result) {
    if (result instanceof ArrayBuffer) {
      fs.writeFileSync('./public/cube.glb', Buffer.from(result));
      console.log('Cube model saved as cube.glb');
    }
  },
  { binary: true }
);
