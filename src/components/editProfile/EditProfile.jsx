import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { deleteUser, getUserById, updateUser } from "../../services/userServices"
import "./EditProfile.css"

export const EditProfile = ({ currentUser }) => {
    const [user, setUser] = useState({})

    const navigate = useNavigate()

    const getAndSetUser = () => {
        getUserById(currentUser.id).then((user) => {
            setUser(user)
        })
    }

    useEffect(() => {
        getAndSetUser()
    }, [])

    const editUser = (evt) => {
        const copy = { ...user } 
        copy[evt.target.id] = evt.target.value
        setUser(copy)
    }
    
    const handleSubmit = (e) => {
        e.preventDefault()
        updateUser(user).then(() => {
            navigate(`/profile`)
        })
    }

    const handleDelete = () => {
        deleteUser(currentUser.id).then(() => {
            localStorage.removeItem("vgc_user")
            navigate("/login", { replace:true })
        })
    }
    
    if(!user.id) {
        return (
            <div>
                 Loading...   
            </div>
        )
    }

    return (
        <main className="page-container">
            <section>
                <h1 className="page-title">Edit User</h1>
                <span className="page-subtitle">Update your profile information below.</span>
                <form className="form-edituser" onSubmit={handleSubmit}>
                <fieldset>
                    <h2>Full Name</h2>
                    <span>Enter your first and last name as you'd like it displayed.</span>
                    <div className="form-group">
                        <input
                            type="text"
                            id="name"
                            value={user.name}
                            onChange={editUser}
                            className="form-name"
                            placeholder={user.name}
                            required
                            autoFocus
                        />
                    </div>
                </fieldset>
                <fieldset>
                    <h2>Email Address</h2>
                    <span>Enter your email address as you'd like it displayed.</span>
                    <div className="form-group">
                        <input
                            type="text"
                            id="email"
                            value={user.email}
                            onChange={editUser}
                            className="form-email"
                            placeholder={user.email}
                            required
                            autoFocus
                        />
                    </div>
                </fieldset>
                <fieldset>
                    <div className="form-group edituser-buttons">
                        <button className="submit-btn" type="submit">
                            Save Changes
                        </button>
                        <button 
                            className="delete-btn" 
                            type="button"
                            onClick={() => handleDelete()}
                        >
                            Delete Profile
                        </button>
                        <button
                            className="btn-go-back"
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </button>
                    </div>
                </fieldset>
                </form>
            </section>
        </main>
    )
}