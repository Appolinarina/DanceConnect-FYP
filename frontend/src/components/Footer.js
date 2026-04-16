import { useState } from "react"
import InfoModal from "./InfoModal"

const Footer = () => {
    const [openModal, setOpenModal] = useState(null) //stores which footer modal is currently open

    return (
        <>
            <footer className="site-footer">
                <div className="site-footer-content">
                    <div className="site-footer-links">
                        <button
                            type="button"
                            className="footer-link-btn"
                            onClick={() => setOpenModal("about")}
                        >
                            About
                        </button>

                        <button
                            type="button"
                            className="footer-link-btn"
                            onClick={() => setOpenModal("terms")}
                        >
                            Terms, Privacy and Payments
                        </button>
                    </div>

                    <p className="site-footer-copy">© 2026 DanceConnect</p>
                </div>
            </footer>

            {/* about modal */}
            <InfoModal
                isOpen={openModal === "about"}
                onClose={() => setOpenModal(null)}
                title="About DanceConnect"
            >
                <p>
                    DanceConnect is a platform designed to make it easier for dancers to discover classes and for teachers to share them in one place. The idea behind the platform is to reduce the difficulty of relying only on social media or word of mouth, where class announcements can easily be missed.
                </p>

                <p>
                    By allowing users to browse, create, and book dance classes through one system, DanceConnect aims to make the process clearer and more accessible for both organisers and participants. The platform is intended to support a wider dance community by improving visibility, convenience, and ease of access.
                </p>
            </InfoModal>

            {/* terms / privacy / payments modal */}
            <InfoModal
                isOpen={openModal === "terms"}
                onClose={() => setOpenModal(null)}
                title="Terms, Privacy and Payments"
            >
                <h4>Terms and Conditions</h4>
                <p>
                    DanceConnect is a platform for sharing and discovering dance classes. Users who create class listings are responsible for ensuring that the information they provide is accurate and up to date. Users who book classes are responsible for checking the class details before attending. DanceConnect provides the platform for visibility and booking, but responsibility for the running of each class remains with the organiser.
                </p>

                <h4>Privacy</h4>
                <p>
                    User information is stored only for the purpose of operating the platform and supporting features such as login, profile management, class creation, and bookings. Personal data is not intended to be shared publicly beyond the information that users choose to include in their profile or class listings. Reasonable care is taken to store data securely.
                </p>

                <h4>Payments</h4>
                <p>
                    DanceConnect does not currently process payments directly through the platform. Any payments for classes are expected to be arranged separately, for example through third-party payment apps or directly with the class organiser. Users should confirm payment arrangements with the organiser where necessary.
                </p>
            </InfoModal>
        </>
    )
}

export default Footer