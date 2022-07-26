import React from 'react'
import './CustomButton.css'

const CustomButton = ({text,handler}) => {
  return (
    <div className='customButton' onClick={handler}>{text}</div>
  )
}

export default CustomButton