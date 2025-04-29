import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { saveAs } from 'file-saver';

// Function to create and export a cube model
export function createAndExportCube() {
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
        const blob = new Blob([result], { type: 'application/octet-stream' });
        saveAs(blob, 'cube.glb');
      }
    },
    { binary: true }
  );
  
  return "Cube model created and exported as cube.glb";
}
