import React from 'react'
import { useSnapshot } from 'valtio'
import { state, updateModelPosition } from './store'
import { AiFillCamera, AiOutlineUpload, AiOutlineDelete, AiOutlineSwap } from 'react-icons/ai'
import { FaTshirt, FaCube, FaPalette, FaImage, FaBug, FaArrowsAlt } from 'react-icons/fa'
import './ControlPanel.css'

const ControlPanel = () => {
  const snap = useSnapshot(state)
  const fileInputRef = React.useRef(null)

  // Image upload handlers
  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.type.match('image.*')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        // Create an image element to get dimensions
        const img = new Image()
        img.onload = () => {
          // Set the custom image in the state
          state.customImage = event.target.result
          state.isCustomImage = true
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    state.customImage = null
    state.isCustomImage = false
    // Reset position, rotation, and scale to defaults
    state.customImagePosition = [0, 0.04, 0.15]
    state.customImageRotation = [0, 0, 0]
    state.customImageScale = 0.2
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  // Model switching
  const handleModelSwitch = () => {
    // Toggle between available models
    const currentIndex = snap.models.indexOf(snap.selectedModel)
    const nextIndex = (currentIndex + 1) % snap.models.length
    const nextModel = snap.models[nextIndex]
    
    // Use the helper function to update positions when switching models
    updateModelPosition(nextModel)
  }

  // Download canvas
  const downloadCanvasToImage = () => {
    const canvas = document.querySelector('canvas')
    const dataURL = canvas.toDataURL()
    const link = document.createElement('a')

    link.href = dataURL
    link.download = 'canvas.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Toggle decal movement
  const toggleDecalMovement = () => {
    state.isDecalMovementEnabled = !state.isDecalMovementEnabled
  }

  // Toggle debug mode
  const toggleDebug = () => {
    state.debug = !state.debug
  }

  return (
    <div className="control-panel">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        style={{ display: 'none' }}
      />
      
      {/* Color Options Section */}
      <div className="control-section color-section">
        <h3><FaPalette /> Colors</h3>
        <div className="color-grid">
          {snap.colors.map((color) => (
            <div
              key={color}
              className="color-circle"
              style={{ background: color }}
              onClick={() => (state.selectedColor = color)}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Model Controls Section */}
      <div className="control-section model-controls">
        <h3><FaTshirt /> Model</h3>
        <div className="button-group">
          <button 
            className="control-btn model-btn"
            style={{ background: snap.selectedColor }}
            onClick={handleModelSwitch}
          >
            <AiOutlineSwap />
            {snap.selectedModel === 'shirt' ? 'Switch to Cube' : 'Switch to Shirt'}
          </button>
          
          <button
            className="control-btn toggle-btn"
            style={{
              background: snap.isDecalMovementEnabled ? '#80C670' : '#EF674E',
            }}
            onClick={toggleDecalMovement}
          >
            <FaArrowsAlt />
            {snap.isDecalMovementEnabled ? 'Move Decal' : 'Rotate Model'}
          </button>
        </div>
      </div>
      
      {/* Decal Controls Section */}
      <div className="control-section decal-controls">
        <h3><FaImage /> Decals</h3>
        <div className="button-group">
          <button
            className="control-btn upload-btn"
            style={{ background: snap.selectedColor }}
            onClick={triggerFileInput}
          >
            <AiOutlineUpload />
            Upload
          </button>
          
          {snap.customImage && (
            <button
              className="control-btn delete-btn"
              style={{ background: '#EF674E' }}
              onClick={handleRemoveImage}
            >
              <AiOutlineDelete />
              Remove
            </button>
          )}
          
          <button
            className="control-btn download-btn"
            style={{ background: snap.selectedColor }}
            onClick={downloadCanvasToImage}
          >
            <AiFillCamera />
            Download
          </button>
          
          <button
            className="control-btn debug-btn"
            style={{ background: snap.debug ? '#EF674E' : '#353934' }}
            onClick={toggleDebug}
          >
            <FaBug />
            Debug
          </button>
        </div>
        
        <div className="decals-grid">
          {snap.decals.map((decal) => (
            <div
              key={decal}
              className="decal-item"
              onClick={() => {
                state.selectedDecal = decal;
                state.isCustomImage = false;
                // Set default position, rotation, and scale for the selected decal
                state.customImagePosition = [0, 0.04, 0.15];
                state.customImageRotation = [0, 0, 0];
                state.customImageScale = 0.25;
              }}>
              <img src={decal + '.png'} alt="brand" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
