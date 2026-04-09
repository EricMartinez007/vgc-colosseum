import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getUserById } from "../../services/userServices"
import { getTeamsByUserId } from "../../services/teamServices"

export const Profile = ({ currentUser }) => {
    const [user, setUser] = useState({})
    const [teams, setTeams] = useState([])

    const navigate = useNavigate()

    const getAndSetUserAndTeams = () =>{
        getUserById(currentUser.id).then((userObj) => {
            setUser(userObj)
        })
        getTeamsByUserId(currentUser.id).then((teams) => {
            setTeams(teams)
        })
    }

    useEffect(() => {
            getAndSetUserAndTeams()
    }, [])
    
    if (!user.id) {
        return (
            <div>
                Loading...   
            </div>
        )
    }

    return (
        <div className="page-container">
            <h1 className="page-title">Profile</h1>
            <section className="profile-section">
                <h2 className="profile-name">{user.name}</h2>
                <div className="profile-info">
                    <span className="profile-teams">Teams Made: {teams.length}</span>
                    <span className="profile-pokemon">Email: {user.email}</span>
                </div>
                <div className="profile-buttons">
                    <button 
                        className="edit-btn"
                        type="button"
                        onClick={() => navigate(`/editprofile`)}
                    >
                        Edit Profile
                    </button> 
                </div>
            </section>
        </div>
    )
}