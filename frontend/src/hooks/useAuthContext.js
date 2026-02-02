import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

export const useAuthContext = () => {
    const context = useContext(AuthContext) //return value of auth context

    if (!context) { //checks if in scope of context (so not used outside of the root app component)
        throw Error('useAuthContext must be used inside AuthContextProvider')
    }

    return context
}