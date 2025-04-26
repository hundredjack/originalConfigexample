import React, { useRef, useState, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Plane, useCursor } from '@react-three/drei'
import { Vector3, Raycaster } from 'three'
import { useSnapshot } from 'valtio'
import { state } from './store'

// This component adds interactive handles to manipulate the decal
export function DecalManipulator() {
  const snap = useSnapshot(state)
  const { camera, raycaster, mouse, scene } = useThree()
  
  // References for the manipulation handles
  const scaleRef = useRef()
  const rotateRef = useRef()
  
  // State for tracking which handle is being dragged
  const [activeDrag, setActiveDrag] = useState(null)
  const [hovered, setHovered] = useState(null)
  
  // Change cursor on hover
  useCursor(hovered !== null)
  
  // Initial position for drag operation
  const [startPosition, setStartPosition] = useState(new Vector3())
  const [startValue, setStartValue] = useState(null)
  
  // Only show manipulator when not in intro mode
  if (snap.intro) return null
  
  // Handle start of drag operation
  const handlePointerDown = (e, type) => {
    e.stopPropagation()
    setActiveDrag(type)
    
    // Store initial position and values
    setStartPosition(new Vector3(mouse.x, mouse.y, 0))
    
    if (type === 'move') {
      setStartValue([...snap.customImagePosition])
    } else if (type === 'scale') {
      setStartValue(snap.customImageScale)
    } else if (type === 'rotate') {
      setStartValue([...snap.customImageRotation])
    }
    
    // Capture pointer to track movement even outside the element
    e.target.setPointerCapture(e.pointerId)
  }
  
  // Handle drag operation
  const handlePointerMove = (e) => {
    if (!activeDrag) return
    
    // Calculate movement delta
    const currentPosition = new Vector3(mouse.x, mouse.y, 0)
    const delta = currentPosition.clone().sub(startPosition)
    
    if (activeDrag === 'move') {
      // Move the decal
      const sensitivity = 0.5
      state.customImagePosition = [
        startValue[0] + delta.x * sensitivity,
        startValue[1] + delta.y * sensitivity,
        startValue[2]
      ]
    } else if (activeDrag === 'scale') {
      // Scale the decal
      const sensitivity = 0.3
      const newScale = startValue + delta.y * sensitivity
      state.customImageScale = Math.max(0.05, Math.min(0.5, newScale))
    } else if (activeDrag === 'rotate') {
      // Rotate the decal - now using Y axis (up/down) movement
      const sensitivity = 3
      state.customImageRotation = [
        startValue[0],
        startValue[1],
        startValue[2] + delta.y * sensitivity
      ]
    }
  }
  
  // Handle end of drag operation
  const handlePointerUp = (e) => {
    if (activeDrag) {
      e.target.releasePointerCapture(e.pointerId)
      setActiveDrag(null)
    }
  }
  
  // Position the handles relative to the decal
  const position = new Vector3(...snap.customImagePosition)
  const scale = snap.customImageScale
  
  return (
    <group position={position}>
      {/* Scale handle */}
      <mesh
        ref={scaleRef}
        position={[0, scale * 0.7, 0.01]}
        onPointerDown={(e) => handlePointerDown(e, 'scale')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={() => setHovered('scale')}
        onPointerOut={() => setHovered(null)}
      >
        <boxGeometry args={[0.03, 0.03, 0.03]} />
        <meshBasicMaterial color="green" transparent opacity={0.7} />
      </mesh>
      
      {/* Rotate handle */}
      <mesh
        ref={rotateRef}
        position={[scale * 0.7, 0, 0.01]}
        onPointerDown={(e) => handlePointerDown(e, 'rotate')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={() => setHovered('rotate')}
        onPointerOut={() => setHovered(null)}
      >
        <boxGeometry args={[0.03, 0.03, 0.03]} />
        <meshBasicMaterial color="red" transparent opacity={0.7} />
      </mesh>
    </group>
  )
}
