import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createTeam } from "../../services/teamServices"

export const NewTeam = ({ currentUser }) => {
    const [newTeam, setNewTeam] = useState({
        name: "",
        userId: currentUser.id,
        formatId: 1
    })

    const navigate = useNavigate()

    const updateNewTeam = (evt) => {
        const copy = { ...newTeam }
        copy[evt.target.id] = evt.target.value
        setNewTeam(copy)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        createTeam(newTeam).then((createdTeam) => {
            navigate(`/editteam/${createdTeam.id}`)
        })
    }
    
    
    return (
        <main className="page-container">
            <section>
                <h1 className="page-title">Create a New Team</h1>
                <span className="page-subtitle">Build a new competitive team!</span>
                <form className="form-newteam" onSubmit={handleSubmit}>
                <h2>Team Name</h2>
                <fieldset>
                    <div className="form-group">
                        <input
                            type="text"
                            id="name"
                            value={newTeam.name}
                            onChange={updateNewTeam}
                            className="form-teamname"
                            placeholder="Enter a team name"
                            required
                            autoFocus
                        />
                    </div>
                </fieldset>
                <button type="submit" className="btn-create-team">
                    Create Team
                </button>
                </form>
            </section>
        </main>
    )
}