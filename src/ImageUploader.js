import React, { useRef } from 'react'
import { useSnapshot } from 'valtio'
import { state } from './store'
import { AiOutlineUpload, AiOutlineDelete } from 'react-icons/ai'

const ImageUploader = () => {
  const snap = useSnapshot(state)
  const fileInputRef = useRef(null)

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
    state.customImageScale = 0.15
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  return (
    <div className="image-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        style={{ display: 'none' }}
      />
      <div className="upload-buttons">
        <button
          className="upload-btn"
          style={{ background: snap.selectedColor }}
          onClick={triggerFileInput}
        >
          <AiOutlineUpload size="1.3em" />
          UPLOAD IMAGE
        </button>
        {snap.customImage && (
          <button
            className="delete-btn"
            style={{ background: '#EF674E' }}
            onClick={handleRemoveImage}
          >
            <AiOutlineDelete size="1.3em" />
            REMOVE
          </button>
        )}
      </div>
    </div>
  )
}

export default ImageUploader
