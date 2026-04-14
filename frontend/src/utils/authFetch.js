import { buildApiUrl } from "./api"

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

    // build correct url for local development or deployed production
    const fullUrl = buildApiUrl(url)

    // make request with merged headers (already provided + auth)
    const response = await fetch(fullUrl, {
        ...options,
        headers,
    })

    // if token expired/invalid, the backend returns 401 & logs user out
    if (response.status === 401) {
        if (logout) {
            logout()
        }
        return null
    }

    // if user authorised, return the response
    return response
}