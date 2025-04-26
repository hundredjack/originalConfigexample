import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { easing } from 'maath'

import {
  useGLTF,
  Environment,
  Center,
  AccumulativeShadows,
  RandomizedLight,
  useTexture,
  Decal,
  useAspect,
  Box
} from '@react-three/drei'
import { useSnapshot } from 'valtio'
import { state } from './store'
import * as THREE from 'three'
import { DecalManipulator } from './DecalManipulator'

export const App = ({ position = [0, 0, 2.5], fov = 25 }) => (
  <Canvas
    shadows
    gl={{ preserveDrawingBuffer: true }}
    camera={{ position, fov }}
    eventSource={document.getElementById('root')}
    eventPrefix="client">
    <ambientLight intensity={0.5} />
    <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />

    <CameraRig>
      <Backdrop />
      <Center>
        <ConfigurableModel />
        <DecalManipulator />
      </Center>
    </CameraRig>
  </Canvas>
)

// This component decides which model to render based on the selected model in state
function ConfigurableModel() {
  const snap = useSnapshot(state)
  
  return (
    <>
      {snap.selectedModel === 'shirt' && <Shirt />}
      {snap.selectedModel === 'cube' && <Cube />}
    </>
  )
}

function Shirt(props) {
  const snap = useSnapshot(state)
  const { camera, mouse } = useThree()
  
  // State for dragging
  const [isDragging, setIsDragging] = useState(false)
  const [startPosition, setStartPosition] = useState([0, 0])
  const [startImagePosition, setStartImagePosition] = useState([0, 0, 0])

  // Load the selected decal texture
  const texture = useTexture(`/${snap.selectedDecal}.png`)
  
  // Create a ref for the custom image texture
  const customTextureRef = useRef(null)
  
  // Create a custom texture from the uploaded image if available
  if (snap.isCustomImage && snap.customImage && !customTextureRef.current) {
    const img = new Image()
    img.src = snap.customImage
    const customTexture = new THREE.Texture(img)
    img.onload = () => {
      customTexture.needsUpdate = true
    }
    customTextureRef.current = customTexture
  }
  
  // Reset the custom texture when the custom image is removed
  if (!snap.isCustomImage && customTextureRef.current) {
    customTextureRef.current = null
  }

  const { nodes, materials } = useGLTF('/shirt_baked_collapsed.glb')

  useFrame((state, delta) =>
    easing.dampC(materials.lambert1.color, snap.selectedColor, 0.25, delta)
  )
  
  // Create a material for the decal with improved settings for better surface following
  const decalMaterial = new THREE.MeshPhongMaterial({
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -10,
    side: THREE.DoubleSide,
    map: snap.isCustomImage ? customTextureRef.current : texture,
    shininess: 0, // Reduce shininess to improve visibility
    flatShading: false, // Ensure smooth shading
    bumpScale: 0.01, // Add slight bump mapping for better surface adherence
    dithering: true // Enable dithering for smoother appearance
  })
  
  // Handle pointer down on decal - only if not in intro mode
  const handlePointerDown = (e) => {
    // Don't allow dragging in intro mode
    if (snap.intro) return
    
    e.stopPropagation()
    setIsDragging(true)
    setStartPosition([mouse.x, mouse.y])
    setStartImagePosition([...snap.customImagePosition])
    e.target.setPointerCapture(e.pointerId)
  }
  
  // Handle pointer move while dragging - only if not in intro mode
  const handlePointerMove = (e) => {
    // Don't allow dragging in intro mode
    if (snap.intro) return
    
    if (!isDragging) return
    
    const deltaX = mouse.x - startPosition[0]
    const deltaY = mouse.y - startPosition[1]
    
    // Update the image position
    state.customImagePosition = [
      startImagePosition[0] + deltaX * 0.5,
      startImagePosition[1] + deltaY * 0.5,
      startImagePosition[2]
    ]
  }
  
  // Handle pointer up to end dragging
  const handlePointerUp = (e) => {
    if (isDragging) {
      setIsDragging(false)
      e.target.releasePointerCapture(e.pointerId)
    }
  }

  // Create a draggable plane that will be positioned over the decal
  const DecalDragPlane = ({ position, rotation, scale }) => {
    // Don't render the drag plane in intro mode
    if (snap.intro) return null
    
    return (
      <mesh
        position={position}
        rotation={rotation}
        scale={scale}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial 
          transparent={true} 
          opacity={0.0} 
          side={THREE.DoubleSide}
          depthTest={false}
        />
      </mesh>
    );
  };

  // Enhanced decal configuration for better surface following
  const decalConfig = {
    // Common properties for both built-in and custom decals
    position: snap.customImagePosition,
    rotation: snap.customImageRotation,
    scale: snap.customImageScale,
    material: decalMaterial,
    'map-anisotropy': 16,
    polygonOffset: true,
    polygonOffsetFactor: -10,
    renderOrder: 1,
    depthTest: true, // Enable depth test for better surface following
    depthWrite: false,
    sizeAttenuation: false,
    transparent: true,
    flatShading: false,
    debug: snap.debug,
    segments: 64, // Increase segments for better surface conformity
    zIndex: 100, // Ensure decal is rendered on top
    attach: snap.debug ? undefined : 'material', // Only attach in non-debug mode
    'material-toneMapped': false, // Disable tone mapping for more accurate colors
    'material-emissive': new THREE.Color(0x000000), // Add slight emissive for better visibility
    'material-emissiveIntensity': 0.1
  };

  return (
    <mesh
      castShadow
      geometry={nodes.T_Shirt_male.geometry}
      material={materials.lambert1}
      material-roughness={1}
      {...props}
      dispose={null}>
      
      {/* Render the built-in decal if no custom image is selected */}
      {!snap.isCustomImage && snap.selectedDecal && (
        <>
          <Decal
            map={texture}
            {...decalConfig}
          />
          <DecalDragPlane 
            position={snap.customImagePosition}
            rotation={snap.customImageRotation}
            scale={[snap.customImageScale, snap.customImageScale, snap.customImageScale]}
          />
        </>
      )}
      
      {/* Render the custom image decal if available */}
      {snap.isCustomImage && customTextureRef.current && (
        <>
          <Decal
            map={customTextureRef.current}
            {...decalConfig}
          />
          <DecalDragPlane 
            position={snap.customImagePosition}
            rotation={snap.customImageRotation}
            scale={[snap.customImageScale, snap.customImageScale, snap.customImageScale]}
          />
        </>
      )}
    </mesh>
  )
}

