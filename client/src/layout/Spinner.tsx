import { CircularProgress, Typography } from '@mui/material';
import React from 'react'

interface ISpinnerProps {
  // eslint-disable-next-line react/require-default-props
  color?: 'primary' | 'secondary' | 'inherit';
}

const Spinner: React.FC<ISpinnerProps> = ({ color = 'primary' }) => {
  return (
    <div className="loader-wrapper">
      <CircularProgress color={color} thickness={6} size={44} />
      <Typography variant="body1" color="primary" className="mt-1 font-MaderaMedium ml-4p">
        Loading...
      </Typography>
    </div>
  )
}

export default Spinner
