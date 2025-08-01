import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './Canvas'
import { ControlPanel } from './ControlPanel'

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
    <ControlPanel />
  </React.StrictMode>
)
