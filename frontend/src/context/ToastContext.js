import { createContext, useState } from "react"

// create context object that will hold toast data + functions (components can read from this context using the useToast() hook)
export const ToastContext = createContext()

export const ToastContextProvider = ({ children }) => {

    // this state stores the message that will be shown in the toast
    // if its an empty string, no toast is displayed
    const [toastMessage, setToastMessage] = useState("")

    //function to show toast message
    const showToast = (message) => {
        //set toast mssg so toast component can render it
        setToastMessage(message)

        // clear after 3 seconds
        setTimeout(() => {
            setToastMessage("")
        }, 3000)
    }
    
    //provide current mssg & showToast func to any component wrapped inside this provider
    return (
        <ToastContext.Provider value={{ toastMessage, showToast }}>
            {children}
        </ToastContext.Provider>
    )
}