import { useToast } from "../hooks/useToast"

const Toast = () => {
    //get current toast message from ToastContext
    const {toastMessage} = useToast()

    //if no message, render nothing (dont show any UI)
    if (!toastMessage) {
        return null
    }

    //if message, display it
    return (
        <div className="toast">
            {toastMessage}
        </div>
    )
}

export default Toast