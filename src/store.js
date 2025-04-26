import { proxy } from 'valtio'

const state = proxy({
  intro: true,
  colors: [
    '#ccc',
    '#EFBD4E',
    '#80C670',
    '#726DE8',
    '#EF674E',
    '#353934',
    'cyan'
  ],
  decals: ['react', 'three2', 'pmndrs'],
  selectedColor: '#EFBD4E',
  selectedDecal: 'three2',
  // Custom image upload state
  customImage: null,
  isCustomImage: false,
  customImagePosition: [0, 0.04, 0.15],
  customImageRotation: [0, 0, 0],
  customImageScale: 0.25, // Increased default scale for better surface coverage
  // Debug mode for decal projection
  debug: false,
  // Model selection
  models: ['shirt', 'cube'],
  selectedModel: 'shirt',
  // Model-specific positions to ensure decals are properly positioned on each model
  shirtPosition: [0, 0.04, 0.15],
  cubePosition: [0, 0, 0.1]
})

// Helper function to update positions when switching models
const updateModelPosition = (newModel) => {
  // Save current position for the current model
  if (state.selectedModel === 'shirt') {
    state.shirtPosition = [...state.customImagePosition]
  } else if (state.selectedModel === 'cube') {
    state.cubePosition = [...state.customImagePosition]
  }
  
  // Set the new model
  state.selectedModel = newModel
  
  // Update position for the new model
  if (newModel === 'shirt') {
    state.customImagePosition = [...state.shirtPosition]
  } else if (newModel === 'cube') {
    state.customImagePosition = [...state.cubePosition]
  }
}

export { state, updateModelPosition }
