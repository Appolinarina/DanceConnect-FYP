const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || ""

// build full backend url in production
// keep relative url locally so React proxy still works
export const buildApiUrl = (path) => {
    if (!path.startsWith("/")) {
        return `${API_BASE_URL}/${path}`
    }

    return `${API_BASE_URL}${path}`
}