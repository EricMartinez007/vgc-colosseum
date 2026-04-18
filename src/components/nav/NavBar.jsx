import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./NavBar.css"

export const NavBar = ({ currentUser }) => {
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem("vgc_user")
        navigate("/login", { replace: true })
    }

    const closeMenu = () => setMenuOpen(false)

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" onClick={closeMenu}>
                    <img src="/VGC_Colosseum_Final_Logo.png" alt="VGC Colosseum" className="navbar-logo" />
                </Link>
            </div>

            {/* Hamburger button only visible on mobile via CSS */}
            <button
                className={`navbar-hamburger ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen(prev => !prev)}
                aria-label="Toggle navigation"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <div className={`navbar-links ${menuOpen ? "mobile-open" : ""}`}>
                <Link to="/communityteams" onClick={closeMenu}>Community Teams</Link>
                <Link to="/myteams" onClick={closeMenu}>My Teams</Link>
                <Link to="/favorites" onClick={closeMenu}>Favorites</Link>
                <Link to="/newteam" onClick={closeMenu}>New Team</Link>
                <Link to="/damagecalculator" onClick={closeMenu}>Damage Calculator</Link>
                <Link to={`/profile/${currentUser.id}`} onClick={closeMenu}>Profile</Link>
                <button
                    className="logout-btn"
                    onClick={() => { closeMenu(); handleLogout() }}
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}