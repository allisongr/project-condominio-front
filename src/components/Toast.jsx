import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './Toast.css'

export default function Toast() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      className="custom-toast-container"
    />
  )
}
