import './Spinner.css'

export default function Spinner({ size = 'medium' }) {
  const sizes = {
    small: 20,
    medium: 40,
    large: 60,
  }

  const spinnerSize = sizes[size] || sizes.medium

  return (
    <div className={`spinner spinner-${size}`}>
      <svg width={spinnerSize} height={spinnerSize} viewBox="0 0 60 60">
        <circle
          cx="30"
          cy="30"
          r="25"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="120"
          strokeDashoffset="30"
        />
      </svg>
    </div>
  )
}
