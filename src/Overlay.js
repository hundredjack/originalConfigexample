import React from 'react'
import { motion } from 'framer-motion'
import { useSnapshot } from 'valtio'
import { Logo } from '@pmndrs/branding'
import { AiOutlineShopping } from 'react-icons/ai'
import { state } from './store'
import ControlPanel from './ControlPanel'

export default function Overlay() {
  const snap = useSnapshot(state)

  return (
    <div className="container">
      <header>
        <Logo width="40" height="40" />
        <div>
          <AiOutlineShopping size="3em" />
        </div>
      </header>

      <ControlPanel />
    </div>
  )
}