// Cube model component
function Cube(props) {
  const snap = useSnapshot(state)
  const { camera, mouse } = useThree()
  
  // State for dragging
  const [isDragging, setIsDragging] = useState(false)
  const [startPosition, setStartPosition] = useState([0, 0])
  const [startImagePosition, setStartImagePosition] = useState([0, 0, 0])
  
  // Material for the cube
  const cubeMaterial = useRef()
  
  // Load the selected decal texture
  const texture = useTexture(`/${snap.selectedDecal}.png`)
  
  // Create a ref for the custom image texture
  const customTextureRef = useRef(null)
  
  // Create a custom texture from the uploaded image if available
  if (snap.isCustomImage && snap.customImage && !customTextureRef.current) {
    const img = new Image()
    img.src = snap.customImage
    const customTexture = new THREE.Texture(img)
    img.onload = () => {
      customTexture.needsUpdate = true
    }
    customTextureRef.current = customTexture
  }
  
  // Reset the custom texture when the custom image is removed
  if (!snap.isCustomImage && customTextureRef.current) {
    customTextureRef.current = null
  }
  
  // Update cube color
  useFrame((state, delta) => {
    if (cubeMaterial.current) {
      easing.dampC(cubeMaterial.current.color, snap.selectedColor, 0.25, delta)
    }
  })
  
  // Create a material for the decal with improved settings for better surface following
  const decalMaterial = new THREE.MeshPhongMaterial({
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -10,
    side: THREE.DoubleSide,
    map: snap.isCustomImage ? customTextureRef.current : texture,
    shininess: 0, // Reduce shininess to improve visibility
    flatShading: false, // Ensure smooth shading
    bumpScale: 0.01, // Add slight bump mapping for better surface adherence
    dithering: true // Enable dithering for smoother appearance
  })
  
  // Handle pointer down on decal - only if not in intro mode
  const handlePointerDown = (e) => {
    // Don't allow dragging in intro mode
    if (snap.intro) return
    
    e.stopPropagation()
    setIsDragging(true)
    setStartPosition([mouse.x, mouse.y])
    setStartImagePosition([...snap.customImagePosition])
    e.target.setPointerCapture(e.pointerId)
  }
  
  // Handle pointer move while dragging - only if not in intro mode
  const handlePointerMove = (e) => {
    // Don't allow dragging in intro mode
    if (snap.intro) return
    
    if (!isDragging) return
    
    const deltaX = mouse.x - startPosition[0]
    const deltaY = mouse.y - startPosition[1]
    
    // Update the image position
    state.customImagePosition = [
      startImagePosition[0] + deltaX * 0.5,
      startImagePosition[1] + deltaY * 0.5,
      startImagePosition[2]
    ]
  }
  
  // Handle pointer up to end dragging
  const handlePointerUp = (e) => {
    if (isDragging) {
      setIsDragging(false)
      e.target.releasePointerCapture(e.pointerId)
    }
  }
  
  // Create a draggable plane that will be positioned over the decal
  const DecalDragPlane = ({ position, rotation, scale }) => {
    // Don't render the drag plane in intro mode
    if (snap.intro) return null
    
    return (
      <mesh
        position={position}
        rotation={rotation}
        scale={scale}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial 
          transparent={true} 
          opacity={0.0} 
          side={THREE.DoubleSide}
          depthTest={false}
        />
      </mesh>
    );
  };

  // Enhanced decal configuration for better surface following
  const decalConfig = {
    // Common properties for both built-in and custom decals
    position: snap.customImagePosition,
    rotation: snap.customImageRotation,
    scale: snap.customImageScale,
    material: decalMaterial,
    'map-anisotropy': 16,
    polygonOffset: true,
    polygonOffsetFactor: -10,
    renderOrder: 1,
    depthTest: true,
    depthWrite: false,
    sizeAttenuation: false,
    transparent: true,
    flatShading: false,
    debug: snap.debug,
    segments: 64,
    zIndex: 100,
    attach: snap.debug ? undefined : 'material',
    'material-toneMapped': false,
    'material-emissive': new THREE.Color(0x000000),
    'material-emissiveIntensity': 0.1
  };
  
  return (
    <Box
      args={[0.45, 0.55, 0.15]} 
      castShadow
      receiveShadow
      position={[0, 0, 0]} 
      {...props}
    >
      <meshStandardMaterial
        ref={cubeMaterial}
        color={snap.selectedColor}
        roughness={0.7}
        metalness={0.0}
      />
      
      {/* Render the built-in decal if no custom image is selected */}
      {!snap.isCustomImage && snap.selectedDecal && (
        <>
          <Decal
            map={texture}
            {...decalConfig}
          />
          <DecalDragPlane 
            position={snap.customImagePosition}
            rotation={snap.customImageRotation}
            scale={[snap.customImageScale, snap.customImageScale, snap.customImageScale]}
          />
        </>
      )}
      
      {/* Render the custom image decal if available */}
      {snap.isCustomImage && customTextureRef.current && (
        <>
          <Decal
            map={customTextureRef.current}
            {...decalConfig}
          />
          <DecalDragPlane 
            position={snap.customImagePosition}
            rotation={snap.customImageRotation}
            scale={[snap.customImageScale, snap.customImageScale, snap.customImageScale]}
          />
        </>
      )}
    </Box>
  )
}

