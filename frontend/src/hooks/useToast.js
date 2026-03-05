import { useContext } from "react"
import { ToastContext } from "../context/ToastContext"

// custom hook for easier toastcontext access (instead of importing usecontext and toastcontext everywhere)
export const useToast = () => {
    return useContext(ToastContext)
}