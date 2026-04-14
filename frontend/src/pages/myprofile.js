import { useEffect, useMemo, useState } from "react"
import { useAuthContext } from "../hooks/useAuthContext"
import { useLogout } from "../hooks/useLogout"
import { useToast } from "../hooks/useToast"
import { authFetch } from "../utils/authFetch"
import DanceClassDetails from "../components/DanceClassDetails"

const MyProfile = () => {
  const { user } = useAuthContext()
  const { logout } = useLogout()
  const { showToast } = useToast()

  const [profile, setProfile] = useState(null)

  const [name, setName] = useState("")
  const [aboutMe, setAboutMe] = useState("")

  const [pastClasses, setPastClasses] = useState([])

  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isLoadingPastClasses, setIsLoadingPastClasses] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [profileError, setProfileError] = useState(null)

  //fetch current logged in user's profile
  const fetchProfile = async () => {
    if (!user) {
      return
    }

    setIsLoadingProfile(true)
    setProfileError(null)

    const response = await authFetch("/api/user/me", {}, user, logout)

    if (!response) {
      setIsLoadingProfile(false)
      return
    }

    const json = await response.json()

    if (!response.ok) {
      setProfileError(json.error)
      setIsLoadingProfile(false)
      return
    }

    //store original profile values and prefill the form inputs
    setProfile(json)
    setName(json.name || "")
    setAboutMe(json.aboutMe || "")
    setIsLoadingProfile(false)
  }

  //fetch user's past booked classes
  const fetchPastClasses = async () => {
    if (!user) {
      return
    }

    setIsLoadingPastClasses(true)

    const response = await authFetch("/api/danceclasses/bookings/me/past", {}, user, logout)

    if (!response) {
      setIsLoadingPastClasses(false)
      return
    }

    const json = await response.json()

    if (!response.ok) {
      setIsLoadingPastClasses(false)
      return
    }

    //extract booked class objects from the bookings array
    const pastBookedClasses = json
      .map((booking) => booking.classId)
      .filter((danceclass) => danceclass !== null)

    setPastClasses(pastBookedClasses)
    setIsLoadingPastClasses(false)
  }

  useEffect(() => {
    fetchProfile()
    fetchPastClasses()
  }, [user?.token])

  //check if the user changed any profile field
  const hasChanges = useMemo(() => { //useMemo hook to cache result between re-renders
    if (!profile) {
      return false
    }

    return name !== (profile.name || "") || aboutMe !== (profile.aboutMe || "")
  }, [name, aboutMe, profile])

  //save updated profile details
  const handleSaveChanges = async (e) => {
    e.preventDefault()

    if (!user || !hasChanges) {
      return
    }

    setIsSaving(true)
    setProfileError(null)

    const response = await authFetch("/api/user/me",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, aboutMe }),
      }, 
      user, logout)

    if (!response) {
      setIsSaving(false)
      return
    }

    const json = await response.json()

    if (!response.ok) {
      setProfileError(json.error)
      showToast("Could not save changes")
      setIsSaving(false)
      return
    }

    //update original profile values so the save button becomes disabled again
    setProfile(json)
    setName(json.name || "")
    setAboutMe(json.aboutMe || "")

    showToast("Your changes have been saved")
    setIsSaving(false)
  }

  return (
    <div className="home">
      {/* LEFT COLUMN */}
      <div>
        <div className="hero-panel">
          <p className="hero-kicker">Your account</p>
          <h1>My Profile</h1>
          <p className="hero-text">
            Manage your personal details and view the classes you have attended.
          </p>
        </div>

        <div className="page-panel">
          <h2 className="section-title">Personal Details</h2>
          <p className="section-subtitle">
            Update how your profile appears within your account.
          </p>

          {profileError && <div className="error">{profileError}</div>}

          {isLoadingProfile && (
            <div className="empty-state">Loading profile...</div>
          )}

          {!isLoadingProfile && (
            <form className="profile-form" onSubmit={handleSaveChanges}>
              <label>Email</label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="readonly-input"
              />

              <label>What should we call you?</label>
              <input
                type="text"
                placeholder="Enter a name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />

              <label>About Me</label>
              <textarea
                placeholder="Write a little about yourself"
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                maxLength={200}
                rows={5}
              />

              <p className="char-count">{aboutMe.length}/200</p>

              <div className="form-actions">
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={!hasChanges || isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="sidebar-panel">
        <h3>Past Classes</h3>

        {isLoadingPastClasses && (
          <div className="empty-state">Loading past classes...</div>
        )}

        {!isLoadingPastClasses && pastClasses.length === 0 && (
          <div className="empty-state">
            You have not attended any classes yet.
          </div>
        )}

        {!isLoadingPastClasses &&
          pastClasses.length > 0 &&
          pastClasses.map((danceclass) => (
            <DanceClassDetails
              key={danceclass._id}
              danceclass={danceclass}
              showBook={false}
              showUnbook={false}
            />
          ))}
      </div>
    </div>
  )
}

export default MyProfile