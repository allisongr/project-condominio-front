import { useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import './LoadingButton.css'

export default function LoadingButton({ 
  loading, 
  children, 
  onClick, 
  type = 'button',
  className = '',
  disabled = false,
  ...props 
}) {
  const nodeRef = useRef(null)
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`loading-button ${className} ${loading ? 'loading' : ''}`}
      {...props}
    >
      <CSSTransition
        in={loading}
        timeout={300}
        classNames="spinner-fade"
        unmountOnExit
        nodeRef={nodeRef}
      >
        <div ref={nodeRef} className="loading-button-content">
          <div className="spinner">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="40"
                strokeDashoffset="10"
              />
            </svg>
          </div>
          <span className="loading-text">{children}</span>
        </div>
      </CSSTransition>
      {!loading && children}
    </button>
  )
}
