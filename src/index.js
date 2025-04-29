import { createRoot } from 'react-dom/client'
import './styles.css'
import { App as Canvas } from './Canvas'
import Overlay from './Overlay'

// Remove any debug overlays that might have been created
const removeDebugOverlays = () => {
  const overlays = [
    document.getElementById('elite-debug-overlay'),
    document.getElementById('single-debug-overlay')
  ];
  
  overlays.forEach(overlay => {
    if (overlay) {
      document.body.removeChild(overlay);
    }
  });
};

// Clean up before rendering
removeDebugOverlays();

createRoot(document.getElementById('root')).render(
  <>
    <Canvas />
    <Overlay />
  </>
)
