import React from 'react'
import './CustomButton.css'

const CustomButton = ({text,handler}) => {
  return (
    <button className='customButton' onClick={handler}>{text}</button>
  )
}

export default CustomButton