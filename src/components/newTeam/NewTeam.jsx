import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createTeam } from "../../services/teamServices"
import "./NewTeam.css"
import { getAllFormats } from "../../services/formatsServices"
import { getPokemon } from "../../services/pokemonServices"

export const NewTeam = ({ currentUser }) => {
    const [allFormats, setAllFormats] = useState([])
    const [mascot, setMascot] = useState({})
    const [newTeam, setNewTeam] = useState({
        name: "",
        userId: currentUser.id,
        formatId: 1
    })

    useEffect(() => {
        getAllFormats().then((formatsArray) => {
            setAllFormats(formatsArray)
        })
        getPokemon().then((pokemonArray) => {
            const random = pokemonArray[Math.floor(Math.random() * pokemonArray.length)]
            setMascot(random)
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
            <h1 className="page-title">Create a New Team</h1>
            <span className="page-subtitle">Build a new competitive team!</span>
            <div className="newteam-layout">
                {/* Mascot Section */}
                {mascot.id && (
                    <div className="newteam-mascot">
                        <img
                            className="mascot-sprite"
                            src={mascot.imageUrl}
                            alt={mascot.name}
                        />
                        <p className="mascot-name">{mascot.name}</p>
                        <p className="mascot-flavor">Your partner for today!</p>
                        <p className="mascot-tip">💡 Every champion starts with a single team!</p>
                    </div>
                )}

                {/* Form Section */}
                <form className="form-newteam" onSubmit={handleSubmit}>
                    <div className="newteam-banner">
                        <h2 className="newteam-banner-title">⚔️ New Team</h2>
                    </div>
                    <fieldset>
                        <h2 className="new-form-title">Team Name</h2>
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
                        <div className="format-select">
                            <h2 className="new-form-title">Format</h2>
                            <select className="filter-bar" onChange={handleFormatSelect}>
                                <option value="0">Select a Format</option>
                                {allFormats.map((format) => (
                                    <option value={format.id} key={format.id}>{format.name}</option>
                                ))}
                            </select>
                        </div>
                    </fieldset>
                    <button type="submit" className="btn-create-team">
                        Create Team
                    </button>
                </form>
            </div>
        </main>
    )
}