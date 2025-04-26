import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { easing } from 'maath'

import {
  useGLTF,
  Environment,
  Center,
  AccumulativeShadows,
  RandomizedLight,
  useTexture,
  Decal
} from '@react-three/drei'
import { useSnapshot } from 'valtio'
import { state } from './store'
import * as THREE from 'three'

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
        <Shirt />
      </Center>
    </CameraRig>
  </Canvas>
)

function Shirt(props) {
  const snap = useSnapshot(state)

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

  return (
    <mesh
      castShadow
      geometry={nodes.T_Shirt_male.geometry}
      material={materials.lambert1}
      material-roughness={1}
      {...props}
      dispose={null}>
      
      {/* Render the built-in decal if no custom image is selected */}
      {!snap.isCustomImage && (
        <Decal
          position={[0, 0.04, 0.15]}
          rotation={[0, 0, 0]}
          scale={0.15}
          opacity={0.7}
          map={texture}
          map-anisotropy={16}
        />
      )}
      
      {/* Render the custom image decal if available */}
      {snap.isCustomImage && customTextureRef.current && (
        <Decal
          position={snap.customImagePosition}
          rotation={snap.customImageRotation}
          scale={snap.customImageScale}
          opacity={0.9}
          map={customTextureRef.current}
          map-anisotropy={16}
        />
      )}
    </mesh>
  )
}

function Backdrop() {
  const shadows = useRef()

  useFrame((state, delta) =>
    easing.dampC(
      shadows.current.getMesh().material.color,
      state.selectedColor,
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
      [state.pointer.y / 10, -state.pointer.x / 5, 0],
      0.25,
      delta
    )
  })
  return <group ref={group}>{children}</group>
}

useGLTF.preload('/shirt_baked_collapsed.glb')
;['/react.png', '/three2.png', '/pmndrs.png'].forEach(useTexture.preload)
