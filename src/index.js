import { createRoot } from 'react-dom/client'
import './styles.css'
import { App as Canvas } from './Canvas'
import Overlay from './Overlay'
import { Leva } from 'leva'

createRoot(document.getElementById('root')).render(
  <>
    <Leva collapsed />
    <Canvas />
    <Overlay />
  </>
)
