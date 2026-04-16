import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createTeam } from "../../services/teamServices"
import "./NewTeam.css"
import { getAllFormats } from "../../services/formatsServices"

export const NewTeam = ({ currentUser }) => {
    const [allFormats, setAllFormats] = useState([])
    const [newTeam, setNewTeam] = useState({
        name: "",
        userId: currentUser.id,
        formatId: 1
    })

    useEffect(() => {
        getAllFormats().then((formatsArray) => {
            setAllFormats(formatsArray)
        })
    }, [])

    const navigate = useNavigate()

    const updateNewTeam = (evt) => {
        const copy = { ...newTeam }
        copy[evt.target.id] = evt.target.value
        setNewTeam(copy)
    }

    const handleFormatSelect = (evt) => {
        setNewTeam({
        ...newTeam,
        formatId: parseInt(evt.target.value)
        })
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
                    <select className="filter-bar" onChange={handleFormatSelect}>
                    <option value="0">Select a Format</option>
                        {allFormats.map((format) => (
                            <option value={format.id} key={format.id}>{format.name}</option>
                        ))}
                    </select>
                </fieldset>
                <button type="submit" className="btn-create-team">
                    Create Team
                </button>
                </form>
            </section>
        </main>
    )
}