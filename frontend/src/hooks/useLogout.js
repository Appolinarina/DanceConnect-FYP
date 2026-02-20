import {useAuthContext} from './useAuthContext'
import {useDanceClassesContext} from './useDanceClassContext'

export const useLogout = () => {
    const {dispatch} = useAuthContext()
    const {dispatch: danceclassDispatch} = useDanceClassesContext() //have to rename dispatch to danceclassDispatch 

    // to log out we need 2 things:
    // change global state in react app and delete json web token in local storage 
    // so no need to send req to server

    const logout = () => {
        //remove user from storage
        localStorage.removeItem('user')

        // dispatch logout action
        dispatch({type: 'LOGOUT'}) //no payload needed to logout (just sets user to null in AuthContext.js line 9)
        danceclassDispatch({type: 'SET_DANCECLASSES', payload: null}) //when user log out, set danceclasses to null to remove the user class list from UI
    }
    return {logout}
}