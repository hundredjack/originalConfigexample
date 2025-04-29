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

  // Get the next model name for the button text
  const getNextModelName = () => {
    const currentIndex = snap.models.indexOf(snap.selectedModel)
    const nextIndex = (currentIndex + 1) % snap.models.length
    return snap.models[nextIndex].toUpperCase()
  }

  return (
    <div className="model-switcher">
      <button
        className="model-switch-btn"
        style={{ background: snap.selectedColor }}
        onClick={handleModelSwitch}
      >
        <AiOutlineSwap size="1.3em" />
        SWITCH TO {getNextModelName()}
      </button>
      <p className="model-name">Current model: {snap.selectedModel.toUpperCase()}</p>
    </div>
  )
}

export default ModelSwitcher
