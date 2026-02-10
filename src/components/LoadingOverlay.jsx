import { useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import './LoadingOverlay.css'

export default function LoadingOverlay({ isLoading, message = 'Cargando...' }) {
  const nodeRef = useRef(null)
  
  return (
    <CSSTransition
      in={isLoading}
      timeout={300}
      classNames="overlay"
      unmountOnExit
      nodeRef={nodeRef}
    >
      <div ref={nodeRef} className="loading-overlay">
        <div className="loading-overlay-content">
          <div className="loading-spinner-large">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r="25"
                stroke="#2d7a6a"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="120"
                strokeDashoffset="30"
              />
            </svg>
          </div>
          <p className="loading-message">{message}</p>
        </div>
      </div>
    </CSSTransition>
  )
}
