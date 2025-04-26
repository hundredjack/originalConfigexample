import { Logo } from '@pmndrs/branding'
import {
  AiOutlineHighlight,
  AiOutlineShopping,
  AiFillCamera,
  AiOutlineArrowLeft,
  AiOutlineUpload,
  AiOutlineControl
} from 'react-icons/ai'
import { useSnapshot } from 'valtio'
import { state } from './store'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { useControls, folder, button } from 'leva'

export default function Overlay() {
  const snap = useSnapshot(state)

  const transition = { type: 'spring', duration: 0.8 }

  const config = {
    initial: { x: -100, opacity: 0, transition: { ...transition, delay: 0.5 } },
    animate: { x: 0, opacity: 1, transition: { ...transition, delay: 0 } },
    exit: { x: -100, opacity: 0, transition: { ...transition, delay: 0 } }
  }

  return (
    <div className="container">
      <header
        initial={{ opacity: 0, y: -120 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 1.8, delay: 1 }}>
        <Logo width="40" height="40" />
        <div>
          <AiOutlineShopping size="3em" />
        </div>
      </header>

      <AnimatePresence>
        {snap.intro ? (
          <Intro key="main" config={config} />
        ) : (
          <Customizer key="custom" config={config} />
        )}
      </AnimatePresence>
    </div>
  )
}

function Intro({ config }) {
  return (
    <motion.section {...config}>
      <div className="section--container">
        <div>
          <h1>LET'S DO IT.</h1>
        </div>
        <div className="support--content">
          <div>
            <p>
              Create your unique and exclusive shirt with our brand-new 3D
              customization tool. <strong>Unleash your imagination</strong> and
              define your own style.
            </p>
            <button
              style={{ background: 'black' }}
              onClick={() => (state.intro = false)}>
              CUSTOMIZE IT <AiOutlineHighlight size="1.3em" />
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function Customizer({ config }) {
  const snap = useSnapshot(state)
  const fileInputRef = useRef(null)
  const [showControls, setShowControls] = useState(false)

  // Setup Leva controls for custom image positioning
  useEffect(() => {
    // Only setup controls when custom image is active
    if (snap.useCustomImage) {
      const { posX, posY, posZ, rotX, rotY, rotZ, scale } = useControls({
        'Custom Image Controls': folder({
          posX: {
            value: snap.decalPosition[0],
            min: -1,
            max: 1,
            step: 0.01,
            onChange: (value) => {
              state.decalPosition[0] = value
            }
          },
          posY: {
            value: snap.decalPosition[1],
            min: -1,
            max: 1,
            step: 0.01,
            onChange: (value) => {
              state.decalPosition[1] = value
            }
          },
          posZ: {
            value: snap.decalPosition[2],
            min: 0,
            max: 0.5,
            step: 0.01,
            onChange: (value) => {
              state.decalPosition[2] = value
            }
          },
          rotX: {
            value: snap.decalRotation[0],
            min: -Math.PI,
            max: Math.PI,
            step: 0.01,
            onChange: (value) => {
              state.decalRotation[0] = value
            }
          },
          rotY: {
            value: snap.decalRotation[1],
            min: -Math.PI,
            max: Math.PI,
            step: 0.01,
            onChange: (value) => {
              state.decalRotation[1] = value
            }
          },
          rotZ: {
            value: snap.decalRotation[2],
            min: -Math.PI,
            max: Math.PI,
            step: 0.01,
            onChange: (value) => {
              state.decalRotation[2] = value
            }
          },
          scale: {
            value: snap.decalScale,
            min: 0.05,
            max: 0.5,
            step: 0.01,
            onChange: (value) => {
              state.decalScale = value
            }
          },
          'Reset Position': button(() => {
            state.decalPosition = [0, 0.04, 0.15]
            state.decalRotation = [0, 0, 0]
            state.decalScale = 0.15
          })
        }, { collapsed: !showControls })
      })
      
      return () => {
        // Cleanup
      }
    }
  }, [snap.useCustomImage, showControls])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.match('image.*')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          state.customImage = img
          state.useCustomImage = true
          setShowControls(true) // Automatically show controls when image is uploaded
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current.click()
  }

  const toggleControls = () => {
    setShowControls(!showControls)
  }

  return (
    <motion.section {...config}>
      <div className="customizer">
        <div className="color-options">
          {snap.colors.map((color) => (
            <div
              key={color}
              className="circle"
              style={{ background: color }}
              onClick={() => (state.selectedColor = color)}></div>
          ))}
        </div>

        <div className="decals">
          <div className="decals--container">
            {snap.decals.map((decal) => (
              <div
                key={decal}
                className="decal"
                onClick={() => {
                  state.selectedDecal = decal
                  state.useCustomImage = false
                }}>
                <img src={decal + '_thumb.png'} alt="brand" />
              </div>
            ))}
            <div className="decal custom-upload" onClick={handleUploadClick}>
              <AiOutlineUpload size="2em" />
              <span>Upload</span>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        {snap.useCustomImage && (
          <button
            className="control-button"
            style={{ background: snap.selectedColor }}
            onClick={toggleControls}>
            {showControls ? 'HIDE CONTROLS' : 'SHOW CONTROLS'}
            <AiOutlineControl size="1.3em" />
          </button>
        )}

        <button
          className="share"
          style={{ background: snap.selectedColor }}
          onClick={() => {
            const link = document.createElement('a')
            link.setAttribute('download', 'canvas.png')
            link.setAttribute(
              'href',
              document
                .querySelector('canvas')
                .toDataURL('image/png')
                .replace('image/png', 'image/octet-stream')
            )
            link.click()
          }}>
          DOWNLOAD
          <AiFillCamera size="1.3em" />
        </button>

        <button
          className="exit"
          style={{ background: snap.selectedColor }}
          onClick={() => (state.intro = true)}>
          GO BACK
          <AiOutlineArrowLeft size="1.3em" />
        </button>
      </div>
    </motion.section>
  )
}
