import {useAuthContext} from './useAuthContext'

export const useLogout = () => {
    const {dispatch} = useAuthContext()

    // to log out we need 2 things:
    // change global state in react app and delete json web token in local storage 
    // so no need to send req to server

    const logout = () => {
        //remove user from storage
        localStorage.removeItem('user')

        // dispatch logout action
        dispatch({type: 'LOGOUT'}) //no payload needed to logout (just sets user to null in AuthContext.js line 9)
    }
    return {logout}
}