import React, { useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { state } from './store'
import { useControls, folder } from 'leva'

const ImageControls = () => {
  const snap = useSnapshot(state)

  // Only show controls if a custom image is uploaded
  const { posX, posY, posZ, rotX, rotY, rotZ, scale } = useControls(
    'Image Controls',
    {
      Position: folder({
        posX: {
          value: snap.customImagePosition[0],
          min: -1,
          max: 1,
          step: 0.01,
        },
        posY: {
          value: snap.customImagePosition[1],
          min: -1,
          max: 1,
          step: 0.01,
        },
        posZ: {
          value: snap.customImagePosition[2],
          min: -1,
          max: 1,
          step: 0.01,
        },
      }),
      Rotation: folder({
        rotX: {
          value: snap.customImageRotation[0],
          min: -Math.PI,
          max: Math.PI,
          step: 0.01,
        },
        rotY: {
          value: snap.customImageRotation[1],
          min: -Math.PI,
          max: Math.PI,
          step: 0.01,
        },
        rotZ: {
          value: snap.customImageRotation[2],
          min: -Math.PI,
          max: Math.PI,
          step: 0.01,
        },
      }),
      scale: {
        value: snap.customImageScale,
        min: 0.05,
        max: 0.5,
        step: 0.01,
      },
    },
    { collapsed: true }
  )

  // Update state when controls change
  useEffect(() => {
    if (snap.isCustomImage) {
      state.customImagePosition = [posX, posY, posZ]
      state.customImageRotation = [rotX, rotY, rotZ]
      state.customImageScale = scale
    }
  }, [posX, posY, posZ, rotX, rotY, rotZ, scale, snap.isCustomImage])

  return null // This component doesn't render anything
}

export default ImageControls
