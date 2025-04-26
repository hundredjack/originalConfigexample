import React from 'react'
import { useSnapshot } from 'valtio'
import { state, updateModelPosition } from './store'
import { AiOutlineSwap } from 'react-icons/ai'

const ModelSwitcher = () => {
  const snap = useSnapshot(state)

  const handleModelSwitch = () => {
    // Toggle between available models
    const currentIndex = snap.models.indexOf(snap.selectedModel)
    const nextIndex = (currentIndex + 1) % snap.models.length
    const nextModel = snap.models[nextIndex]
    
    // Use the helper function to update positions when switching models
    updateModelPosition(nextModel)
  }

  return (
    <div className="model-switcher">
      <button
        className="model-switch-btn"
        style={{ background: snap.selectedColor }}
        onClick={handleModelSwitch}
      >
        <AiOutlineSwap size="1.3em" />
        SWITCH TO {snap.selectedModel === 'shirt' ? 'CUBE' : 'SHIRT'}
      </button>
      <p className="model-name">Current model: {snap.selectedModel.toUpperCase()}</p>
    </div>
  )
}

export default ModelSwitcher
