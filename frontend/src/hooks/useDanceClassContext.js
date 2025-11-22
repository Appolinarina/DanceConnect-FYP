import { DanceClassContext } from "../context/DanceClassContext";
import { useContext } from "react";

export const useDanceClassesContext = () => {
    const context = useContext(DanceClassContext) //return value of danceclass context

    if (!context) {
        throw Error('useDanceClassContext must be used inside DanceClassesContextProvider')
    }

    return context
}