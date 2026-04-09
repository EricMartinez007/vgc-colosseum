import { Link, useNavigate } from "react-router-dom"
import "./NavBar.css"

export const NavBar = () => {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem("vgc_user")
        navigate("/login", { replace:true })
    }


    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <img src="/VGC_Colosseum_Final_Logo.png" alt="VGC Colosseum" className="navbar-logo" />
                </Link>
            </div>
            <div className="navbar-links">
                <Link to="/communityteams">Community Teams</Link>
                <Link to="/myteams">My Teams</Link>
                <Link to="/newteam">New Team</Link>
                <Link to="/profile">Profile</Link>
                <button 
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}