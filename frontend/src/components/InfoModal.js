const InfoModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) {
        return null //do not render modal if not open
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="info-modal" onClick={(e) => e.stopPropagation()}>
                <div className="info-modal-header">
                    <h3>{title}</h3>

                    <button
                        type="button"
                        className="info-modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                <div className="info-modal-body">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default InfoModal