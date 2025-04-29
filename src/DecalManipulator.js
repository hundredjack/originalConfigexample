import React, { useRef, useState, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useSnapshot } from 'valtio'
import { state } from './store'
import * as THREE from 'three'

export function DecalManipulator() {
  const snap = useSnapshot(state)
  const { scene, camera } = useThree()
  
  // Refs for the manipulator components
  const groupRef = useRef()
  const scaleRef = useRef()
  
  // State for tracking interactions
  const [isDragging, setIsDragging] = useState(false)
  const [isScaling, setIsScaling] = useState(false)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [startScale, setStartScale] = useState(0)
  
  // Only show manipulator when decal movement is enabled
  const visible = snap.isDecalMovementEnabled
  
  // Update manipulator position and rotation to match the decal
  useFrame(() => {
    if (groupRef.current && visible) {
      // Position the manipulator at the decal position
      groupRef.current.position.set(
        snap.customImagePosition[0],
        snap.customImagePosition[1],
        snap.customImagePosition[2]
      )
      
      // Match the decal rotation
      groupRef.current.rotation.set(
        snap.customImageRotation[0],
        snap.customImageRotation[1],
        snap.customImageRotation[2]
      )
      
      // Scale the manipulator to match the decal scale
      const scale = snap.customImageScale * 1.2 // Slightly larger than the decal
      groupRef.current.scale.set(scale, scale, scale)
    }
  })
  
  // Handle pointer down on scale handle
  const handleScaleStart = (e) => {
    if (!visible) return
    
    e.stopPropagation()
    setIsScaling(true)
    setStartPosition({ x: e.clientX, y: e.clientY })
    setStartScale(snap.customImageScale)
    e.target.setPointerCapture(e.pointerId)
  }
  
  // Handle pointer move for scaling
  const handleScaleMove = (e) => {
    if (!isScaling) return
    
    // Calculate the distance moved
    const deltaY = (e.clientY - startPosition.y) * -0.01
    
    // Update the scale (with limits)
    const newScale = Math.max(0.05, Math.min(0.5, startScale + deltaY))
    state.customImageScale = newScale
  }
  
  // Handle pointer up to end scaling
  const handleScaleEnd = (e) => {
    if (isScaling) {
      setIsScaling(false)
      e.target.releasePointerCapture(e.pointerId)
    }
  }
  
  return (
    <group ref={groupRef} visible={visible}>
      {/* Border outline */}
      <mesh>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial 
          color="white" 
          transparent={true} 
          opacity={0.5} 
          side={THREE.DoubleSide}
          wireframe={true}
          depthTest={false}
        />
      </mesh>
      
      {/* Scale handle */}
      <mesh 
        ref={scaleRef}
        position={[0.5, -0.5, 0]} 
        onPointerDown={handleScaleStart}
        onPointerMove={handleScaleMove}
        onPointerUp={handleScaleEnd}
        onPointerLeave={handleScaleEnd}
      >
        <boxGeometry args={[0.1, 0.1, 0.01]} />
        <meshBasicMaterial 
          color="white" 
          transparent={true}
          opacity={0.8}
          depthTest={false}
        />
      </mesh>
    </group>
  )
}
