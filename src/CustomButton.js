import React from 'react'
import { useSnapshot } from 'valtio'
import { state } from './store'

export const CustomButton = ({ type, title, customStyles, handleClick }) => {
  const snap = useSnapshot(state)
  
  const generateStyle = (type) => {
    if (type === 'filled') {
      return {
        backgroundColor: snap.selectedColor,
        color: '#fff'
      }
    } else if (type === 'outline') {
      return {
        borderWidth: '1px',
        borderColor: snap.selectedColor,
        color: snap.selectedColor
      }
    }
  }
  
  return (
    <button
      className={`px-2 py-1.5 flex-1 rounded-md ${customStyles}`}
      style={generateStyle(type)}
      onClick={handleClick}
    >
      {title}
    </button>
  )
}
