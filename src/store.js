import { proxy } from 'valtio'

const state = proxy({
  // Current model selection
  selectedModel: 'shirt', // 'shirt', 'cube1', 'cube2', 'cube3'
  
  // Shirt decal positions
  shirtDecalPositions: {
    front: [0, 0.04, 0.15],
    leftShoulder: [-0.1, 0.1, 0.08],
    rightShoulder: [0.1, 0.1, 0.08]
  },
  
  // Cube types with their sizes and positions
  cubeTypes: {
    cube1: {
      name: 'Standard Cube',
      size: [0.3, 0.3, 0.3],
      positions: {
        front: [0, 0, 0.15],
        back: [0, 0, -0.15],
        top: [0, 0.15, 0],
        bottom: [0, -0.15, 0],
        left: [-0.15, 0, 0],
        right: [0.15, 0, 0]
      }
    },
    cube2: {
      name: 'Rectangular Prism',
      size: [0.4, 0.2, 0.2],
      positions: {
        front: [0, 0, 0.1],
        back: [0, 0, -0.1],
        top: [0, 0.1, 0],
        bottom: [0, -0.1, 0],
        left: [-0.2, 0, 0],
        right: [0.2, 0, 0]
      }
    },
    cube3: {
      name: 'Tall Cube',
      size: [0.2, 0.4, 0.2],
      positions: {
        front: [0, 0, 0.1],
        back: [0, 0, -0.1],
        top: [0, 0.2, 0],
        bottom: [0, -0.2, 0],
        left: [-0.1, 0, 0],
        right: [0.1, 0, 0]
      }
    }
  },
  
  // Currently selected position
  selectedDecalPosition: 'front',
  
  // Intro animation completed flag
  intro: true,
  
  // Color selection
  colors: [
    '#ccc',
    '#EFBD4E',
    '#80C670',
    '#726DE8',
    '#EF674E',
    '#353934',
  ],
  selectedColor: '#EFBD4E',
  
  // Decal selection
  decals: ['react', 'three2', 'pmndrs'],
  selectedDecal: 'react',
  
  // Custom image support
  isCustomImage: false,
  customImage: null,
  
  // Position and scale of the decal
  customImagePosition: [0, 0.04, 0.15],
  customImageRotation: [0, 0, 0],
  customImageScale: 0.15,
  
  // Model rotation
  modelRotation: [0, 0, 0],
  
  // Enable/disable decal movement
  isDecalMovementEnabled: true,
  
  // Debug mode
  debug: false,
  
  // Decals by position for multi-decal support
  decalsByPosition: {
    front: {
      isCustomImage: false,
      customImage: null,
      selectedDecal: 'react',
      position: [0, 0.04, 0.15],
      rotation: [0, 0, 0],
      scale: 0.15,
      visible: true
    },
    leftShoulder: {
      isCustomImage: false,
      customImage: null,
      selectedDecal: 'three2',
      position: [-0.1, 0.1, 0.08],
      rotation: [-0.5, -0.3, 0],
      scale: 0.08,
      visible: false
    },
    rightShoulder: {
      isCustomImage: false,
      customImage: null,
      selectedDecal: 'pmndrs',
      position: [0.1, 0.1, 0.08],
      rotation: [-0.5, 0.3, 0],
      scale: 0.08,
      visible: false
    }
  }
})

// Function to set the selected model
const setSelectedModel = (model) => {
  state.selectedModel = model
  
  // Update decal position based on the selected model
  if (model === 'shirt') {
    setShirtDecalPosition(state.selectedDecalPosition)
  } else if (model.startsWith('cube')) {
    setCubeDecalPosition(model, 'front')
  }
}

// Function to set the shirt decal position
const setShirtDecalPosition = (position) => {
  if (state.selectedModel === 'shirt' && state.shirtDecalPositions[position]) {
    state.selectedDecalPosition = position
    state.customImagePosition = [...state.shirtDecalPositions[position]]
    
    // Set appropriate rotation based on position
    if (position === 'front') {
      state.customImageRotation = [0, 0, 0]
    } else if (position === 'leftShoulder') {
      state.customImageRotation = [-0.5, -0.3, 0]
    } else if (position === 'rightShoulder') {
      state.customImageRotation = [-0.5, 0.3, 0]
    }
  }
}

// Function to set the cube decal position
const setCubeDecalPosition = (cubeType, face) => {
  if (state.cubeTypes[cubeType] && state.cubeTypes[cubeType].positions[face]) {
    state.selectedDecalPosition = face
    state.customImagePosition = [...state.cubeTypes[cubeType].positions[face]]
    
    // Set appropriate rotation based on face
    if (face === 'front') {
      state.customImageRotation = [0, 0, 0]
    } else if (face === 'back') {
      state.customImageRotation = [0, Math.PI, 0]
    } else if (face === 'top') {
      state.customImageRotation = [-Math.PI/2, 0, 0]
    } else if (face === 'bottom') {
      state.customImageRotation = [Math.PI/2, 0, 0]
    } else if (face === 'left') {
      state.customImageRotation = [0, -Math.PI/2, 0]
    } else if (face === 'right') {
      state.customImageRotation = [0, Math.PI/2, 0]
    }
  }
}

export { state, setSelectedModel, setShirtDecalPosition, setCubeDecalPosition }
