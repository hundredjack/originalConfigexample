import { useRef, useState, useEffect } from 'react'
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
  const [texture, setTexture] = useState(null)
  const defaultTexture = useTexture(`/${snap.selectedDecal}.png`)
  
  // Create a custom texture when a custom image is uploaded
  useEffect(() => {
    if (snap.useCustomImage && snap.customImage) {
      const newTexture = new THREE.Texture(snap.customImage)
      newTexture.needsUpdate = true
      setTexture(newTexture)
    } else {
      setTexture(defaultTexture)
    }
  }, [snap.useCustomImage, snap.customImage, defaultTexture])

  const { nodes, materials } = useGLTF('/shirt_baked_collapsed.glb')

  useFrame((state, delta) => {
    if (materials && materials.lambert1) {
      easing.dampC(materials.lambert1.color, snap.selectedColor, 0.25, delta)
    }
  })

  // Don't render the decal until texture is loaded
  if (!texture) return null

  return (
    <mesh
      castShadow
      geometry={nodes.T_Shirt_male.geometry}
      material={materials.lambert1}
      material-roughness={1}
      {...props}
      dispose={null}>
      <Decal
        position={snap.decalPosition}
        rotation={snap.decalRotation}
        scale={snap.useCustomImage ? snap.decalScale : 0.15}
        map={texture}
        map-anisotropy={16}
        transparent
        opacity={0.7}
      />
    </mesh>
  )
}

function Backdrop() {
  const shadows = useRef()
  const snap = useSnapshot(state)

  useFrame((state, delta) => {
    if (shadows.current) {
      easing.dampC(
        shadows.current.getMesh().material.color,
        snap.selectedColor,
        0.25,
        delta
      )
    }
  })

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
