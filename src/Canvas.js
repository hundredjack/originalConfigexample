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
    eventPrefix="client"
    style={{ touchAction: 'none' }} // Prevent touch scrolling
    onCreated={({ gl }) => {
      // Set background to transparent to allow detecting clicks on background
      gl.setClearColor(new THREE.Color(0, 0, 0), 0);
    }}
  >
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
  const { camera, mouse } = useThree()
  
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
  
  // Render the selected model with decals
  return (
    <group rotation={snap.modelRotation}>
      {/* Shirt Model */}
      {snap.selectedModel === 'shirt' && <Shirt texture={texture} customTextureRef={customTextureRef} />}
      
      {/* Cube Models */}
      {snap.selectedModel === 'cube1' && (
        <Cube 
          texture={texture} 
          customTextureRef={customTextureRef} 
          cubeType="cube1"
          size={snap.cubeTypes.cube1.size}
        />
      )}
      
      {snap.selectedModel === 'cube2' && (
        <Cube 
          texture={texture} 
          customTextureRef={customTextureRef} 
          cubeType="cube2"
          size={snap.cubeTypes.cube2.size}
        />
      )}
      
      {snap.selectedModel === 'cube3' && (
        <Cube 
          texture={texture} 
          customTextureRef={customTextureRef} 
          cubeType="cube3"
          size={snap.cubeTypes.cube3.size}
        />
      )}
    </group>
  )
}

