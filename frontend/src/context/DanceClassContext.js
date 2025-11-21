import { createContext } from "react";

export const DanceClassContext = createContext()

// provide context to application component tree so components can access it & destructure children property
export const DanceClassesContextProvider = ( {children} ) => { // children property represents components/template that the context provider wraps (i.e. the App component in index.js)
    // template to wrap application parts that need access to context (the whole application tree needs access)
    return <DanceClassContext.Provider> 
        { children } 
    </DanceClassContext.Provider>
}