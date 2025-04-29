import React, { useState, useRef } from 'react'
import { useSnapshot } from 'valtio'
import { state, setSelectedModel, setShirtDecalPosition, setCubeDecalPosition } from './store'
import './ControlPanel.css'

// Icons
import { FaTshirt, FaImage, FaCube, FaPalette, FaArrowsAlt, FaLock } from 'react-icons/fa'
import { MdFace, MdOutlineRotate90DegreesCcw } from 'react-icons/md'
import { BsSquareFill } from 'react-icons/bs'
import { GiCube } from 'react-icons/gi'

export function ControlPanel() {
  const snap = useSnapshot(state)
  const fileInputRef = useRef()
  
  // Handle model selection
  const handleModelSelect = (model) => {
    setSelectedModel(model)
  }
  
  // Handle position selection for shirt
  const handlePositionSelect = (position) => {
    setShirtDecalPosition(position)
  }
  
  // Handle face selection for cube
  const handleFaceSelect = (face) => {
    if (snap.selectedModel.startsWith('cube')) {
      setCubeDecalPosition(snap.selectedModel, face)
    }
  }
  
  // Handle color selection
  const handleColorSelect = (color) => {
    state.selectedColor = color
  }
  
  // Handle decal selection
  const handleDecalSelect = (decal) => {
    state.selectedDecal = decal
    state.isCustomImage = false
  }
  
  // Handle custom image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        state.customImage = e.target.result
        state.isCustomImage = true
      }
      reader.readAsDataURL(file)
    }
  }
  
  // Toggle decal movement
  const toggleDecalMovement = () => {
    state.isDecalMovementEnabled = !state.isDecalMovementEnabled
  }

  return (
    <div className="control-panel">
      {/* Model Selection */}
      <div className="control-section">
        <h3><GiCube /> Model Selection</h3>
        <div className="button-group">
          <button 
            className={`control-btn model-btn ${snap.selectedModel === 'shirt' ? 'active' : ''}`}
            style={{ backgroundColor: '#726DE8' }}
            onClick={() => handleModelSelect('shirt')}
          >
            <FaTshirt /> Shirt
          </button>
          <button 
            className={`control-btn model-btn ${snap.selectedModel === 'cube1' ? 'active' : ''}`}
            style={{ backgroundColor: '#80C670' }}
            onClick={() => handleModelSelect('cube1')}
          >
            <FaCube /> Cube
          </button>
          <button 
            className={`control-btn model-btn ${snap.selectedModel === 'cube2' ? 'active' : ''}`}
            style={{ backgroundColor: '#EFBD4E' }}
            onClick={() => handleModelSelect('cube2')}
          >
            <BsSquareFill /> Rectangle
          </button>
          <button 
            className={`control-btn model-btn ${snap.selectedModel === 'cube3' ? 'active' : ''}`}
            style={{ backgroundColor: '#EF674E' }}
            onClick={() => handleModelSelect('cube3')}
          >
            <FaCube /> Tall Cube
          </button>
        </div>
        
        {/* Position/Face Selection */}
        <div className="position-selector">
          <h4>
            {snap.selectedModel === 'shirt' ? 'Position' : 'Face'} Selection
          </h4>
          <div className="position-buttons">
            {snap.selectedModel === 'shirt' ? (
              // Shirt positions
              <>
                <button 
                  className={`position-btn ${snap.selectedDecalPosition === 'front' ? 'active' : ''}`}
                  style={{ backgroundColor: '#726DE8' }}
                  onClick={() => handlePositionSelect('front')}
                >
                  Front
                </button>
                <button 
                  className={`position-btn ${snap.selectedDecalPosition === 'leftShoulder' ? 'active' : ''}`}
                  style={{ backgroundColor: '#726DE8' }}
                  onClick={() => handlePositionSelect('leftShoulder')}
                >
                  Left Shoulder
                </button>
                <button 
                  className={`position-btn ${snap.selectedDecalPosition === 'rightShoulder' ? 'active' : ''}`}
                  style={{ backgroundColor: '#726DE8' }}
                  onClick={() => handlePositionSelect('rightShoulder')}
                >
                  Right Shoulder
                </button>
              </>
            ) : (
              // Cube faces
              <>
                <button 
                  className={`position-btn ${snap.selectedDecalPosition === 'front' ? 'active' : ''}`}
                  style={{ backgroundColor: '#80C670' }}
                  onClick={() => handleFaceSelect('front')}
                >
                  Front
                </button>
                <button 
                  className={`position-btn ${snap.selectedDecalPosition === 'back' ? 'active' : ''}`}
                  style={{ backgroundColor: '#80C670' }}
                  onClick={() => handleFaceSelect('back')}
                >
                  Back
                </button>
                <button 
                  className={`position-btn ${snap.selectedDecalPosition === 'top' ? 'active' : ''}`}
                  style={{ backgroundColor: '#80C670' }}
                  onClick={() => handleFaceSelect('top')}
                >
                  Top
                </button>
                <button 
                  className={`position-btn ${snap.selectedDecalPosition === 'bottom' ? 'active' : ''}`}
                  style={{ backgroundColor: '#80C670' }}
                  onClick={() => handleFaceSelect('bottom')}
                >
                  Bottom
                </button>
                <button 
                  className={`position-btn ${snap.selectedDecalPosition === 'left' ? 'active' : ''}`}
                  style={{ backgroundColor: '#80C670' }}
                  onClick={() => handleFaceSelect('left')}
                >
                  Left
                </button>
                <button 
                  className={`position-btn ${snap.selectedDecalPosition === 'right' ? 'active' : ''}`}
                  style={{ backgroundColor: '#80C670' }}
                  onClick={() => handleFaceSelect('right')}
                >
                  Right
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Color Selection */}
      <div className="control-section">
        <h3><FaPalette /> Color</h3>
        <div className="color-grid">
          {snap.colors.map((color) => (
            <div
              key={color}
              className="color-circle"
              style={{ background: color }}
              onClick={() => handleColorSelect(color)}
            />
          ))}
        </div>
      </div>
      
      {/* Decal Selection */}
      <div className="control-section">
        <h3><MdFace /> Decals</h3>
        <div className="decals-grid">
          {snap.decals.map((decal) => (
            <div
              key={decal}
              className="decal-item"
              onClick={() => handleDecalSelect(decal)}
            >
              <img src={`/${decal}.png`} alt={decal} />
            </div>
          ))}
        </div>
        
        <h4><FaImage /> Custom Image</h4>
        <button
          className="control-btn"
          style={{ backgroundColor: '#726DE8', width: '100%' }}
          onClick={() => fileInputRef.current.click()}
        >
          Upload Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </div>
      
      {/* Controls */}
      <div className="control-section">
        <h3><MdOutlineRotate90DegreesCcw /> Controls</h3>
        <button
          className="control-btn"
          style={{ 
            backgroundColor: snap.isDecalMovementEnabled ? '#EF674E' : '#80C670',
            width: '100%',
            marginBottom: '8px'
          }}
          onClick={toggleDecalMovement}
        >
          {snap.isDecalMovementEnabled ? (
            <>
              <FaArrowsAlt /> Move Decal
            </>
          ) : (
            <>
              <FaLock /> Rotate Model
            </>
          )}
        </button>
      </div>
    </div>
  )
}
