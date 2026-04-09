import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { deleteTeam, getPokemonByTeamId, getTeamById, updateTeam } from "../../services/teamServices"

export const EditTeam = ({ currentUser }) => {
    const [team, setTeam] = useState({})
    const [pokemon, setPokemon] = useState([])
    

    const navigate = useNavigate()

    const { teamId } = useParams()

    const getAndSetTeamAndPokemon = () => {
        getTeamById(teamId).then((team) => {
            setTeam(team)
        })
        getPokemonByTeamId(teamId).then((pokemonArray) => {
            setPokemon(pokemonArray)
        })
    } 

    useEffect(() => {
        getAndSetTeamAndPokemon()
    }, [])

    const handleTeamNameChange = (evt) => {
        const copy = { ...team }
        copy[evt.target.id] = evt.target.value
        setTeam(copy)
    }

    const handleDeleteTeam = () => {
        deleteTeam(team).then(() => {
            navigate(`/myteams`)
        })
    }

    const handleSubmit = (evt) => {
        evt.preventDefault()
        updateTeam(team).then(() => {
            navigate(`/myteams`)
        })
    }
    
    
    //pt in the map method stand for pokemonTeam the objs im fetching belong to this array in which im expanding pokemon to access the image and name
    return (
        <div className="page-container">
            <h1 className="page-title">Edit ({team.name})</h1>
            <span className="page-subtitle">Make edits to your competitive team!</span>
            <form className="form-newteam" onSubmit={handleSubmit}>
                <h2>Team Name</h2>
                <fieldset>
                <div className="form-group">
                    <input
                            type="text"
                            id="name"
                            value={team.name}
                            onChange={handleTeamNameChange}
                            className="form-teamname"
                            placeholder="Change your team's name"
                            required
                            autoFocus
                    />
                </div>
                </fieldset>
                <div className="btn-container">
                    <button type="submit" className="btn-create-team">
                        Save Team
                    </button>
                    <button 
                        type ="button" 
                        className="btn-delete-team"
                        onClick={handleDeleteTeam}
                    >
                        Delete Team
                    </button>
                </div>
            </form>
            <div className="edit-team-layout">
                <section className="team-section">
                    <h2>Pokemon</h2>
                    <div className="pokemon-list">
                        {pokemon.map((pokemonTeam) => (
                            <div 
                                key={pokemonTeam.id} 
                                className="pokemon-card" 
                                onClick={() => navigate(`/editpokemon/${teamId}/${pokemonTeam.id}`)}
                            >
                                <img src={pokemonTeam.pokemon.imageUrl} alt={pokemonTeam.pokemon.name} />
                                <span>{pokemonTeam.pokemon.name}</span>
                            </div>
                        ))}
                    </div>
                    <button
                        className="btn-add-pokemon"
                        onClick={() => navigate(`/addpokemon/${teamId}`)}
                    >
                        Add Pokémon
                    </button>
                </section>
            </div>
        </div>  
    )
}