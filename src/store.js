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
  customImageScale: 0.15
})

export { state }