function Shirt({ texture, customTextureRef, ...props }) {
  const snap = useSnapshot(state)
  const { camera, mouse, raycaster, scene, gl } = useThree()
  
  // Refs for the mesh and decals
  const meshRef = useRef()
  
  // State for dragging
  const [isDragging, setIsDragging] = useState(false)
  const [startPosition, setStartPosition] = useState([0, 0])
  const [startImagePosition, setStartImagePosition] = useState([0, 0, 0])
  
  // State for model rotation
  const [isRotating, setIsRotating] = useState(false)
  const [startRotation, setStartRotation] = useState([0, 0])
  const [startModelRotation, setStartModelRotation] = useState([0, 0, 0])
  
  // State to track if we just finished dragging (to prevent onClick firing)
  const [justFinishedDragging, setJustFinishedDragging] = useState(false)

  const { nodes, materials } = useGLTF('/shirt_baked_collapsed.glb')

  useFrame((state, delta) => {
    easing.dampC(materials.lambert1.color, snap.selectedColor, 0.25, delta)
    
    // Reset the justFinishedDragging flag after a short delay
    if (justFinishedDragging) {
      setTimeout(() => {
        setJustFinishedDragging(false)
      }, 100)
    }
  })
  
  // Handle model click for decal placement
  const handleModelClick = (e) => {
    // Only handle clicks when decal movement is enabled
    // Also prevent click handling right after dragging ends
    if (!snap.isDecalMovementEnabled || justFinishedDragging) return
    
    // If we already have a decal, don't allow repositioning by clicking
    if ((snap.isCustomImage && customTextureRef.current) || (!snap.isCustomImage && snap.selectedDecal)) {
      return;
    }
    
    // For shirt model, use the predefined positions instead of click position
    if (snap.selectedModel === 'shirt') {
      // Use the currently selected position from state
      const position = snap.selectedDecalPosition;
      if (snap.shirtDecalPositions[position]) {
        state.customImagePosition = [...snap.shirtDecalPositions[position]];
        
        // Set appropriate rotation based on position
        if (position === 'front') {
          state.customImageRotation = [0, 0, 0];
        } else if (position === 'leftShoulder') {
          state.customImageRotation = [-0.5, -0.3, 0];
        } else if (position === 'rightShoulder') {
          state.customImageRotation = [-0.5, 0.3, 0];
        }
      }
      return;
    }
    
    // Stop event propagation
    e.stopPropagation()
    
    // Get the intersection point in world space
    const intersectionPoint = e.point.clone()
    
    // Get the face normal at the intersection point
    const faceNormal = e.face.normal.clone()
    
    // Apply model transformations to the normal
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(
      meshRef.current.matrixWorld
    )
    faceNormal.applyMatrix3(normalMatrix).normalize()
    
    // Create a matrix to convert from world space to model local space
    // This accounts for the model's rotation
    const worldToLocal = new THREE.Matrix4().copy(meshRef.current.matrixWorld).invert()
    
    // Convert the intersection point from world space to model local space
    const localIntersectionPoint = intersectionPoint.clone().applyMatrix4(worldToLocal)
    
    // Update position in the global state using local coordinates
    state.customImagePosition = localIntersectionPoint.toArray()
    
    // Calculate rotation to align with the surface normal
    const rotationFromNormal = new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        faceNormal
      )
    )
    
    // Update rotation in global state
    state.customImageRotation = [
      rotationFromNormal.x,
      rotationFromNormal.y,
      rotationFromNormal.z
    ]
  }
  
  // Handle pointer down on decal - only if decal movement is enabled
  const handlePointerDown = (e) => {
    // Don't allow dragging if decal movement is disabled
    if (!snap.isDecalMovementEnabled) return
    
    e.stopPropagation()
    setIsDragging(true)
    setStartPosition([mouse.x, mouse.y])
    setStartImagePosition([...snap.customImagePosition])
    e.target.setPointerCapture(e.pointerId)
  }
  
  // Handle pointer move while dragging - only if decal movement is enabled
  const handlePointerMove = (e) => {
    // Don't allow dragging if decal movement is disabled
    if (!snap.isDecalMovementEnabled) return
    
    if (!isDragging) return
    
    // Calculate delta movement
    const deltaX = mouse.x - startPosition[0]
    const deltaY = mouse.y - startPosition[1]
    
    // Update position based on delta movement along the surface
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
      setJustFinishedDragging(true) // Set flag to prevent onClick from firing
      e.target.releasePointerCapture(e.pointerId)
    }
    
    if (isRotating) {
      setIsRotating(false)
      e.target.releasePointerCapture(e.pointerId)
    }
  }
  
  // Handle model rotation on pointer down
  const handleModelPointerDown = (e) => {
    // Don't allow rotation if decal movement is enabled
    if (snap.isDecalMovementEnabled) return
    
    e.stopPropagation()
    setIsRotating(true)
    setStartRotation([mouse.x, mouse.y])
    setStartModelRotation([...snap.modelRotation])
    e.target.setPointerCapture(e.pointerId)
  }
  
  // Handle model rotation on pointer move
  const handleModelPointerMove = (e) => {
    // Don't allow rotation if decal movement is enabled
    if (snap.isDecalMovementEnabled) return
    
    if (!isRotating) return
    
    const deltaX = mouse.x - startRotation[0]
    const deltaY = mouse.y - startRotation[1]
    
    // Update the model rotation (y-axis for horizontal movement, x-axis for vertical)
    state.modelRotation = [
      startModelRotation[0] - deltaY * 2, // Inverted vertical rotation
      startModelRotation[1] + deltaX * 2,
      startModelRotation[2]
    ]
  }

  // Create a draggable plane that will be positioned over the decal
  const DecalDragPlane = ({ position, rotation, scale }) => {
    // Don't render the drag plane if decal movement is disabled
    if (!snap.isDecalMovementEnabled) return null
    
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

  return (
    <mesh
      ref={meshRef}
      castShadow
      geometry={nodes.T_Shirt_male.geometry}
      material={materials.lambert1}
      material-roughness={1}
      onClick={handleModelClick}
      onPointerDown={handleModelPointerDown}
      onPointerMove={handleModelPointerMove}
      onPointerUp={handlePointerUp}
      {...props}
      dispose={null}>
      
      {/* Render the built-in decal if no custom image is selected */}
      {!snap.isCustomImage && snap.selectedDecal && (
        <>
          <Decal
            position={snap.customImagePosition}
            rotation={snap.customImageRotation}
            scale={snap.customImageScale}
            map={texture}
            map-anisotropy={16}
            polygonOffset={true}
            polygonOffsetFactor={-10}
            renderOrder={1}
            depthTest={true}
            depthWrite={false}
            transparent={true}
            flatShading={false}
            debug={snap.debug}
            segments={64}
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
            position={snap.customImagePosition}
            rotation={snap.customImageRotation}
            scale={snap.customImageScale}
            map={customTextureRef.current}
            map-anisotropy={16}
            polygonOffset={true}
            polygonOffsetFactor={-10}
            renderOrder={1}
            depthTest={true}
            depthWrite={false}
            transparent={true}
            flatShading={false}
            debug={snap.debug}
            segments={64}
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

function Cube({ texture, customTextureRef, cubeType, size = [0.3, 0.3, 0.3], ...props }) {
  const snap = useSnapshot(state)
  const { camera, mouse, raycaster, scene, gl } = useThree()
  
  // Refs for the mesh and decals
  const meshRef = useRef()
  
  // Material for the cube
  const cubeMaterial = useRef()
  
  // State for dragging
  const [isDragging, setIsDragging] = useState(false)
  const [startPosition, setStartPosition] = useState([0, 0])
  const [startImagePosition, setStartImagePosition] = useState([0, 0, 0])
  
  // State for model rotation
  const [isRotating, setIsRotating] = useState(false)
  const [startRotation, setStartRotation] = useState([0, 0])
  const [startModelRotation, setStartModelRotation] = useState([0, 0, 0])
  
  // State to track if we just finished dragging (to prevent onClick firing)
  const [justFinishedDragging, setJustFinishedDragging] = useState(false)
  
  // Update cube color
  useFrame((state, delta) => {
    if (cubeMaterial.current) {
      easing.dampC(
        cubeMaterial.current.color,
        snap.selectedColor,
        0.25,
        delta
      )
    }
    
    // Reset the justFinishedDragging flag after a short delay
    if (justFinishedDragging) {
      setTimeout(() => {
        setJustFinishedDragging(false)
      }, 100)
    }
  })
  
  // Handle model click for decal placement
  const handleModelClick = (e) => {
    // Only handle clicks when decal movement is enabled
    // Also prevent click handling right after dragging ends
    if (!snap.isDecalMovementEnabled || justFinishedDragging) return
    
    // If we already have a decal, don't allow repositioning by clicking
    if ((snap.isCustomImage && customTextureRef.current) || (!snap.isCustomImage && snap.selectedDecal)) {
      return;
    }
    
    // Stop event propagation
    e.stopPropagation()
    
    // Get the intersection point in world space
    const intersectionPoint = e.point.clone()
    
    // Get the face normal at the intersection point
    const faceNormal = e.face.normal.clone()
    
    // Apply model transformations to the normal
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(
      meshRef.current.matrixWorld
    )
    faceNormal.applyMatrix3(normalMatrix).normalize()
    
    // Create a matrix to convert from world space to model local space
    // This accounts for the model's rotation
    const worldToLocal = new THREE.Matrix4().copy(meshRef.current.matrixWorld).invert()
    
    // Convert the intersection point from world space to model local space
    const localIntersectionPoint = intersectionPoint.clone().applyMatrix4(worldToLocal)
    
    // Update position in the global state using local coordinates
    state.customImagePosition = localIntersectionPoint.toArray()
    
    // Calculate rotation to align with the surface normal
    const rotationFromNormal = new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        faceNormal
      )
    )
    
    // Update rotation in global state
    state.customImageRotation = [
      rotationFromNormal.x,
      rotationFromNormal.y,
      rotationFromNormal.z
    ]
  }
  
  // Handle pointer down on decal - only if decal movement is enabled
  const handlePointerDown = (e) => {
    // Don't allow dragging if decal movement is disabled
    if (!snap.isDecalMovementEnabled) return
    
    e.stopPropagation()
    setIsDragging(true)
    setStartPosition([mouse.x, mouse.y])
    setStartImagePosition([...snap.customImagePosition])
    e.target.setPointerCapture(e.pointerId)
  }
  
  // Handle pointer move while dragging - only if decal movement is enabled
  const handlePointerMove = (e) => {
    // Don't allow dragging if decal movement is disabled
    if (!snap.isDecalMovementEnabled) return
    
    if (!isDragging) return
    
    // Calculate delta movement
    const deltaX = mouse.x - startPosition[0]
    const deltaY = mouse.y - startPosition[1]
    
    // Update position based on delta movement along the surface
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
      setJustFinishedDragging(true) // Set flag to prevent onClick from firing
      e.target.releasePointerCapture(e.pointerId)
    }
    
    if (isRotating) {
      setIsRotating(false)
      e.target.releasePointerCapture(e.pointerId)
    }
  }
  
  // Handle model rotation on pointer down
  const handleModelPointerDown = (e) => {
    // Don't allow rotation if decal movement is enabled
    if (snap.isDecalMovementEnabled) return
    
    e.stopPropagation()
    setIsRotating(true)
    setStartRotation([mouse.x, mouse.y])
    setStartModelRotation([...snap.modelRotation])
    e.target.setPointerCapture(e.pointerId)
  }
  
  // Handle model rotation on pointer move
  const handleModelPointerMove = (e) => {
    // Don't allow rotation if decal movement is enabled
    if (snap.isDecalMovementEnabled) return
    
    if (!isRotating) return
    
    const deltaX = mouse.x - startRotation[0]
    const deltaY = mouse.y - startRotation[1]
    
    // Update the model rotation (y-axis for horizontal movement, x-axis for vertical)
    state.modelRotation = [
      startModelRotation[0] - deltaY * 2, // Inverted vertical rotation
      startModelRotation[1] + deltaX * 2,
      startModelRotation[2]
    ]
  }

  // Create a draggable plane that will be positioned over the decal
  const DecalDragPlane = ({ position, rotation, scale }) => {
    // Don't render the drag plane if decal movement is disabled
    if (!snap.isDecalMovementEnabled) return null
    
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

  return (
    <Box
      ref={meshRef}
      args={size} 
      onClick={handleModelClick}
      onPointerDown={handleModelPointerDown}
      onPointerMove={handleModelPointerMove}
      onPointerUp={handlePointerUp}
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
            position={snap.customImagePosition}
            rotation={snap.customImageRotation}
            scale={snap.customImageScale}
            map={texture}
            map-anisotropy={16}
            polygonOffset={true}
            polygonOffsetFactor={-10}
            renderOrder={1}
            depthTest={true}
            depthWrite={false}
            transparent={true}
            flatShading={false}
            debug={snap.debug}
            segments={64}
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
            position={snap.customImagePosition}
            rotation={snap.customImageRotation}
            scale={snap.customImageScale}
            map={customTextureRef.current}
            map-anisotropy={16}
            polygonOffset={true}
            polygonOffsetFactor={-10}
            renderOrder={1}
            depthTest={true}
            depthWrite={false}
            transparent={true}
            flatShading={false}
            debug={snap.debug}
            segments={64}
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
  
  // State for manual rotation
  const [isDragging, setIsDragging] = useState(false)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  
  // Limits for rotation (in radians)
  const rotationLimits = {
    x: { min: -Math.PI / 6, max: Math.PI / 6 }, // pitch (up/down)
    y: { min: -Math.PI / 4, max: Math.PI / 4 }  // yaw (left/right)
  }
  
  // Handle pointer down on background
  const handlePointerDown = (e) => {
    // Only trigger on background (not on models or UI)
    if (e.object && (e.object.type === 'Mesh' || e.object.type === 'Group')) {
      return
    }
    
    setIsDragging(true)
    setStartPosition({ x: e.clientX, y: e.clientY })
  }
  
  // Handle pointer move for rotation
  const handlePointerMove = (e) => {
    if (!isDragging) return
    
    // Calculate rotation delta
    const deltaX = (e.clientX - startPosition.x) * 0.005
    const deltaY = (e.clientY - startPosition.y) * 0.005
    
    // Update rotation with limits
    setRotation({
      x: Math.max(
        rotationLimits.x.min,
        Math.min(rotationLimits.x.max, rotation.x - deltaY)
      ),
      y: Math.max(
        rotationLimits.y.min,
        Math.min(rotationLimits.y.max, rotation.y - deltaX)
      )
    })
    
    // Update start position for next move
    setStartPosition({ x: e.clientX, y: e.clientY })
  }
  
  // Handle pointer up to end dragging
  const handlePointerUp = () => {
    setIsDragging(false)
  }
  
  // Apply automatic and manual rotation
  useFrame((state, delta) => {
    // Automatic camera position
    easing.damp3(
      state.camera.position,
      [0, 0, 2],
      0.25,
      delta
    )
    
    // Apply both automatic mouse following and manual drag rotation
    // Reduced sensitivity for mouse movement by dividing by larger values
    easing.dampE(
      group.current.rotation,
      [
        state.pointer.y / 15 + rotation.x, 
        -state.pointer.x / 15 + rotation.y, 
        0 // roll (z-axis rotation) - kept at 0
      ],
      0.25,
      delta
    )
  })
  
  return (
    <group 
      ref={group}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {children}
    </group>
  )
}

useGLTF.preload('/shirt_baked_collapsed.glb')
;['/react.png', '/three2.png', '/pmndrs.png'].forEach(useTexture.preload)