function Backdrop() {
  const shadows = useRef()
  const snap = useSnapshot(state)

  useFrame((state, delta) =>
    easing.dampC(
      shadows.current.getMesh().material.color,
      snap.selectedColor,
      0.25,
      delta
    )
  )

  return (
    <AccumulativeShadows
      ref={shadows}
      temporal
      frames={60}
      alphaTest={0.85}
      scale={10}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, 0, -0.14]}>
      <RandomizedLight
        amount={4}
        radius={9}
        intensity={0.55}
        ambient={0.25}
        position={[5, 5, -10]}
      />
      <RandomizedLight
        amount={4}
        radius={5}
        intensity={0.25}
        ambient={0.55}
        position={[-5, 5, -9]}
      />
    </AccumulativeShadows>
  )
}

function CameraRig({ children }) {
  const group = useRef()

  const snap = useSnapshot(state)

  useFrame((state, delta) => {
    easing.damp3(
      state.camera.position,
      [snap.intro ? -state.viewport.width / 4 : 0, 0, 2],
      0.25,
      delta
    )
    easing.dampE(
      group.current.rotation,
      [state.pointer.y / 5, -state.pointer.x / 2.5, 0],
      0.25,
      delta
    )
  })
  return <group ref={group}>{children}</group>
}

useGLTF.preload('/shirt_baked_collapsed.glb')
;['/react.png', '/three2.png', '/pmndrs.png'].forEach(useTexture.preload)
