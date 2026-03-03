export const authFetch = async (url, options = {}, user, logout) => {
    // any headers the caller already provided
    const headers = {
    ...(options.headers || {}),
    }

    // if user logged-in and they have a token
    // attach it as Bearer token so protected backend routes can authorise the request
    if (user && user.token) {
        headers.Authorization = `Bearer ${user.token}`
    }

    // make request with merged headers (already provided + auth)
    const response = await fetch(url, {
        ...options,
        headers,
    })

    // if token expired/invalid, the backend returns 401 & logs user out
    if (response.status === 401) {
        logout()
        return null
    }

    // if user authorised, return the response
    return response
}