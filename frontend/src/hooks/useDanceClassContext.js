import { DanceClassContext } from "../context/DanceClassContext";
import { useContext } from "react";

export const useDanceClassesContext = () => {
    const context = useContext(DanceClassContext) //return value of danceclass context

    if (!context) { //checks if in scope of context (so not used outside of the root app component)
        throw Error('useDanceClassesContext must be used inside DanceClassContextProvider')
    }

    return context
}