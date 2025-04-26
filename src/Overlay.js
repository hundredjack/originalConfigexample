import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSnapshot } from 'valtio'
import { Logo } from '@pmndrs/branding'
import {
  AiOutlineHighlight,
  AiOutlineShopping,
  AiFillCamera,
  AiOutlineArrowLeft
} from 'react-icons/ai'
import { state } from './store'
import ImageUploader from './ImageUploader'
import ModelSwitcher from './ModelSwitcher'

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

  return (
    <motion.section {...config}>
      <div className="customizer">
        {/* Image uploader component moved to the top */}
        <ImageUploader />
        <ModelSwitcher />
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

        <button
          className="download-btn"
          style={{ background: snap.selectedColor }}
          onClick={downloadCanvasToImage}>
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
        
        {/* Debug button - only visible in customizer mode */}
        <button
          className="debug-btn"
          style={{ background: snap.debug ? '#EF674E' : '#353934' }}
          onClick={() => (state.debug = !state.debug)}>
          {snap.debug ? 'DEBUG ON' : 'DEBUG OFF'}
        </button>
      </div>
    </motion.section>
  )
}
